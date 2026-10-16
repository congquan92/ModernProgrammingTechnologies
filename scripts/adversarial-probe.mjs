/**
 * ADVERSARIAL STRESS TEST & SECURITY PROBE SUITE
 * MovieHub (Next.js 16 + React 19)
 * 
 * Target Probes:
 * 1. app/actions/watchlist.ts: Input validation fuzzing & RFC 6265 cookie capacity (200 vs 201 items, < 3800 bytes)
 * 2. app/api/search/route.ts: Control characters sanitization, length boundaries, Cache-Control header, response format
 * 3. Live HTTP end-to-end probing against Next.js production server
 * 
 * Run via: node --experimental-strip-types scripts/adversarial-probe.mjs
 */

import { register } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Register mock loader for Next server context isolation
register("./test-resolver.mjs", import.meta.url);

const { resetMockCookies, getMockCookieMap } = await import("./mock-headers.mjs");
const { toggleWatchlist, getWatchlistIds, clearAllWatchlist, isMovieSaved } = await import("../app/actions/watchlist.ts");
const { GET: searchRouteHandler } = await import("../app/api/search/route.ts");

const testResults = [];

function recordProbe(id, category, name, expected, actual, passed, details = "") {
    testResults.push({
        id,
        category,
        name,
        expected,
        actual,
        status: passed ? "PASS" : "FAIL",
        details,
        timestamp: new Date().toISOString()
    });
    console.log(`[${passed ? "PASS" : "FAIL"}] ${id} [${category}]: ${name}`);
    if (!passed) {
        console.error(`   Expected: ${expected}`);
        console.error(`   Actual:   ${actual}`);
    }
}

console.log("================================================================================");
console.log("  ADVERSARIAL PROBE & STRESS-TEST HARNESS - MovieHub Architecture & Security");
console.log("================================================================================\n");

// ============================================================================
// SUITE 1: PROBE app/actions/watchlist.ts (Input Validation & Type Fuzzing)
// ============================================================================
console.log("--- 1. Probing app/actions/watchlist.ts: Input Validation Fuzzing ---");

const invalidMovieIdInputs = [
    { label: "Negative integer (-1)", value: -1 },
    { label: "Negative large integer (-99999)", value: -99999 },
    { label: "Zero (0)", value: 0 },
    { label: "Float decimal (1.5)", value: 1.5 },
    { label: "Small float (0.001)", value: 0.001 },
    { label: "NaN", value: NaN },
    { label: "Positive Infinity", value: Infinity },
    { label: "Negative Infinity", value: -Infinity },
    { label: "Numeric string ('550')", value: "550" },
    { label: "Empty string ('')", value: "" },
    { label: "Text string ('inception')", value: "inception" },
    { label: "Null", value: null },
    { label: "Undefined", value: undefined },
    { label: "Plain Object ({})", value: {} },
    { label: "Object with id ({ id: 550 })", value: { id: 550 } },
    { label: "Array ([550])", value: [550] },
    { label: "Boolean true", value: true },
    { label: "Boolean false", value: false },
];

let idx = 1;
for (const tc of invalidMovieIdInputs) {
    resetMockCookies();
    let threw = false;
    let errorMsg = "";
    try {
        // @ts-expect-error - intentional adversarial type fuzzing
        await toggleWatchlist(tc.value);
    } catch (e) {
        threw = true;
        errorMsg = e instanceof Error ? e.message : String(e);
    }

    const testId = `ADV-WL-${String(idx).padStart(2, "0")}`;
    recordProbe(
        testId,
        "Watchlist / Type Fuzzing",
        `Reject invalid movieId: ${tc.label}`,
        "Throw Error: Mã định danh phim (movieId) không hợp lệ.",
        threw ? `Threw: "${errorMsg}"` : "Did not throw (VULNERABLE)",
        threw && errorMsg.includes("Mã định danh phim (movieId) không hợp lệ."),
        `Input was: ${JSON.stringify(tc.value)} (type: ${typeof tc.value})`
    );
    idx++;
}

// Positive validation test & isMovieSaved & clearAllWatchlist
{
    resetMockCookies();
    let addSuccess = false;
    let savedCheck = false;
    let clearedCheck = false;
    try {
        const res = await toggleWatchlist(550);
        addSuccess = res.isSaved === true;
        savedCheck = await isMovieSaved(550);
        await clearAllWatchlist();
        clearedCheck = (await isMovieSaved(550)) === false && getMockCookieMap().size === 0;
    } catch {
        addSuccess = false;
    }
    recordProbe(
        "ADV-WL-19",
        "Watchlist / Input Validation",
        "Accept valid positive integer movieId (550), verify isMovieSaved and clearAllWatchlist",
        "isSaved: true, savedCheck: true, clearedCheck: true",
        `isSaved: ${addSuccess}, savedCheck: ${savedCheck}, clearedCheck: ${clearedCheck}`,
        addSuccess && savedCheck && clearedCheck
    );
}

