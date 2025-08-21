//
//  AudioPlayerManager.swift
//  AudioPlayerReact
//
//  Created by Assistant on Protocol-Oriented Architecture
//

import Foundation

/// Main audio player manager implementing the service protocol
/// This follows iOS best practices with protocol conformance and dependency injection
@objc(AudioPlayerManager)
public class AudioPlayerManager: NSObject, AudioPlayerServiceProtocol {
    
    // MARK: - Singleton
    @objc public static let shared = AudioPlayerManager()
    
    private override init() {
        super.init()
        print("🎵 [AudioPlayerManager] Singleton initialized")
        
        // Auto-register with the service registry (convenience)
        TurboModuleServiceRegistry.shared.registerAudioPlayerService(self)
    }
    
    // MARK: - AudioPlayerServiceProtocol Implementation
    
    /// Implementation of the greeting service method
    /// - Parameter name: The name to include in the greeting
    /// - Returns: A personalized greeting from the native audio player app
    @objc public func getGreeting(name: String) -> String {
        print("🎯 [AudioPlayerManager] Native app received greeting request for: \(name)")
        
        // Generate response from the NATIVE APP
        let appName = Bundle.main.infoDictionary?[kCFBundleNameKey as String] as? String ?? "AudioPlayer"
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        
        let greeting = """
        🎵 Hello \(name)!
        
        Greetings from your NATIVE \(appName) iOS app (v\(version))!
        
        ✅ Protocol-oriented 2-way communication is working perfectly!
        �️ This message was generated using iOS best practices.
        📋 Protocol: AudioPlayerServiceProtocol
        � Pattern: Dependency Injection
        """
        
        print("✅ [AudioPlayerManager] Native app responding with protocol-based greeting")
        return greeting
    }
    
    // MARK: - Future Audio Player Methods
    // These would be added as the protocol expands:
    
    /*
    @objc public func playAudio(url: String) -> Bool {
        // Real audio playback implementation
        return true
    }
    
    @objc public func pauseAudio() -> Bool {
        // Real pause implementation
        return true
    }
    */
}
