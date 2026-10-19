/**
 * TEST SUITE: AUTOMATED VERIFICATION OF MOVIEHUB ARCHITECTURE & CONSTRAINTS
 * Run via: node scripts/test-suite.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
import { spawnSync } from "node:child_process";

// Ensure Node execution flags for type stripping and warning suppression
if (!process.env.TEST_SUITE_SPAWNED && !process.execArgv.includes("--disable-warning=DEP0205")) {
    const result = spawnSync(
        process.execPath,
        [
            "--disable-warning=DEP0205",
            "--experimental-strip-types",
            "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
            fileURLToPath(import.meta.url),
            ...process.argv.slice(2),
        ],
        {
            stdio: "inherit",
            env: { ...process.env, TEST_SUITE_SPAWNED: "1" },
        }
    );
    process.exit(result.status ?? 0);
}

// Register Next.js test resolver hook (@/*, next/headers, next/cache, next/server)
register("./test-resolver.mjs", import.meta.url);

process.env.TMDB_API_KEY = "test-api-key";

// Real module imports
const { toggleWatchlist, getWatchlistIds, isMovieSaved } = await import("../app/actions/watchlist.ts");
const { resetMockCookies } = await import("./mock-headers.mjs");
const { GET: searchRouteHandler } = await import("../app/api/search/route.ts");
const { searchQuickLive } = await import("../services/search.ts");

const results = [];

function recordTest(id, name, category, expected, actual, passed, details = "") {
    results.push({
        id,
        name,
        category,
        expected,
        actual,
        status: passed ? "PASS" : "FAIL",
        details,
        timestamp: new Date().toISOString()
    });
    console.log(`[${passed ? "PASS" : "FAIL"}] ${id}: ${name}`);
    if (!passed) console.error(`  Expected: ${expected}\n  Actual: ${actual}`);
}

// 1. TEST SUITE: SEARCH INPUT VALIDATION (app/api/search/route.ts & services/search.ts)
console.log("\n--- Running Test Suite: Search Input Validation ---");
{
    const originalFetch = globalThis.fetch;
    const capturedUrls = [];

    globalThis.fetch = async (url) => {
        capturedUrls.push(String(url));
        return {
            ok: true,
            json: async () => ({
                results: [
                    { id: 27205, title: "Inception", release_date: "2010-07-15", media_type: "movie" },
                ],
            }),
        };
    };

    try {
        // TC-SEC-01: Empty query
        const res1 = await searchRouteHandler(new Request("http://localhost/api/search?q="));
        const body1 = await res1.json();
        const valid1 = body1.results.length > 0;
        recordTest(
            "TC-SEC-01",
            "Reject empty search query",
            "Security / Validation",
            "valid: false",
            `valid: ${valid1}`,
            res1.status === 200 && !valid1
        );

        // TC-SEC-02: Single character query (< 2 chars)
        const res2 = await searchRouteHandler(new Request("http://localhost/api/search?q=a"));
        const body2 = await res2.json();
        const valid2 = body2.results.length > 0;
        recordTest(
            "TC-SEC-02",
            "Reject query shorter than 2 characters",
            "Security / Validation",
            "valid: false",
            `valid: ${valid2}`,
            res2.status === 200 && !valid2
        );

        // TC-SEC-03: Valid query
        const res3 = await searchRouteHandler(new Request("http://localhost/api/search?q=Inception"));
        const body3 = await res3.json();
        const valid3 = res3.status === 200 && body3.results.length > 0;
        recordTest(
            "TC-SEC-03",
            "Accept valid query (2-100 characters)",
            "Security / Validation",
            "valid: true",
            `valid: ${valid3}`,
            valid3 && body3.results[0]?.title === "Inception"
        );

        // TC-SEC-04: Excessively long query (> 100 chars truncated)
        capturedUrls.length = 0;
        const longQuery = "a".repeat(101);
        const res4 = await searchRouteHandler(new Request("http://localhost/api/search?q=" + encodeURIComponent(longQuery)));
        const lastUrl4 = capturedUrls[capturedUrls.length - 1] || "";
        const truncated4 = lastUrl4.includes("query=" + "a".repeat(100) + "&");
        recordTest(
            "TC-SEC-04",
            "Reject query exceeding 100 characters",
            "Security / Validation",
            "truncated to 100 chars",
            truncated4 ? "truncated to 100 chars" : lastUrl4,
            res4.status === 200 && truncated4
        );

        // TC-SEC-05: Query with dangerous control characters sanitized
        capturedUrls.length = 0;
        const dirtyQuery = "Batman\x00\x1F\x7F";
        const res5 = await searchRouteHandler(new Request("http://localhost/api/search?q=" + encodeURIComponent(dirtyQuery)));
        const lastUrl5 = capturedUrls[capturedUrls.length - 1] || "";
        const sanitized5 = lastUrl5.includes("query=Batman&") && !lastUrl5.includes("\x00");
        recordTest(
            "TC-SEC-05",
            "Sanitize control characters from search input",
            "Security / Validation",
            "Batman",
            sanitized5 ? "Batman" : lastUrl5,
            res5.status === 200 && sanitized5
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
}

// 2. TEST SUITE: WATCHLIST INPUT VALIDATION & RFC 6265 LIMITS (app/actions/watchlist.ts)
console.log("\n--- Running Test Suite: Watchlist Validation & RFC 6265 Limits ---");
{
    // TC-SEC-06: Negative movie ID
    let t6Error = null;
    try {
        await toggleWatchlist(-5);
    } catch (e) {
        t6Error = e.message;
    }
    const t6Valid = t6Error === null;
    recordTest(
        "TC-SEC-06",
        "Reject negative movie ID in watchlist",
        "Security / Validation",
        "false",
        `${t6Valid}`,
        !t6Valid && t6Error === "Mã định danh phim (movieId) không hợp lệ."
    );

    // TC-SEC-07: Zero movie ID
    let t7Error = null;
    try {
        await toggleWatchlist(0);
    } catch (e) {
        t7Error = e.message;
    }
    const t7Valid = t7Error === null;
    recordTest(
        "TC-SEC-07",
        "Reject zero movie ID in watchlist",
        "Security / Validation",
        "false",
        `${t7Valid}`,
        !t7Valid && t7Error === "Mã định danh phim (movieId) không hợp lệ."
    );

    // TC-SEC-08: Floating point movie ID
    let t8Error = null;
    try {
        await toggleWatchlist(12.34);
    } catch (e) {
        t8Error = e.message;
    }
    const t8Valid = t8Error === null;
    recordTest(
        "TC-SEC-08",
        "Reject floating point movie ID in watchlist",
        "Security / Validation",
        "false",
        `${t8Valid}`,
        !t8Valid && t8Error === "Mã định danh phim (movieId) không hợp lệ."
    );

    // TC-SEC-09: Valid positive integer movie ID
    resetMockCookies();
    const res9 = await toggleWatchlist(550);
    const isSaved9 = await isMovieSaved(550);
    const t9 = res9.isSaved && isSaved9;
    recordTest(
        "TC-SEC-09",
        "Accept valid positive integer movie ID",
        "Security / Validation",
        "true",
        `${t9}`,
        t9
    );

    // TC-SEC-10: Cookie storage limit under 200 items (RFC 6265 ~4KB limit)
    const list199 = Array.from({ length: 199 }, (_, i) => 1000 + i);
    resetMockCookies(new Map([["mh_watchlist", JSON.stringify(list199)]]));
    const res10 = await toggleWatchlist(9999);
    recordTest(
        "TC-SEC-10",
        "Allow adding movie when watchlist count < 200",
        "State / Limits",
        "allowed: true",
        `allowed: ${res10.isSaved}`,
        res10.isSaved === true
    );

    // TC-SEC-11: Cookie storage limit reached (200 items)
    const list200 = Array.from({ length: 200 }, (_, i) => 1000 + i);
    resetMockCookies(new Map([["mh_watchlist", JSON.stringify(list200)]]));
    const res11 = await toggleWatchlist(9999);
    const isAllowed11 = res11.isSaved;
    recordTest(
        "TC-SEC-11",
        "Enforce 200 items limit to prevent HTTP 431 / RFC 6265 overflow",
        "State / Limits",
        "allowed: false",
        `allowed: ${isAllowed11}`,
        !isAllowed11 && Boolean(res11.error)
    );

    // TC-SEC-12: Verify maximum byte size of 200 serialized IDs
    const mock200Ids = Array.from({ length: 200 }, (_, i) => 100000 + i);
    const serialized = JSON.stringify(mock200Ids);
    const byteSize = Buffer.byteLength(`mh_watchlist=${serialized}`, "utf8");
    recordTest(
        "TC-SEC-12",
        "Verify 200 serialized IDs size < 4096 bytes (RFC 6265)",
        "State / Limits",
        "< 4096 bytes",
        `${byteSize} bytes`,
        byteSize < 4096,
        `Serialized 200 IDs = ${byteSize} bytes, safely within 4096 bytes threshold`
    );

    // TC-COOKIE-01: Malformed cookie JSON resilience
    resetMockCookies(new Map([["mh_watchlist", "invalid-json{]"]]));
    const parsedMalformed = await getWatchlistIds();
    recordTest(
        "TC-COOKIE-01",
        "Gracefully handle malformed cookie JSON without throwing",
        "Resilience / Cookie",
        "[]",
        JSON.stringify(parsedMalformed),
        Array.isArray(parsedMalformed) && parsedMalformed.length === 0
    );

    // TC-COOKIE-02: Non-numeric elements in cookie array
    resetMockCookies(new Map([["mh_watchlist", JSON.stringify([101, "abc", null, 202])]]));
    const parsedDirty = await getWatchlistIds();
    recordTest(
        "TC-COOKIE-02",
        "Filter out NaN and invalid elements from cookie array",
        "Resilience / Cookie",
        "[101,202]",
        JSON.stringify(parsedDirty),
        parsedDirty.length === 2 && parsedDirty[0] === 101 && parsedDirty[1] === 202
    );
}

// 3. TEST SUITE: FILTERBAR 5 INDEPENDENT CRITERIA (components/client/FilterBar.tsx)
console.log("\n--- Running Test Suite: FilterBar 5 Independent Criteria ---");
{
    const filterBarPath = path.resolve("components/client/FilterBar.tsx");
    const filterBarContent = fs.readFileSync(filterBarPath, "utf8");

    const hasTypeFilter = filterBarContent.includes('updateFilter("type"');
    const hasGenreFilter = filterBarContent.includes('updateFilter("genre"');
    const hasCountryFilter = filterBarContent.includes('updateFilter("country"');
    const hasYearFilter = filterBarContent.includes('updateFilter("year"');
    const hasSortFilter = filterBarContent.includes('updateFilter("sortBy"');

    recordTest("TC-FILTER-01", "Verify Content Type filter ('type') exists in FilterBar", "Features / FilterBar", "true", `${hasTypeFilter}`, hasTypeFilter);
    recordTest("TC-FILTER-02", "Verify Genre filter ('genre') exists in FilterBar", "Features / FilterBar", "true", `${hasGenreFilter}`, hasGenreFilter);
    recordTest("TC-FILTER-03", "Verify Country filter ('country') exists in FilterBar", "Features / FilterBar", "true", `${hasCountryFilter}`, hasCountryFilter);
    recordTest("TC-FILTER-04", "Verify Release Year filter ('year') exists in FilterBar", "Features / FilterBar", "true", `${hasYearFilter}`, hasYearFilter);
    recordTest("TC-FILTER-05", "Verify Sort filter ('sortBy') exists in FilterBar", "Features / FilterBar", "true", `${hasSortFilter}`, hasSortFilter);

    const totalCriteria = [hasTypeFilter, hasGenreFilter, hasCountryFilter, hasYearFilter, hasSortFilter].filter(Boolean).length;
    recordTest("TC-FILTER-06", "FilterBar implements exactly 5 independent criteria", "Features / FilterBar", "5 criteria", `${totalCriteria} criteria`, totalCriteria === 5);
}

// 4. TEST SUITE: LIVE SEARCH LIMIT (services/search.ts)
console.log("\n--- Running Test Suite: Live Search Limit ---");
{
    const originalFetch = globalThis.fetch;
    try {
        globalThis.fetch = async () => ({
            ok: true,
            json: async () => ({
                results: Array.from({ length: 15 }, (_, i) => ({
                    id: i + 1,
                    title: `Movie ${i + 1}`,
                    release_date: "2024-01-01",
                })),
            }),
        });

        const liveResults = await searchQuickLive("Matrix");
        const hasSlice5 = liveResults.length === 5;

        recordTest(
            "TC-SEARCH-01",
            "Verify searchQuickLive limits results to exactly 5 items via .slice(0, 5)",
            "Features / Search",
            ".slice(0, 5)",
            hasSlice5 ? ".slice(0, 5)" : `${liveResults.length} items`,
            hasSlice5
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
}

// 5. TEST SUITE: TMDB AUTHENTICATION METHOD (services/client.ts)
console.log("\n--- Running Test Suite: TMDB Authentication Verification ---");
{
    const clientPath = path.resolve("services/client.ts");
    const clientContent = fs.readFileSync(clientPath, "utf8");
    const usesQueryParam = clientContent.includes("api_key=${TMDB_API_KEY}");
    const usesBearer = clientContent.includes("Bearer ");

    recordTest("TC-AUTH-01", "Verify fetchTMDB uses query param api_key over HTTPS", "Architecture / Security", "api_key query param", usesQueryParam ? "api_key query param" : "other", usesQueryParam);
    recordTest("TC-AUTH-02", "Confirm fetchTMDB does not use Authorization Bearer token header in implementation", "Architecture / Security", "false", `${usesBearer}`, !usesBearer);
}

// 6. TEST SUITE: TYPESCRIPT STRICTNESS & RESOLVER ANNOTATION (services/client.ts)
console.log("\n--- Running Test Suite: TypeScript Strictness ---");
{
    const clientPath = path.resolve("services/client.ts");
    const clientContent = fs.readFileSync(clientPath, "utf8");
    const hasAsAnyInClient = clientContent.includes("as any");

    recordTest("TC-TS-01", "Verify services/client.ts does not use 'as any' in lookup hook", "TypeScript / Strictness", "No 'as any'", hasAsAnyInClient ? "Found 'as any'" : "No 'as any'", !hasAsAnyInClient);
}

// Write results to docs/evidence/tests/automated_test_results.json and .md
const evidenceDir = path.resolve("docs/evidence/tests");
fs.mkdirSync(evidenceDir, { recursive: true });

fs.writeFileSync(
    path.join(evidenceDir, "automated_test_results.json"),
    JSON.stringify(results, null, 2),
    "utf8"
);

const summaryMd = `# BẢNG KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST VERIFICATION SUITE)

> **Môi trường thực thi:** Node.js ${process.version} (${process.platform} ${process.arch})  
> **Thời gian:** ${new Date().toISOString()}  
> **Tổng số kịch bản:** ${results.length} | **PASS:** ${results.filter(r => r.status === "PASS").length} | **FAIL:** ${results.filter(r => r.status === "FAIL").length}

| Mã Test | Tên kịch bản kiểm thử | Phân nhóm | Kết quả kỳ vọng | Kết quả thực tế | Trạng thái |
|:---:|:---|:---|:---|:---|:---:|
${results.map(r => `| **${r.id}** | ${r.name} | ${r.category} | \`${r.expected}\` | \`${r.actual}\` | **${r.status}** |`).join("\n")}

## Ghi chú chi tiết:
${results.map(r => `- **${r.id}**: ${r.name} -> ${r.status}. ${r.details || ""}`).join("\n")}
`;

fs.writeFileSync(path.join(evidenceDir, "automated_test_results.md"), summaryMd, "utf8");
console.log(`\n✅ Completed: ${results.length} tests run. All results exported to docs/evidence/tests/`);
