Pod::Spec.new do |s|
  s.name           = 'LiveActivities'
  s.version        = '1.0.0'
  s.summary        = 'Observa pushToStartToken / pushToUpdateToken de Live Activities'
  s.description    = 'Expo Module do tutorial PedidoVivo — tokens APNs only (sem Activity.request)'
  s.author         = 'viniciuspetrachin'
  s.homepage       = 'https://github.com/viniciuspetrachin/live-activity-apns-tutorial'
  s.platforms      = {
    :ios => '16.2'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'ActivityKit'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
