const { withInfoPlist } = require("expo/config-plugins");

/**
 * Ensures Live Activities keys in the main app Info.plist.
 * (Can also go in app.json → ios.infoPlist; the plugin makes the intent explicit in the tutorial.)
 */
function withLiveActivities(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.NSSupportsLiveActivities = true;
    config.modResults.NSSupportsLiveActivitiesFrequentUpdates = true;
    return config;
  });
}

module.exports = withLiveActivities;
