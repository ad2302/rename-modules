import { underscore, camelize, titleize } from "inflection2";
import path from "path";

export function changeFileCase(_path: string, caseStyle: string): string {
  const destStyle = camelize(caseStyle, true);
  const parsed = path.parse(_path);
  const name = parsed.name.replace(/\W/,'');
  const normalize = name.replace(/[A-Z]+/g,(substring: string) => `${substring[0]}${substring.substring(1).toLowerCase()}`)
  delete parsed.base;
  switch (destStyle) {
    case "snakeCase":
      parsed.name = underscore(normalize);
      break;
    case "camelCase":
      parsed.name = camelize(normalize, true);
      break;
    case "pascalCase":
      parsed.name = titleize(normalize);
      break;
  }
  return path.format(parsed);
}
