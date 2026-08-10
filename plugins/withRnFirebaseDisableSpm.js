const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * RNFB v26+ resolve firebase-ios-sdk via SPM by default.
 * With use_frameworks static this breaks linking — disable SPM (classic CocoaPods).
 * @see https://rnfirebase.io
 */
function withRnFirebaseDisableSpm(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );
      let contents = fs.readFileSync(podfilePath, "utf8");
      if (!contents.includes("$RNFirebaseDisableSPM")) {
        contents = `$RNFirebaseDisableSPM = true\n\n${contents}`;
        fs.writeFileSync(podfilePath, contents);
      }
      return config;
    },
  ]);
}

module.exports = withRnFirebaseDisableSpm;
