// PedidoVivo — Live Activities via APNs
// Copyright (c) 2026 Vinicius R. Petrarchin — MIT License

import ActivityKit
import SwiftUI
import WidgetKit

/// UI da Live Activity (Lock Screen + Dynamic Island).
/// Start/update/end arrive only via APNs — this target only renders ContentState.
struct WidgetLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: OrderAttributes.self) { context in
      OrderLiveActivityLockScreenView(context: context)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Image(systemName: statusSymbol(context.state.status))
            .font(.title2)
        }
        DynamicIslandExpandedRegion(.center) {
          Text(context.state.title)
            .font(.headline)
            .lineLimit(1)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text("\(Int(context.state.progress * 100))%")
            .font(.caption)
            .monospacedDigit()
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(alignment: .leading, spacing: 6) {
            Text(context.state.subtitle)
              .font(.subheadline)
              .foregroundStyle(.secondary)
            ProgressView(value: min(max(context.state.progress, 0), 1))
          }
        }
      } compactLeading: {
        Image(systemName: statusSymbol(context.state.status))
      } compactTrailing: {
        Text("\(Int(context.state.progress * 100))%")
          .font(.caption2)
          .monospacedDigit()
      } minimal: {
        Image(systemName: statusSymbol(context.state.status))
      }
      .widgetURL(URL(string: "pedidovivo://order/\(context.attributes.orderId)"))
    }
  }
}

private struct OrderLiveActivityLockScreenView: View {
  let context: ActivityViewContext<OrderAttributes>

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack {
        Image(systemName: statusSymbol(context.state.status))
        Text(context.state.title)
          .font(.headline)
        Spacer()
        Text(context.attributes.orderId)
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
      Text(context.state.subtitle)
        .font(.subheadline)
        .foregroundStyle(.secondary)
      ProgressView(value: min(max(context.state.progress, 0), 1))
    }
    .padding()
    .activityBackgroundTint(Color.cyan.opacity(0.15))
  }
}

private func statusSymbol(_ status: String) -> String {
  switch status {
  case "preparing": return "fork.knife"
  case "on_the_way": return "bicycle"
  case "delivered": return "checkmark.circle.fill"
  default: return "shippingbox"
  }
}

// Previews de Live Activity exigem APIs mais novas que o deploymentTarget 16.2;
// use o Preview no Xcode com um scheme iOS 17+ se quiser iterar na UI.
