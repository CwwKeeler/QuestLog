const { execFileSync } = require("child_process");

exports.default = async function afterPack(context) {
  if (process.platform !== "darwin" || context.electronPlatformName !== "darwin") {
    return;
  }

  if (!context.appOutDir) {
    return;
  }

  try {
    execFileSync("xattr", ["-cr", context.appOutDir], {
      stdio: "inherit"
    });
  } catch (error) {
    console.warn(`Could not clear macOS extended attributes for ${context.appOutDir}.`, error);
    throw error;
  }
};
