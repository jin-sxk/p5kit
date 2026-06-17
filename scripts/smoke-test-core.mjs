const core = await import("@p5kit/core");

assertFunction(core.capabilities, "capabilities export");
assertFunction(core.p5kit.capabilities, "p5kit.capabilities");

const capabilities = core.capabilities();
assertBoolean(capabilities.native, "capabilities.native");
assertBoolean(capabilities.capacitor, "capabilities.capacitor");
assertBoolean(capabilities.canvas, "capabilities.canvas");
assertBoolean(capabilities.haptics, "capabilities.haptics");
assertBoolean(capabilities.share, "capabilities.share");
assertBoolean(capabilities.webShare, "capabilities.webShare");
assertBoolean(capabilities.clipboard, "capabilities.clipboard");

const globalApi = core.installP5KitGlobal({});
assertFunction(globalApi.capabilities, "installed global capabilities");

function assertFunction(value, label) {
  if (typeof value !== "function") {
    throw new Error(`Expected ${label} to be a function`);
  }
}

function assertBoolean(value, label) {
  if (typeof value !== "boolean") {
    throw new Error(`Expected ${label} to be a boolean`);
  }
}
