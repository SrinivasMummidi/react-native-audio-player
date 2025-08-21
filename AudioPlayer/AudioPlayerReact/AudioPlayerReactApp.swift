//
//  AudioPlayerNativeApp.swift
//  AudioPlayerNative
//
//  Created by Srinivas Mummidi on 24/07/25.
//


import SwiftUI
import UIKit
import NativeAppReact

// Provide a concrete UIApplicationDelegate with a `window` property so
// frameworks expecting it (e.g., RN/Brownfield or other libs) don't crash.
class AppDelegate: NSObject, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        // Initialize React Native Brownfield once, with launch options.
        let serviceRegistery = CommunicationService.shared
        ReactNativeBrownfield.shared.bundle = ReactNativeBundle
        ReactNativeBrownfield.shared.startReactNative(onBundleLoaded: {
            print("React Native bundle loaded from AppDelegate")
        }, launchOptions: launchOptions)

        return true
    }
}

@main
struct AudioPlayerNativeApp: App {
    // Install AppDelegate to satisfy UIApplication.shared.delegate.window accessors
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

