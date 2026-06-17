#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const PACKAGE_JSON = require("../package.json");
const PACKAGE_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(__dirname, "../../..");

main(process.argv.slice(2)).catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
});

async function main(argv) {
  const options = parseArgs(argv);

  if (options.help) {
    printHelp();
    return;
  }

  if (options.version) {
    console.log(PACKAGE_JSON.version);
    return;
  }

  if (!options.target) {
    throw new Error('Missing project name. Example: npm create p5kit my-sketch');
  }

  const targetDir = path.resolve(process.cwd(), options.target);
  const projectName = sanitizePackageName(path.basename(targetDir));

  ensureTargetDirectory(targetDir, options.force);

  const templateDir = resolveTemplateDir(options.template);
  const replacements = createReplacements(targetDir, projectName);

  copyTemplate(templateDir, targetDir, replacements);

  console.log(`Created ${projectName} in ${targetDir}`);
  console.log("");
  console.log("Next steps:");
  console.log(`  cd ${path.relative(process.cwd(), targetDir) || "."}`);
  console.log("  npm install");
  console.log("  npm run dev");
}

function parseArgs(argv) {
  const options = {
    force: false,
    help: false,
    template: "basic",
    target: null,
    version: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
      continue;
    }

    if (arg === "-v" || arg === "--version") {
      options.version = true;
      continue;
    }

    if (arg === "-f" || arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--template") {
      options.template = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--template=")) {
      options.template = arg.slice("--template=".length);
      continue;
    }

    if (!options.target) {
      options.target = arg;
      continue;
    }

    throw new Error(`Unexpected argument: ${arg}`);
  }

  return options;
}

function ensureTargetDirectory(targetDir, force) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    return;
  }

  const entries = fs.readdirSync(targetDir);

  if (entries.length === 0) {
    return;
  }

  if (!force) {
    throw new Error(`Target directory is not empty: ${targetDir}\nUse --force to write into it.`);
  }
}

function resolveTemplateDir(template) {
  if (template !== "basic") {
    throw new Error(`Unknown template: ${template}`);
  }

  return path.join(PACKAGE_ROOT, "templates", template);
}

function createReplacements(targetDir, projectName) {
  return {
    __APP_NAME__: projectName,
    __CAPACITOR_APP_ID__: capacitorAppId(projectName),
    __PROJECT_NAME__: projectName,
    __P5KIT_CORE_SPEC__: packageSpec(targetDir, "@p5kit/core", "packages/core"),
    __P5KIT_CLI_SPEC__: packageSpec(targetDir, "@p5kit/cli", "packages/cli"),
  };
}

function packageSpec(targetDir, packageName, localPath) {
  const packageDir = path.join(REPO_ROOT, localPath);
  const packageJsonPath = path.join(packageDir, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    const relative = path.relative(targetDir, packageDir).split(path.sep).join("/");
    return `file:${relative.startsWith(".") ? relative : `./${relative}`}`;
  }

  return readPackageVersion(packageName) || `^${PACKAGE_JSON.version}`;
}

function readPackageVersion(packageName) {
  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return `^${packageJson.version}`;
  } catch {
    return null;
  }
}

function copyTemplate(source, destination, replacements) {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyTemplate(sourcePath, destinationPath, replacements);
      continue;
    }

    const content = fs.readFileSync(sourcePath, "utf8");
    const replaced = Object.entries(replacements).reduce(
      (value, [placeholder, replacement]) => value.split(placeholder).join(replacement),
      content
    );

    fs.writeFileSync(destinationPath, replaced);
  }
}

function sanitizePackageName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._~-]/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "") || "p5kit-sketch";
}

function capacitorAppId(projectName) {
  const segments = projectName
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean)
    .map((segment) => (/^[a-z]/.test(segment) ? segment : `sketch${segment}`));

  return ["dev", "p5kit", ...(segments.length > 0 ? segments : ["sketch"])].join(".");
}

function printHelp() {
  console.log(`create-p5kit ${PACKAGE_JSON.version}

Usage:
  create-p5kit <project-name> [--template basic] [--force]

Examples:
  npm create p5kit my-sketch
  create-p5kit experiments/touch-sketch
`);
}
