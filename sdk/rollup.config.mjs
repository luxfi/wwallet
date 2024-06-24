import alias from "@rollup/plugin-alias";
import path from "path";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import del from "rollup-plugin-delete";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    input: "src/index.ts",
    output: [
      {
        dir: "dist",
        format: "esm",
        sourcemap: process.env.BUILD === "production" ? false : true,
      },
    ],
    plugins: [
      del({ targets: "dist/*" }),
      typescript({
        tsconfig: "tsconfig.json",
      }),
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      json(),
      commonjs(),
    ],
    external: [
      "luxnet",
      "luxnet/dist/utils",
      "luxnet/dist",
      "@luxfi/cloud",
      "ethers",
      "web3",
      "url",
      "events",
      "@openzeppelin/contracts/build/contracts/ERC20.json",
      "xss",
      "openapi-typescript-codegen",
    ],
  },
  {
    input: "dist/index.d.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
