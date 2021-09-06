#!/usr/bin/env node
import { Command } from "commander";
import { renameModules } from "./index";

const program = new Command();
program.storeOptionsAsProperties();
program.description("rename modules to specific case and update imports");
program.requiredOption("-c, --case <case>", "case style");
program.argument("<glob...>", "glob pattern to source files");
program.action((source) => {
  const options = program.opts();
  const caseStyle = options.case;
  renameModules(source,caseStyle);
});
program.parse();
