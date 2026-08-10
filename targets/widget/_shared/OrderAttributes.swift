// PedidoVivo — Live Activities via APNs
// Copyright (c) 2026 Vinicius R. Petrarchin — MIT License

import ActivityKit
import Foundation

/// Order Live Activity schema (PedidoVivo demo).
///
/// IMPORTANTE para APNs push-to-start:
/// o payload usa `"attributes-type": "OrderAttributes"` —
/// esse string DEVE ser exatamente o nome deste struct Swift.
///
/// Mantenha idêntico a `modules/live-activities/ios/OrderAttributes.swift`.
struct OrderAttributes: ActivityAttributes {
  /// Estado dinâmico — vai em `aps["content-state"]` nos pushes update/end/start.
  public struct ContentState: Codable, Hashable {
    /// preparing | on_the_way | delivered
    var status: String
    var title: String
    var subtitle: String
    /// 0...1
    var progress: Double
  }

  /// Fixo durante a vida da activity — vai em `aps.attributes` no start.
  var orderId: String
}
