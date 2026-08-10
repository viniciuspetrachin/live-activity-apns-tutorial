package expo.modules.liveactivities

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Stub: Live Activities são iOS-only neste tutorial. */
class LiveActivitiesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LiveActivities")

    Events("pushToStartTokenDidChange", "pushToUpdateTokenDidChange")

    Function("areActivitiesEnabled") { false }

    Function("getPushToStartToken") { null }

    Function("getActiveActivities") {
      emptyList<Map<String, Any>>()
    }

    Function("startObservingTokens") { }
  }
}
