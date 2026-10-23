
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/headers") {
    return nextResolve(new URL("./mock-headers.mjs", import.meta.url).href, context);
  }
  if (specifier === "next/cache") {
    return nextResolve(new URL("./mock-cache.mjs", import.meta.url).href, context);
  }
  if (specifier === "next/server") {
    return nextResolve("next/server.js", context);
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
