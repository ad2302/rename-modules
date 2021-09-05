import { test } from "tap";
import { findImports } from "../src/find_imports";

void test("find imports export all", async (t) => {
  const imports = await findImports("fixtures/export_all/*.ts", {
    packageImports: false,
    absoluteImports: true,
    relativeImports: true,
  });
  const expectKey = "fixtures/export_all/index.ts";
  t.ok(expectKey in imports, `expect key ${expectKey} in imports`);
  t.ok(
    imports[expectKey].includes("./camelCaseModule"),
    `expect values has './camelCaseModule'`
  );
});

void test("find imports import one", async (t) => {
  const imports = await findImports("fixtures/import_one/*.ts", {
    packageImports: false,
    absoluteImports: true,
    relativeImports: true,
  });
  const expectKey = "fixtures/import_one/index.ts";
  t.ok(expectKey in imports, `expect key ${expectKey} in imports`);
  t.ok(
    imports[expectKey].includes("./PascalCaseModule"),
    `expect values has './PascalCaseModule'`
  );
});