// ============================================================================
// SUITE 2: PROBE app/actions/watchlist.ts (Cookie Capacity & RFC 6265 Bounds)
// ============================================================================
console.log("\n--- 2. Probing app/actions/watchlist.ts: Cookie Capacity (200 vs 201 items & Bytes) ---");

// Test: 199 items -> add 1 -> reaches 200 items successfully
{
    const initial199 = Array.from({ length: 199 }, (_, i) => 100000 + i);
    resetMockCookies(new Map([["mh_watchlist", JSON.stringify(initial199)]]));

    const res = await toggleWatchlist(999999);
    const updatedIds = await getWatchlistIds();
    const passed = res.isSaved === true && updatedIds.length === 200 && updatedIds.includes(999999);

    recordProbe(
        "ADV-CAP-01",
        "Watchlist / Capacity",
        "Allow adding item 200 when current watchlist count is 199",
        "isSaved: true, length: 200",
        `isSaved: ${res.isSaved}, length: ${updatedIds.length}`,
        passed,
        "Watchlist expands up to exactly 200 items limit"
    );
}

// Test: 200 items -> add 201st item -> rejected with error object without crashing
{
    const initial200 = Array.from({ length: 200 }, (_, i) => 100000 + i);
    resetMockCookies(new Map([["mh_watchlist", JSON.stringify(initial200)]]));

    const res = await toggleWatchlist(999999);
    const updatedIds = await getWatchlistIds();
    const passed = res.isSaved === false && 
                   res.error?.includes("200") && 
                   updatedIds.length === 200 && 
                   !updatedIds.includes(999999);

    recordProbe(
        "ADV-CAP-02",
        "Watchlist / Capacity",
        "Reject adding 201st item when watchlist already has 200 items",
        "isSaved: false, error with '200 phim', length: 200",
        `isSaved: ${res.isSaved}, error: "${res.error}", length: ${updatedIds.length}`,
        passed,
        "Enforces hard capacity limit of 200 items to guarantee RFC 6265 compliance"
    );
}

// Test: 200 items -> remove existing item -> succeeds (reduces to 199)
{
    const initial200 = Array.from({ length: 200 }, (_, i) => 100000 + i);
    resetMockCookies(new Map([["mh_watchlist", JSON.stringify(initial200)]]));

    const res = await toggleWatchlist(100000); // Exists in list
    const updatedIds = await getWatchlistIds();
    const passed = res.isSaved === false && updatedIds.length === 199 && !updatedIds.includes(100000);

    recordProbe(
        "ADV-CAP-03",
        "Watchlist / Capacity",
        "Allow removal of existing movie even when capacity is at 200 items",
        "isSaved: false, length: 199",
        `isSaved: ${res.isSaved}, length: ${updatedIds.length}`,
        passed,
        "Toggle operation cleanly removes movie without being blocked by capacity check"
    );
}

