import SwiftUI
import WidgetKit

@main
struct exportWidgets: WidgetBundle {
  var body: some Widget {
    // Tutorial focuses on Live Activity via APNs (not home-screen widget).
    WidgetLiveActivity()
  }
}
