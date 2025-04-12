import typescript from "@rollup/plugin-typescript";
import fs from "node:fs/promises";
import { defineConfig } from "rollup";
import { dts } from "rollup-plugin-dts";
import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: "src/index.ts",
    plugins: [
      typescript({
        tsconfig: "./configs/tsconfig.esm.json",
        sourceMap: false,
      }),
    ],
    output: [
      { file: "lib/zod.js", format: "es", sourcemap: false, exports: "named" },
    ],
  },
  {
    input: "./lib/src/index.d.ts",
    plugins: [
      dts(),
      {
        name: "closeBundle",
        closeBundle: () =>
          fs
            .rm("lib/src", { recursive: true, force: true })
            .then(async () =>
              fs.writeFile(
                "lib/package.json",
                JSON.stringify(
                  {
                    ...(({ name, version, author }) => ({
                      name,
                      version,
                      author,
                    }))(JSON.parse(await fs.readFile("./package.json"))),
                    type: "module",
                    exports: {
                      types: "./zod.d.ts",
                      // require: "./index.js",
                      import: "./zod.js",
                    },
                  },
                  null,
                  2
                )
              )
            )
            .then(() => console.log("closeBundle")),
      },
    ],
    output: [{ file: "lib/zod.d.ts", format: "es" }],
  },
  // Experiment to create a CJS Version but did fail
  // use tsc -p ./configs/tsconfig.cjs.json to produce crap in lib/ that is cjs compatible
  defineConfig({
    input: "src/index.ts",
    output: { file: "lib/index.js", format: "cjs", exports: "named" },
    plugins: [
      typescript({
        tsconfig: false,
        sourceMap: false,
        compilerOptions: {
          //target: "esnext",
          module: "commonjs",
          outDir: "./lib",
          declaration: true,
          declarationMap: false,
          sourceMap: false,
          lib: ["es5", "es6", "es7", "esnext", "dom"],
          target: "es2018",
          removeComments: false,
          esModuleInterop: true,
          moduleResolution: "node",
          resolveJsonModule: true,
          strict: true,
          skipLibCheck: true,
          strictPropertyInitialization: false,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: true,
          downlevelIteration: true,
          isolatedModules: true,
        },
        include: ["src/**/*", "playground.ts", ".eslintrc.js"],
        exclude: ["src/**/__tests__", "playground.ts"],
      }),
      commonjs(),
    ],
  }),
];
