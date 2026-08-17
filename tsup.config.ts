import { defineConfig } from "tsup";

export default defineConfig({
  // `src/bin/dhanhq-mcp.ts` is its own entry so MCP clients can launch the
  // server without loading the whole SDK barrel. `src/browser.ts` is its
  // own entry so a bundler never has to prove it can tree-shake away
  // src/client/src/resources/src/ws — they're simply not in that entry's
  // module graph.
  entry: [
    "src/index.ts",
    "src/mcp/index.ts",
    "src/bin/dhanhq-mcp.ts",
    "src/browser.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  splitting: false,
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