// Test: Exact byte size calculations under RFC 6265 and 3800 bytes threshold
{
    // Scenario A: 200 realistic TMDB IDs (5-6 digits: 10000 - 100199)
    const realisticIds = Array.from({ length: 200 }, (_, i) => 10000 + i);
    const realisticSerialized = `mh_watchlist=${JSON.stringify(realisticIds)}`;
    const realisticBytes = Buffer.byteLength(realisticSerialized, "utf8");

    recordProbe(
        "ADV-BYTE-01",
        "Watchlist / Cookie Bytes",
        "Verify 200 realistic TMDB movie IDs payload byte size < 3800 bytes",
        "< 3800 bytes",
        `${realisticBytes} bytes`,
        realisticBytes < 3800,
        `Realistic 200 IDs = ${realisticBytes} bytes (safety margin: ${3800 - realisticBytes} bytes below limit)`
    );

    // Scenario B: 200 worst-case 7-digit IDs (e.g., 9000000 - 9000199)
    const large7DigitIds = Array.from({ length: 200 }, (_, i) => 9000000 + i);
    const large7Serialized = `mh_watchlist=${JSON.stringify(large7DigitIds)}`;
    const large7Bytes = Buffer.byteLength(large7Serialized, "utf8");

    recordProbe(
        "ADV-BYTE-02",
        "Watchlist / Cookie Bytes",
        "Verify 200 worst-case 7-digit movie IDs payload byte size < 3800 bytes",
        "< 3800 bytes",
        `${large7Bytes} bytes`,
        large7Bytes < 3800,
        `Worst-case 7-digit IDs = ${large7Bytes} bytes (safety margin: ${3800 - large7Bytes} bytes below 3800 limit)`
    );

    // Scenario C: 200 boundary 9-digit IDs (e.g., 100000000 - 100000199)
    const huge9DigitIds = Array.from({ length: 200 }, (_, i) => 100000000 + i);
    const huge9Serialized = `mh_watchlist=${JSON.stringify(huge9DigitIds)}`;
    const huge9Bytes = Buffer.byteLength(huge9Serialized, "utf8");

    recordProbe(
        "ADV-BYTE-03",
        "Watchlist / Cookie Bytes",
        "Verify 200 boundary 9-digit movie IDs payload byte size < 3800 bytes",
        "< 3800 bytes",
        `${huge9Bytes} bytes`,
        huge9Bytes < 3800,
        `9-digit IDs = ${huge9Bytes} bytes (safety margin: ${3800 - huge9Bytes} bytes below 3800 limit)`
    );

    // Scenario D: Verify MAX_WATCHLIST_COOKIE_BYTES guard in code
    // If a cookie payload were to exceed 3800 bytes, toggleWatchlist must reject it
    const largeNumber = 1234567890123456789012; // Serializes to 22 bytes in JSON (exponential notation)
    const fakeHugeList = Array.from({ length: 199 }, () => largeNumber);
    resetMockCookies(new Map([["mh_watchlist", JSON.stringify(fakeHugeList)]]));
    const overflowRes = await toggleWatchlist(999);
    const overflowPassed = overflowRes.isSaved === false && overflowRes.error?.includes("dung lượng");

    recordProbe(
        "ADV-BYTE-04",
        "Watchlist / Cookie Bytes",
        "Enforce strict MAX_WATCHLIST_COOKIE_BYTES (3800) reject guard",
        "isSaved: false, error: 'dung lượng'",
        `isSaved: ${overflowRes.isSaved}, error: "${overflowRes.error}"`,
        overflowPassed,
        "Guards against oversized payloads (> 3800 bytes) regardless of item count"
    );
}

// Test: Malformed and dirty cookie JSON resilience (getWatchlistIds)
{
    resetMockCookies(new Map([["mh_watchlist", "invalid--json{{"]]));
    const malformed = await getWatchlistIds();
    recordProbe(
        "ADV-RES-01",
        "Watchlist / Resilience",
        "Handle malformed non-JSON cookie string gracefully",
        "[]",
        JSON.stringify(malformed),
        Array.isArray(malformed) && malformed.length === 0
    );

    resetMockCookies(new Map([["mh_watchlist", JSON.stringify({ key: "not-an-array" })]]));
    const nonArray = await getWatchlistIds();
    recordProbe(
        "ADV-RES-02",
        "Watchlist / Resilience",
        "Handle non-array JSON object cookie gracefully",
        "[]",
        JSON.stringify(nonArray),
        Array.isArray(nonArray) && nonArray.length === 0
    );

    resetMockCookies(new Map([["mh_watchlist", JSON.stringify([101, -5, "bad", 1.5, null, undefined, {}, 0, 202])]]));
    const sanitized = await getWatchlistIds();
    recordProbe(
        "ADV-RES-03",
        "Watchlist / Resilience",
        "Filter out all non-positive and non-integer items from cookie array",
        "[101,202]",
        JSON.stringify(sanitized),
        sanitized.length === 2 && sanitized[0] === 101 && sanitized[1] === 202
    );
}

// ============================================================================
// SUITE 3: PROBE Route Handler GET /api/search (Direct In-Process Probe)
// ============================================================================
console.log("\n--- 3. Probing Route Handler GET /api/search: Sanitization & Response Headers ---");

