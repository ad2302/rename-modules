import { test } from "tap";
import { findImports } from "../src/find_imports";

void test("find imports", async (t) => {
  const imports = await findImports("fixtures/basic/*.ts", {
    packageImports: false,
    absoluteImports: true,
    relativeImports: true,
  });
  t.ok(Object.keys(imports));
});
