import { build } from "esbuild";

const sourcemap = process.argv.includes("--sourcemap");

build({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  external: ["vscode"],
  format: "cjs",
  platform: "node",
  sourcemap,
  minify: !sourcemap,
  resolveExtensions: [".ts", ".js", ".json"],
}).catch(() => process.exit(1));
