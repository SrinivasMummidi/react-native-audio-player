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
        
        // 🏗️ iOS BEST PRACTICE: Initialize the service registry and register services
        
        // 1. Initialize the service registry (dependency injection container)
        let serviceRegistry = TurboModuleServiceRegistry.shared
        print("✅ [AppDelegate] Service registry initialized")
        
        // 2. Initialize and register audio player service
        let audioPlayerManager = AudioPlayerManager.shared
        print("✅ [AppDelegate] AudioPlayerManager initialized and registered with service registry")
        
        // 3. Verify service registration
        if serviceRegistry.isAudioPlayerServiceAvailable() {
            print("🚀 [AppDelegate] AudioPlayerService successfully registered and available")
        } else {
            print("❌ [AppDelegate] AudioPlayerService registration failed")
        }
        
        print("📱 [AppDelegate] App bundle name: \(Bundle.main.bundleIdentifier ?? "unknown")")
        
        // Initialize React Native Brownfield once, with launch options.
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

