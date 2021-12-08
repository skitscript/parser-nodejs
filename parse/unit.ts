import type { Document } from "@skitscript/types-nodejs";
import * as fs from "fs";
import * as path from "path";
import { parse } from "..";

describe(`parse`, () => {
  const casesPath = path.join(
    __dirname,
    `..`,
    `submodules`,
    `skitscript`,
    `parser-test-suite`,
    `cases`
  );

  const caseNames = fs.readdirSync(casesPath);

  for (const caseName of caseNames) {
    describe(caseName, () => {
      for (const newline of [`\n`, `\r`, `\r\n`]) {
        describe(`with a newline of ${JSON.stringify(newline)}`, () => {
          let document: Document;

          beforeAll(async () => {
            const source = await fs.promises.readFile(
              path.join(casesPath, caseName, `input.skitscript`),
              `utf8`
            );

            document = parse(source.replace(/\n/g, newline));
          });

          it(`parses to the expected document`, async () => {
            const outputText = await fs.promises.readFile(
              path.join(casesPath, caseName, `output.json`),
              `utf8`
            );
            const output = JSON.parse(outputText);

            expect(document).toEqual(output);
          });
        });
      }
    });
  }
});
