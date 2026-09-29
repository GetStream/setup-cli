// Bundles src/main.ts into dist/index.js, the file action.yml runs: one ES
// module with the packages inlined and Node's own modules left to Node.
import { build } from "esbuild";

await build({
  entryPoints: ["src/main.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",
  // The @actions packages are CommonJS and require Node's modules at run
  // time; an ES module has no require unless it makes one.
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  logLevel: "warning",
});
