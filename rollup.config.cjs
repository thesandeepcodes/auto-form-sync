const typescript = require("rollup-plugin-typescript2");
const terser = require("@rollup/plugin-terser");
const pkg = require("./package.json");

module.exports = [
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [typescript({ tsconfig: "./tsconfig.json" })],
    external: [],
  },

  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.min.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.min.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [typescript({ tsconfig: "./tsconfig.json" }), terser()],
    external: [],
  },
];
