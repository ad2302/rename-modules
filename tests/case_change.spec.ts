import { test } from "tap";
import { changeFileCase } from "../src/change_case";

void test("camelCase to snake_case", async (t) => {
  const s = "./camelCaseModule";
  t.equal(changeFileCase(s, "snake_case"), "./camel_case_module");
});

void test("PascalCase to snake_case", async (t) => {
  const s = "./PascalCaseModule";
  t.equal(changeFileCase(s, "snake_case"), "./pascal_case_module");
});