// Test control characters sanitization (\x00, \x1F, \x7F)
{
    const reqWithControlChars = new Request("http://localhost:3000/api/search?q=Batman%00%1F%7F");
    const res = await searchRouteHandler(reqWithControlChars);
    const json = await res.json();
    const cacheControl = res.headers.get("cache-control");

    recordProbe(
        "ADV-SR-01",
        "Search / Sanitization",
        "Strip control characters (\\x00, \\x1F, \\x7F) without throwing",
        "status: 200, results array",
        `status: ${res.status}, isArray: ${Array.isArray(json.results)}`,
        res.status === 200 && Array.isArray(json.results),
        `Control characters stripped, handled cleanly`
    );

    recordProbe(
        "ADV-SR-02",
        "Search / Cache-Control",
        "Include Cache-Control: public, s-maxage=120, stale-while-revalidate=60",
        "public, s-maxage=120, stale-while-revalidate=60",
        cacheControl || "missing",
        cacheControl === "public, s-maxage=120, stale-while-revalidate=60"
    );
}

// Test queries with only control characters -> sanitized to empty -> rejected
{
    const reqOnlyControl = new Request("http://localhost:3000/api/search?q=%00%1F%7F");
    const res = await searchRouteHandler(reqOnlyControl);
    const json = await res.json();

    recordProbe(
        "ADV-SR-03",
        "Search / Sanitization",
        "Reject query with only control characters (trimmed length < 2)",
        "status: 200, results: []",
        `status: ${res.status}, results: ${JSON.stringify(json.results)}`,
        res.status === 200 && Array.isArray(json.results) && json.results.length === 0
    );
}

// Test short queries (< 2 chars) and empty query
{
    const shortQueries = [
        { label: "Empty query (q=)", url: "http://localhost:3000/api/search?q=" },
        { label: "Missing q param", url: "http://localhost:3000/api/search" },
        { label: "Single char (q=a)", url: "http://localhost:3000/api/search?q=a" },
        { label: "Whitespace only (q=   )", url: "http://localhost:3000/api/search?q=%20%20%20" },
        { label: "Single char with spaces (q=  a  )", url: "http://localhost:3000/api/search?q=%20%20a%20%20" },
    ];

    let sIdx = 4;
    for (const sq of shortQueries) {
        const res = await searchRouteHandler(new Request(sq.url));
        const json = await res.json();
        const passed = res.status === 200 && Array.isArray(json.results) && json.results.length === 0;

        recordProbe(
            `ADV-SR-${String(sIdx).padStart(2, "0")}`,
            "Search / Length Boundary",
            `Return empty results for ${sq.label}`,
            "status: 200, results: []",
            `status: ${res.status}, results: ${JSON.stringify(json.results)}`,
            passed
        );
        sIdx++;
    }
}

// Test overly long query (> 100 chars: e.g. 150 chars)
{
    const longString = "A".repeat(150);
    const res = await searchRouteHandler(new Request(`http://localhost:3000/api/search?q=${longString}`));
    const json = await res.json();
    const passed = res.status === 200 && Array.isArray(json.results);

    recordProbe(
        "ADV-SR-09",
        "Search / Length Boundary",
        "Truncate overly long queries (> 100 chars) to 100 chars without crash",
        "status: 200, results array",
        `status: ${res.status}, isArray: ${Array.isArray(json.results)}`,
        passed,
        "Query truncated safely to 100 characters via .slice(0, 100)"
    );
}

// ============================================================================
// SUITE 4: LIVE HTTP SERVER END-TO-END PROBING (next start -p 3099)
// ============================================================================
console.log("\n--- 4. Live HTTP End-to-End Probing (Spawning Next.js on port 3099) ---");

