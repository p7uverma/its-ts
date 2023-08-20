#!/usr/bin/env node

const { ncp } = require("ncp");
const path = require("path");
const { spawnSync } = require("child_process");
const fs = require("fs");
const { program } = require("commander");
const os = require("os");

program
  .version("1.0.0")
  .description("CLI tool for creating TypeScript projects");

const copyFunction = os.platform() === "win32" ? ncp.ncp : ncp;

program
  .command("create <projectName>")
  .description("Create a new TypeScript project")
  .option("-f, --force", "Force creation even if project folder exists")
  .action((projectName, options) => {
    const templatePath = path.join(__dirname, "..", "templates", "ts-template");
    const projectPath = path.join(process.cwd(), projectName);

    console.log("Creating a new TypeScript project...");
    console.log("Template Path:", templatePath);

    if (!fs.existsSync(templatePath)) {
      console.error(`Error: Template directory not found at ${templatePath}`);
      process.exit(1);
    }

    if (!options.force && fs.existsSync(projectPath)) {
      console.error(`Error: Project folder "${projectName}" already exists.`);
      console.log("Use the -f or --force option to create the project anyway.");
      process.exit(1);
    }

    // Copy template files to the new project directory
    copyFunction(templatePath, projectPath, function (err) {
      if (err) {
        console.error(`Error: Unable to copy files - ${err}`);
        process.exit(1);
      }

      process.chdir(projectPath);

      // Install dependencies
      const npmInstallCommand = os.platform() === "win32" ? "npm.cmd" : "npm";
      console.log("Installing project dependencies...");
      const installResult = spawnSync(npmInstallCommand, ["install"], {
        stdio: "inherit",
      });

      if (installResult.error) {
        console.error(
          `Error: Unable to install dependencies - ${installResult.error.message}`
        );
        process.exit(1);
      }

      console.log(
        `Project "${projectName}" created successfully with installed dependencies.`
      );
    });
  });

// Show help if no command is provided
if (process.argv.length < 3) {
  program.help();
}

program.parse(process.argv);
