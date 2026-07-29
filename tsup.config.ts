import { defineConfig } from "tsup";

export default defineConfig({
  // `src/bin/dhanhq-mcp.ts` is its own entry so MCP clients can launch the
  // server without loading the whole SDK barrel.
  entry: ["src/index.ts", "src/mcp/index.ts", "src/bin/dhanhq-mcp.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  // ESM splitting dedupes the SDK shared by the three entry points; CJS cannot
  // split, so its bin bundle stays self-contained.
  splitting: true,
  sourcemap: true,
  shims: true,
  treeshake: true,
  // Explicit .mjs/.cjs rather than a bare .js: the package is
  // `"type": "commonjs"`, so Node would parse an ESM `dist/index.js` as
  // CommonJS and named imports would fail for ESM consumers.
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".cjs",
    };
  },
});
