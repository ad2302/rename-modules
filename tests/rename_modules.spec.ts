import { promisify } from "util";
import { readFile } from "fs";
import { test, beforeEach, afterEach } from "tap";
import { renameModules } from "../src/rename_modules";
import rimraf from "rimraf";
import copyDir from "copy-dir";
import { pathExists } from "path-exists";

const _readFile = promisify(readFile);
const _rimraf = promisify(rimraf);
const _copyDir = promisify(copyDir);

void beforeEach(async () => {
  await _copyDir("fixtures", "tmp", {});
});

void afterEach(async () => {
  await _rimraf("tmp");
});

void test("find imports export all", async (t) => {
  await renameModules("tmp/export_all/*.ts", "snake_case");
  t.ok(await pathExists("tmp/export_all/camel_case_module.ts"));
  const c = await _readFile("tmp/export_all/index.ts", "utf-8");
  t.ok(c.includes("camel_case_module"),`index.ts includes camel_case_module`);
});

void test("find imports import one", async (t) => {
  await renameModules("tmp/import_one/*.ts", "snake_case");
  t.ok(await pathExists("tmp/import_one/pascal_case_module.ts"));
  const c = await _readFile("tmp/import_one/index.ts", "utf-8");
  t.ok(c.includes("pascal_case_module"),`index.ts includes pascal_case_module`);
});
