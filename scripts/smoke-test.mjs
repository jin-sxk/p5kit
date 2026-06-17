import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const tmpRoot = path.join(root, ".tmp");
const appDir = path.join(tmpRoot, "smoke-app");

run();

function run() {
  fs.rmSync(appDir, { recursive: true, force: true });
  fs.mkdirSync(tmpRoot, { recursive: true });

  assertPublicPackageSurface();

  exec(process.execPath, [path.join(root, "packages/create-p5kit/bin/create-p5kit.js"), appDir], root);

  const generatedPackageJson = readJson(path.join(appDir, "package.json"));
  assertDependency(generatedPackageJson.dependencies, "@capacitor/android");
  assertDependency(generatedPackageJson.dependencies, "@capacitor/core");
  assertDependency(generatedPackageJson.dependencies, "@capacitor/haptics");
  assertDependency(generatedPackageJson.dependencies, "@capacitor/ios");
  assertDependency(generatedPackageJson.dependencies, "@capacitor/share");
  assertDependency(generatedPackageJson.dependencies, "@p5kit/core");
  assertDependency(generatedPackageJson.dependencies, "p5");
  assertDependency(generatedPackageJson.devDependencies, "@capacitor/cli");
  assertDependency(generatedPackageJson.devDependencies, "@p5kit/cli");
  assertDependency(generatedPackageJson.devDependencies, "vite");
  assertMissingDependency(generatedPackageJson.dependencies, "@p5kit/bridge");

  const capacitorConfig = readJson(path.join(appDir, "capacitor.config.json"));
  assertEqual(capacitorConfig.appId, "dev.p5kit.smoke.app", "capacitor.config.json appId");
  assertString(capacitorConfig.appName, "capacitor.config.json appName");
  assertEqual(capacitorConfig.webDir, "dist", "capacitor.config.json webDir");

  exec("npm", ["install"], appDir);
  exec("npm", ["run", "build"], appDir);
  exec("npm", ["run", "build:ios"], appDir);
  exec("npm", ["run", "build:android"], appDir);

  assertFile(path.join(appDir, "dist", "index.html"));
  assertFile(path.join(appDir, "ios", "App", "App", "public", "index.html"));
  assertFile(path.join(appDir, "android", "app", "src", "main", "assets", "public", "index.html"));
  assertMissing(path.join(appDir, ".p5kit", "ios", "Web", "index.html"));
  assertMissing(path.join(appDir, ".p5kit", "android", "Web", "index.html"));

  console.log("Smoke test passed.");
}

function exec(command, args, cwd) {
  const result = childProcess.spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with status ${result.status}`);
  }
}

function assertFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected file to exist: ${filePath}`);
  }
}

function assertMissing(filePath) {
  if (fs.existsSync(filePath)) {
    throw new Error(`Expected file to be removed: ${filePath}`);
  }
}

function assertPublicPackageSurface() {
  const packagesDir = path.join(root, "packages");
  const packageNames = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(packagesDir, entry.name, "package.json")))
    .map((entry) => entry.name)
    .sort();
  const expected = ["cli", "core", "create-p5kit"];

  if (JSON.stringify(packageNames) !== JSON.stringify(expected)) {
    throw new Error(`Expected public packages ${expected.join(", ")}, found ${packageNames.join(", ")}`);
  }

  assertMissing(path.join(packagesDir, "bridge", "package.json"));
  assertMissing(path.join(packagesDir, "templates", "package.json"));
  assertMissing(path.join(packagesDir, "ios", "package.json"));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertDependency(dependencies, name) {
  if (!dependencies || !Object.hasOwn(dependencies, name)) {
    throw new Error(`Expected generated package.json to depend on ${name}`);
  }
}

function assertMissingDependency(dependencies, name) {
  if (dependencies && Object.hasOwn(dependencies, name)) {
    throw new Error(`Expected generated package.json not to depend on ${name}`);
  }
}

function assertString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected ${label} to be a non-empty string`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`Expected ${label} to be ${expected}, found ${actual}`);
  }
}
