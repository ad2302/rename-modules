import { promisify } from "util";
import { findImports } from "@ad2302/find-imports";
import { changeFileCase } from "./change_case";
import { rename, readFile, writeFile } from "fs";

const _rename = promisify(rename);
const _readFile = promisify(readFile);
const _writeFile = promisify(writeFile);

export async function renameModules(
  patterns: string | string[] = [],
  caseStyle: string
): Promise<void> {
  const refs = await findImports(patterns, {
    packageImports: false,
    absoluteImports: true,
    relativeImports: true,
  });

  const renames = Object.entries(refs).map(
    async ([k, v]: [string, string[]]) => {
      const newModulePath = changeFileCase(k, caseStyle);
      let content = await _readFile(k, "utf-8");
      if (newModulePath !== k) {
        await _rename(k, newModulePath);
      }

      v.forEach((vv) => {
        content = content.replace(vv, changeFileCase(vv, caseStyle));
      });
      await _writeFile(newModulePath, content);
    }
  );
  await Promise.all(renames);
}
