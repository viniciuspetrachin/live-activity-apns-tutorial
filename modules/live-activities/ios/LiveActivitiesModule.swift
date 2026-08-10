import ActivityKit
import ExpoModulesCore
import Foundation

/**
 PedidoVivo — Live Activities via APNs
 Copyright (c) 2026 Vinicius R. Petrarchin — MIT License

 Tutorial: observes Live Activity tokens and emits events to JS.
 Does NOT start/update/end activity on the happy path — that's APNs' job.
 */
public class LiveActivitiesModule: Module {
  private var started = false
  private var tasks: [Task<Void, Never>] = []

  public func definition() -> ModuleDefinition {
    Name("LiveActivities")

    Events("pushToStartTokenDidChange", "pushToUpdateTokenDidChange")

    OnCreate {
      self.startObserversIfNeeded()
    }

    OnDestroy {
      self.cancelObservers()
    }

    Function("areActivitiesEnabled") { () -> Bool in
      guard #available(iOS 16.2, *) else { return false }
      return ActivityAuthorizationInfo().areActivitiesEnabled
    }

    /// Current hex token (may be nil until the system emits the first one).
    Function("getPushToStartToken") { () -> String? in
      guard #available(iOS 17.2, *) else { return nil }
      guard let data = Activity<OrderAttributes>.pushToStartToken else { return nil }
      return Self.hexString(from: data)
    }

    Function("getActiveActivities") { () -> [[String: Any]] in
      guard #available(iOS 16.2, *) else { return [] }
      return Activity<OrderAttributes>.activities.map { activity in
        [
          "activityId": activity.id,
          "orderId": activity.attributes.orderId,
          "status": activity.content.state.status,
          "title": activity.content.state.title,
          "subtitle": activity.content.state.subtitle,
          "progress": activity.content.state.progress,
        ]
      }
    }

    Function("startObservingTokens") { () in
      self.startObserversIfNeeded()
    }
  }

  private func startObserversIfNeeded() {
    guard !started else { return }
    started = true

    if #available(iOS 17.2, *) {
      // Initial value, if already available
      if let data = Activity<OrderAttributes>.pushToStartToken {
        sendEvent("pushToStartTokenDidChange", [
          "pushToStartToken": Self.hexString(from: data),
        ])
      }

      tasks.append(Task { [weak self] in
        for await data in Activity<OrderAttributes>.pushToStartTokenUpdates {
          // Token → hex string (format expected by APNs sender)
          let token = Self.hexString(from: data)
          self?.sendEvent("pushToStartTokenDidChange", [
            "pushToStartToken": token,
          ])
        }
      })
    }

    if #available(iOS 16.2, *) {
      tasks.append(Task { [weak self] in
        // Already active activities (app reopened)
        for activity in Activity<OrderAttributes>.activities {
          self?.observeUpdateToken(for: activity)
        }
        for await activity in Activity<OrderAttributes>.activityUpdates {
          self?.observeUpdateToken(for: activity)
        }
      })
    }
  }

  @available(iOS 16.2, *)
  private func observeUpdateToken(for activity: Activity<OrderAttributes>) {
    tasks.append(Task { [weak self] in
      for await tokenData in activity.pushTokenUpdates {
        let token = Self.hexString(from: tokenData)
        self?.sendEvent("pushToUpdateTokenDidChange", [
          "activityId": activity.id,
          "pushToUpdateToken": token,
          // attributes.key do tutorial = orderId (fixo no start)
          "orderId": activity.attributes.orderId,
        ])
      }
    })
  }

  private func cancelObservers() {
    tasks.forEach { $0.cancel() }
    tasks.removeAll()
    started = false
  }

  /// Converte Data do token APNs em hex lowercase (`%02x`).
  private static func hexString(from data: Data) -> String {
    data.map { String(format: "%02x", $0) }.joined()
  }
}
