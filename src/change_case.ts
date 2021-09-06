import { underscore, camelize, titleize } from "inflection2";
import path from "path";

export function changeFileCase(_path: string, caseStyle: string): string {
  const destStyle = camelize(caseStyle, true);
  const parsed = path.parse(_path);
  const name = parsed.name.replace(/\W/,'');
  delete parsed.base;
  switch (destStyle) {
    case "snakeCase":
      parsed.name = underscore(name);
      break;
    case "camelCase":
      parsed.name = camelize(name, true);
      break;
    case "pascalCase":
      parsed.name = titleize(name);
      break;
  }
  return path.format(parsed);
}
