/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = () => ({
  type: "widget",
  name: "OrderLiveActivity",
  displayName: "Order Live Activity",
  // Live Activities: 16.2+; push-to-start via APNs: 17.2+
  deploymentTarget: "16.2",
  bundleIdentifier: ".widget",
  frameworks: ["SwiftUI", "WidgetKit", "ActivityKit"],
  colors: {
    $accent: "#0A7EA4",
    $widgetBackground: "#F2F2F7",
  },
});
