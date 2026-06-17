const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const PACKAGE_JSON = require(path.join(PACKAGE_ROOT, "package.json"));

async function main(argv) {
  const [command = "help", ...rest] = argv;

  switch (command) {
    case "-h":
    case "--help":
    case "help":
      printHelp();
      return;
    case "-v":
    case "--version":
    case "version":
      console.log(PACKAGE_JSON.version);
      return;
    case "dev":
      await runVite(rest);
      return;
    case "build":
      await build(rest);
      return;
    case "run":
      await run(rest);
      return;
    default:
      throw new Error(`Unknown p5kit command: ${command}\n\nRun "p5kit help" for available commands.`);
  }
}

async function build(args) {
  const target = readTarget(args, "web");

  if (target.name === "web") {
    await runVite(["build", ...target.rest]);
    return;
  }

  if (target.name === "ios") {
    await buildAndSyncCapacitor("ios");
    console.log("Prepared Capacitor iOS project in ios/.");
    return;
  }

  if (target.name === "android") {
    await buildAndSyncCapacitor("android");
    console.log("Prepared Capacitor Android project in android/.");
    return;
  }

  throw new Error(`Unsupported build target: ${target.name}`);
}

async function run(args) {
  const target = readTarget(args, "web");

  if (target.name === "web") {
    await runVite(target.rest);
    return;
  }

  if (target.name === "ios") {
    await buildAndSyncCapacitor("ios");
    await runCapacitor(["run", "ios", ...target.rest]);
    return;
  }

  if (target.name === "android") {
    await buildAndSyncCapacitor("android");
    await runCapacitor(["run", "android", ...target.rest]);
    return;
  }

  throw new Error(`Unsupported run target: ${target.name}`);
}

function readTarget(args, fallback) {
  const rest = [...args];
  const first = rest[0];

  if (first && !first.startsWith("-")) {
    return {
      name: rest.shift(),
      rest,
    };
  }

  return {
    name: fallback,
    rest,
  };
}

function runVite(args) {
  return runLocalBin("vite", args, {
    missingMessage:
      "Vite is required for this command. Run npm install in your p5kit project, then try again.",
  });
}

async function buildAndSyncCapacitor(platform) {
  ensureCapacitorConfig();
  await runVite(["build"]);
  await ensureCapacitorPlatform(platform);
  await runCapacitor(["sync", platform]);
}

async function ensureCapacitorPlatform(platform) {
  const platformDir = path.resolve(process.cwd(), platform);

  if (fs.existsSync(platformDir)) {
    return;
  }

  await runCapacitor(["add", platform]);
}

function ensureCapacitorConfig() {
  const configPath = path.resolve(process.cwd(), "capacitor.config.json");

  if (fs.existsSync(configPath)) {
    return;
  }

  throw new Error(
    "Missing capacitor.config.json. Create a new project with npm create p5kit, or add Capacitor config with webDir set to dist."
  );
}

function runCapacitor(args) {
  return runLocalBin("cap", args, {
    missingMessage:
      "Capacitor CLI is required for this command. Run npm install in your p5kit project, then try again.",
  });
}

function runLocalBin(command, args, options = {}) {
  const bin = localBinPath(command);
  const executable = fs.existsSync(bin) ? bin : command;

  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(executable, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
      shell: process.platform === "win32" && executable === command,
    });

    child.on("error", (error) => {
      if (error.code === "ENOENT" && options.missingMessage) {
        reject(new Error(options.missingMessage));
        return;
      }

      reject(error);
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited from signal ${signal}`));
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

function localBinPath(command) {
  const suffix = process.platform === "win32" ? ".cmd" : "";
  return path.join(process.cwd(), "node_modules", ".bin", `${command}${suffix}`);
}

function printHelp() {
  console.log(`p5kit ${PACKAGE_JSON.version}

Usage:
  p5kit dev [vite options]
  p5kit run [web|ios|android] [capacitor run options]
  p5kit build [web|ios|android]

Examples:
  p5kit dev --host 0.0.0.0
  p5kit build web
  p5kit build ios
  p5kit run android --target Pixel_8
`);
}

module.exports = {
  main,
};