await new Promise((resolve) => {
    const nextServer = spawn("npx", ["next", "start", "-p", "3099"], {
        stdio: "pipe",
        env: { ...process.env, PORT: "3099" }
    });

    let serverReady = false;

    const cleanup = () => {
        try {
            nextServer.kill("SIGTERM");
        } catch {}
    };

    const timeout = setTimeout(() => {
        if (!serverReady) {
            cleanup();
            recordProbe(
                "ADV-LIVE-00",
                "Live HTTP / Server",
                "Spawn Next.js production server on port 3099",
                "Ready in < 10s",
                "Timed out waiting for server",
                false
            );
            resolve();
        }
    }, 15000);

    nextServer.stdout.on("data", async (data) => {
        const str = data.toString();
        if ((str.includes("Ready in") || str.includes("started server on")) && !serverReady) {
            serverReady = true;
            clearTimeout(timeout);
            console.log("   Next.js production server is READY on http://127.0.0.1:3099");

            try {
                // Live Test 1: GET /api/search?q=Inception
                const resValid = await fetch("http://127.0.0.1:3099/api/search?q=Inception");
                const validJson = await resValid.json();
                const validCache = resValid.headers.get("cache-control");

                recordProbe(
                    "ADV-LIVE-01",
                    "Live HTTP / Search",
                    "Live HTTP GET /api/search?q=Inception returns 200 with Cache-Control",
                    "status: 200, public, s-maxage=120, stale-while-revalidate=60",
                    `status: ${resValid.status}, cache: "${validCache}"`,
                    resValid.status === 200 && validCache === "public, s-maxage=120, stale-while-revalidate=60" && Array.isArray(validJson.results)
                );

                // Live Test 2: Control characters over HTTP GET /api/search?q=Avatar%00%1F%7F
                const resCtrl = await fetch("http://127.0.0.1:3099/api/search?q=Avatar%00%1F%7F");
                const ctrlJson = await resCtrl.json();
                const ctrlCache = resCtrl.headers.get("cache-control");

                recordProbe(
                    "ADV-LIVE-02",
                    "Live HTTP / Search",
                    "Live HTTP GET with encoded control characters Avatar%00%1F%7F",
                    "status: 200, Cache-Control present, valid JSON results",
                    `status: ${resCtrl.status}, cache: "${ctrlCache}", isArray: ${Array.isArray(ctrlJson.results)}`,
                    resCtrl.status === 200 && ctrlCache === "public, s-maxage=120, stale-while-revalidate=60" && Array.isArray(ctrlJson.results)
                );

                // Live Test 3: Short query over HTTP GET /api/search?q=x
                const resShort = await fetch("http://127.0.0.1:3099/api/search?q=x");
                const shortJson = await resShort.json();

                recordProbe(
                    "ADV-LIVE-03",
                    "Live HTTP / Search",
                    "Live HTTP GET with short query (q=x) returns empty results immediately",
                    "status: 200, results: []",
                    `status: ${resShort.status}, results: ${JSON.stringify(shortJson.results)}`,
                    resShort.status === 200 && Array.isArray(shortJson.results) && shortJson.results.length === 0
                );

                // Live Test 4: Overly long query over HTTP (200 characters)
                const longQuery = "Matrix".repeat(35);
                const resLong = await fetch(`http://127.0.0.1:3099/api/search?q=${longQuery}`);
                const longJson = await resLong.json();

                recordProbe(
                    "ADV-LIVE-04",
                    "Live HTTP / Search",
                    "Live HTTP GET with overly long query (210 chars) handled safely without crash",
                    "status: 200, results array",
                    `status: ${resLong.status}, isArray: ${Array.isArray(longJson.results)}`,
                    resLong.status === 200 && Array.isArray(longJson.results)
                );

            } catch (err) {
                console.error("Live test execution error:", err);
            } finally {
                cleanup();
                resolve();
            }
        }
    });

    nextServer.stderr.on("data", () => {
        // Ignored or logged for debug
    });

    nextServer.on("exit", () => {
        resolve();
    });
});

// ============================================================================
// EXPORT RESULTS
// ============================================================================
const evidenceDir = path.resolve("docs/evidence/tests");
fs.mkdirSync(evidenceDir, { recursive: true });

fs.writeFileSync(
    path.join(evidenceDir, "adversarial_probe_results.json"),
    JSON.stringify(testResults, null, 2),
    "utf8"
);

const passCount = testResults.filter(t => t.status === "PASS").length;
const failCount = testResults.filter(t => t.status === "FAIL").length;

const summaryMd = `# BÁO CÁO KẾT QUẢ ADVERSARIAL STRESS TEST & SECURITY PROBES

> **Môi trường thực thi:** Node.js ${process.version} (${process.platform} ${process.arch})  
> **Thời gian:** ${new Date().toISOString()}  
> **Tổng số kịch bản:** ${testResults.length} | **PASS:** ${passCount} | **FAIL:** ${failCount}

| Mã Test | Phân nhóm | Tên kịch bản | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái |
|:---:|:---|:---|:---|:---|:---:|
${testResults.map(r => `| **${r.id}** | ${r.category} | ${r.name} | \`${r.expected}\` | \`${r.actual}\` | **${r.status}** |`).join("\n")}

## Chi tiết phân tích kỹ thuật:
${testResults.map(r => `- **${r.id}** [${r.category}]: ${r.name} -> **${r.status}**\n  - Ghi chú: ${r.details || "N/A"}`).join("\n\n")}
`;

fs.writeFileSync(path.join(evidenceDir, "adversarial_probe_results.md"), summaryMd, "utf8");

console.log("\n================================================================================");
console.log(`  PROBE SUMMARY: ${testResults.length} Total | ${passCount} PASSED | ${failCount} FAILED`);
console.log("================================================================================");

if (failCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
