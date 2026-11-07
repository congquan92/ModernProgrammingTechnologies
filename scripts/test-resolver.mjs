import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

export async function resolve(specifier, context, nextResolve) {
  if (["next/headers", "next/cache", "next/server"].includes(specifier)) {
    return nextResolve(new URL("./mock-headers.mjs", import.meta.url).href, context);
  }
  if (["next/image", "next/link"].includes(specifier)) {
    const resolved = await nextResolve(`${specifier}.js`, context);
    return { ...resolved, url: `${resolved.url}?test-default` };
  }
  if (specifier === "next/navigation") {
    return nextResolve(`${specifier}.js`, context);
  }

  if (specifier.startsWith("@/")) {
    const p = new URL("../" + specifier.slice(2), import.meta.url);
    const filePath = fileURLToPath(p);
    if (fs.existsSync(filePath + ".ts")) return nextResolve(pathToFileURL(filePath + ".ts").href, context);
    if (fs.existsSync(filePath + ".tsx")) return nextResolve(pathToFileURL(filePath + ".tsx").href, context);
    return nextResolve(p.href, context);
  }

  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    if (context.parentURL) {
      const parentDir = new URL(".", context.parentURL);
      const targetUrl = new URL(specifier, parentDir);
      const targetPath = fileURLToPath(targetUrl);
      if (!fs.existsSync(targetPath)) {
        if (fs.existsSync(targetPath + ".ts")) return nextResolve(pathToFileURL(targetPath + ".ts").href, context);
        if (fs.existsSync(targetPath + ".tsx")) return nextResolve(pathToFileURL(targetPath + ".tsx").href, context);
      }
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith("?test-default")) {
    return { format: "module", shortCircuit: true,
      source: `import value from ${JSON.stringify(url.split("?")[0])}; export default value.default ?? value;` };
  }
  if (!url.endsWith(".tsx")) return nextLoad(url, context);
  return {
    format: "module",
    shortCircuit: true,
    source: ts.transpileModule(fs.readFileSync(fileURLToPath(url), "utf8"), {
      compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    }).outputText,
  };
}
