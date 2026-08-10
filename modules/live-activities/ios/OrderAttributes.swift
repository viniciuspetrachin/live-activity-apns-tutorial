// PedidoVivo — Live Activities via APNs
// Copyright (c) 2026 Vinicius R. Petrarchin — MIT License

import ActivityKit
import Foundation

/// Canonical copy for the native module (pod).
/// DEVE permanecer idêntica a `targets/widget/_shared/OrderAttributes.swift`
/// — o APNs usa `"attributes-type": "OrderAttributes"`.
struct OrderAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var status: String
    var title: String
    var subtitle: String
    var progress: Double
  }

  var orderId: String
}
