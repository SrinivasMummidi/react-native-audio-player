//
//  AudioPlayerNativeApp.swift
//  AudioPlayerNative
//
//  Entry point for the iOS host app that embeds the React Native experience.
//  This file wires up application lifecycle, starts the React Native Brownfield
//  runtime, and (for this project) emits native->JS events on an interval.
//
//  Created by Srinivas Mummidi on 24/07/25.
//


import SwiftUI                 // SwiftUI hosting for the native container UI
import UIKit                   // UIApplication lifecycle APIs and app plumbing
import NativeAppReact          // Brownfield integration to launch RN from Swift

// Provide a concrete UIApplicationDelegate with a `window` property so
// frameworks expecting it (e.g., RN/Brownfield or other libs) don't crash.
// This delegate is responsible for starting the RN runtime and managing
// process-wide capabilities like timers.
class AppDelegate: NSObject, UIApplicationDelegate {
    var window: UIWindow?               // The app's main window (optional here, but expected by some frameworks)
    private var eventTimer: Timer?      // Repeating timer to emit native->JS events at a fixed cadence

    // App launch entry point, invoked by iOS after the app is initialized.
    func application(
        _ application: UIApplication,                                 // The singleton UIApplication instance
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil // Launch options passed from the system (push, URL, etc.)
    ) -> Bool {
        // Initialize React Native Brownfield once, with launch options.
        // Access the CommunicationService singleton to ensure the DI registry registers it at startup.
        let serviceRegistery = CommunicationService.shared             // Triggers native service registration with the registry

        // Point Brownfield to the RN bundle provider (framework-provided symbol)
        ReactNativeBrownfield.shared.bundle = ReactNativeBundle

        // Start the React Native runtime. The onBundleLoaded closure fires when the JS bundle is ready.
        ReactNativeBrownfield.shared.startReactNative(
            onBundleLoaded: {
                print("React Native bundle loaded from AppDelegate")      // Helpful diagnostic for startup order

                // Sample emit: Notify JS that RN bundle completed loading (native-originated event)
                NativeCommunicationEmitter.emit(type: "rnBundleLoaded")

                // Start a repeating emitter every 5 seconds (native->JS heartbeat)
                // Using main queue ensures timer is scheduled on the main run loop.
                DispatchQueue.main.async {
                    // If a previous timer exists (e.g., hot-reload), stop it before creating a new one
                    self.eventTimer?.invalidate()
                    // Create a repeating timer that fires every 5 seconds
                    self.eventTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { _ in
                        // Format current timestamp to include as event data
                        let ts = ISO8601DateFormatter().string(from: Date())
                        // Emit a "heartbeat" event to JS with the timestamp as optional data
                        NativeCommunicationEmitter.emit(type: "heartbeat", data: ts)
                    }
                    // Ensure the timer continues during common run loop modes (e.g., while scrolling)
                    RunLoop.main.add(self.eventTimer!, forMode: .common)
                }
            },
            launchOptions: launchOptions
        )

        // Sample emit: App process started (may precede JS subscription; use heartbeats for ongoing signals)
        NativeCommunicationEmitter.emit(type: "appStarted")

        return true                                                    // Tell iOS launch succeeded
    }

    // Called when the app is about to terminate; clean up the repeating timer to avoid leaks.
    func applicationWillTerminate(_ application: UIApplication) {
        eventTimer?.invalidate()                                       // Stop the timer so it no longer fires
        eventTimer = nil                                               // Release the reference
    }
}

@main
struct AudioPlayerNativeApp: App {                     // SwiftUI application entry point
    // Attach our AppDelegate to the SwiftUI app lifecycle so RN and other
    // UIKit-driven systems can interoperate (access to UIApplication delegate).
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {                                  // Root window scene of the app
            ContentView()                              // The native SwiftUI shell UI shown on launch
        }
    }
}

