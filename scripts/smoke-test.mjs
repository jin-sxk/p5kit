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
  assertTemplateMobileDefaults(appDir);

  exec("npm", ["install"], appDir);
  assertInvalidCapacitorWebDirFailsClearly(appDir);
  exec(process.execPath, [path.join(root, "scripts", "smoke-test-core.mjs")], appDir);
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

function execExpectFailure(command, args, cwd) {
  const result = childProcess.spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status === 0) {
    throw new Error(`Expected ${command} ${args.join(" ")} to fail`);
  }

  return [result.stdout, result.stderr].filter(Boolean).join("\n");
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

function assertTemplateMobileDefaults(projectDir) {
  const main = fs.readFileSync(path.join(projectDir, "src", "main.js"), "utf8");
  const styles = fs.readFileSync(path.join(projectDir, "src", "styles.css"), "utf8");

  assertIncludes(main, "sketch.pixelDensity(1);", "starter sketch should document the mobile pixel-density default");
  assertIncludes(main, "sketch.mousePressed = () => {", "starter sketch should use pointer-first input");
  assertIncludes(main, "return false;", "starter sketch input handler should suppress browser defaults");
  assertExcludes(main, "touchStarted", "starter sketch should not use p5 1.x touch callbacks");
  assertIncludes(styles, "--p5kit-safe-area-top: env(safe-area-inset-top);", "starter CSS should expose safe-area vars");
  assertIncludes(styles, "overscroll-behavior: none;", "starter CSS should suppress overscroll");
  assertExcludes(styles, "body {\n  padding:", "starter CSS should not shrink the full-screen canvas with body padding");
}

function assertInvalidCapacitorWebDirFailsClearly(projectDir) {
  const configPath = path.join(projectDir, "capacitor.config.json");
  const config = readJson(configPath);

  fs.writeFileSync(configPath, `${JSON.stringify({ ...config, webDir: "www" }, null, 2)}\n`);
  const output = execExpectFailure("npm", ["run", "build:ios"], projectDir);
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

  assertIncludes(
    output,
    'Expected capacitor.config.json webDir to be "dist"',
    "invalid Capacitor webDir should fail with p5kit guidance"
  );
}

function assertIncludes(content, expected, label) {
  if (!content.includes(expected)) {
    throw new Error(`Expected ${label}: missing ${JSON.stringify(expected)}`);
  }
}

function assertExcludes(content, unexpected, label) {
  if (content.includes(unexpected)) {
    throw new Error(`Expected ${label}: found ${JSON.stringify(unexpected)}`);
  }
}
