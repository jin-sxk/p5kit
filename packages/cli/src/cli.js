const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
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
    case "doctor":
      await doctor(rest);
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
    ensureAndroidToolchain();
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
    ensureAndroidToolchain();
    await buildAndSyncCapacitor("android");
    await runCapacitor(["run", "android", ...target.rest]);
    return;
  }

  throw new Error(`Unsupported run target: ${target.name}`);
}

async function doctor(args) {
  const target = readTarget(args, "android");

  if (target.name === "android") {
    ensureAndroidToolchain();
    console.log("Android toolchain check passed.");
    return;
  }

  throw new Error(`Unsupported doctor target: ${target.name}`);
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
    const config = readJson(configPath, "capacitor.config.json");

    if (config.webDir !== "dist") {
      throw new Error(
        `Expected capacitor.config.json webDir to be "dist", found ${JSON.stringify(config.webDir)}. p5kit builds sketches into dist before syncing Capacitor.`
      );
    }

    return;
  }

  throw new Error(
    "Missing capacitor.config.json. Create a new project with npm create p5kit, or add Capacitor config with webDir set to dist."
  );
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read ${label}: ${error.message}`);
  }
}

function ensureAndroidToolchain() {
  const status = androidToolchainStatus(process.cwd(), process.env);

  if (status.ok) {
    return;
  }

  printAndroidToolchainReport(status);
  throw new Error("Android toolchain check failed. Fix the items above, then run p5kit doctor android again.");
}

function androidToolchainStatus(projectDir, env) {
  const java = commandStatus("java", ["-version"], env);
  const androidSdk = androidSdkStatus(projectDir, env);

  return {
    ok: java.ok && androidSdk.ok,
    java,
    androidSdk,
  };
}

function commandStatus(command, args, env) {
  const result = childProcess.spawnSync(command, args, {
    encoding: "utf8",
    env,
    shell: process.platform === "win32",
  });

  if (result.error) {
    return {
      ok: false,
      reason: result.error.code === "ENOENT" ? "missing" : result.error.message,
    };
  }

  if (result.status !== 0) {
    return {
      ok: false,
      reason: `exited with code ${result.status}`,
    };
  }

  return {
    ok: true,
  };
}

function androidSdkStatus(projectDir, env) {
  const configured = [
    { source: "ANDROID_HOME", value: env.ANDROID_HOME },
    { source: "ANDROID_SDK_ROOT", value: env.ANDROID_SDK_ROOT },
    { source: "android/local.properties", value: androidSdkFromLocalProperties(projectDir) },
  ].filter((candidate) => candidate.value);
  const invalidConfigured = [];

  for (const candidate of configured) {
    const sdkPath = path.resolve(candidate.value);

    if (fs.existsSync(sdkPath)) {
      return {
        ok: true,
        path: sdkPath,
        source: candidate.source,
      };
    }

    invalidConfigured.push({
      path: sdkPath,
      reason: `${candidate.source} points to a missing directory`,
    });
  }

  if (invalidConfigured.length > 0) {
    return {
      ok: false,
      ...invalidConfigured[0],
    };
  }

  for (const sdkPath of defaultAndroidSdkPaths(env)) {
    if (fs.existsSync(sdkPath)) {
      return {
        ok: true,
        path: sdkPath,
        source: "default Android Studio SDK path",
      };
    }
  }

  return {
    ok: false,
    reason: "missing",
  };
}

function androidSdkFromLocalProperties(projectDir) {
  const localPropertiesPath = path.join(projectDir, "android", "local.properties");

  if (!fs.existsSync(localPropertiesPath)) {
    return "";
  }

  const content = fs.readFileSync(localPropertiesPath, "utf8");
  const sdkDirLine = content
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .find((line) => line.startsWith("sdk.dir="));

  if (!sdkDirLine) {
    return "";
  }

  return sdkDirLine.slice("sdk.dir=".length).replace(/\\:/g, ":").replace(/\\\\/g, "\\");
}

function defaultAndroidSdkPaths(env) {
  const paths = [];

  if (process.platform === "darwin") {
    paths.push(path.join(os.homedir(), "Library", "Android", "sdk"));
  }

  if (process.platform === "win32" && env.LOCALAPPDATA) {
    paths.push(path.join(env.LOCALAPPDATA, "Android", "Sdk"));
  }

  paths.push(path.join(os.homedir(), "Android", "Sdk"));

  return paths;
}

function printAndroidToolchainReport(status) {
  console.error("p5kit doctor android");
  console.error("");

  if (status.java.ok) {
    console.error("Java runtime: found");
  } else {
    console.error("Java runtime: missing");
    console.error("  Install a JDK, then make sure the java command is available on PATH.");
  }

  if (status.androidSdk.ok) {
    console.error(`Android SDK: found at ${status.androidSdk.path}`);
  } else {
    console.error("Android SDK: missing");
    if (status.androidSdk.path) {
      console.error(`  ${status.androidSdk.reason}: ${status.androidSdk.path}`);
    }
    console.error("  Install Android Studio, then set ANDROID_HOME or ANDROID_SDK_ROOT to the SDK directory.");
  }

  console.error("");
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
  p5kit doctor [android]
  p5kit run [web|ios|android] [capacitor run options]
  p5kit build [web|ios|android]

Examples:
  p5kit dev --host 0.0.0.0
  p5kit doctor android
  p5kit build web
  p5kit build ios
  p5kit run android --target Pixel_8
`);
}

module.exports = {
  main,
};
