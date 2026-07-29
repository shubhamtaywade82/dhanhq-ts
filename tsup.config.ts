import { defineConfig } from "tsup";

export default defineConfig({
  // `src/bin/dhanhq-mcp.ts` is its own entry so MCP clients can launch the
  // server without loading the whole SDK barrel.
  entry: ["src/index.ts", "src/mcp/index.ts", "src/bin/dhanhq-mcp.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  shims: true,
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".js" : ".cjs",
    };
  },
});
