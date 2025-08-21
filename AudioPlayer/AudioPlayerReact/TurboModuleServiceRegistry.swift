//
//  TurboModuleServiceRegistry.swift
//  AudioPlayerReact
//
//  Created by Assistant on Dependency Injection Pattern
//

import Foundation

/// Service registry for Turbo Module dependencies
/// This follows iOS dependency injection best practices
@objc public class TurboModuleServiceRegistry: NSObject {
    
    // MARK: - Singleton
    @objc public static let shared = TurboModuleServiceRegistry()
    
    // MARK: - Registered Services
    private var audioPlayerService: AudioPlayerServiceProtocol?
    
    private override init() {
        super.init()
        print("🏗️ [TurboModuleServiceRegistry] Registry initialized")
    }
    
    // MARK: - Service Registration
    
    /// Register the audio player service implementation
    /// - Parameter service: The service implementation to register
    @objc public func registerAudioPlayerService(_ service: AudioPlayerServiceProtocol) {
        self.audioPlayerService = service
        print("✅ [TurboModuleServiceRegistry] AudioPlayerService registered: \(type(of: service))")
    }
    
    /// Get the registered audio player service
    /// - Returns: The registered service implementation, or nil if not registered
    @objc public func getAudioPlayerService() -> AudioPlayerServiceProtocol? {
        if audioPlayerService == nil {
            print("⚠️ [TurboModuleServiceRegistry] No AudioPlayerService registered")
        }
        return audioPlayerService
    }
    
    // MARK: - Convenience Methods
    
    /// Check if audio player service is available
    /// - Returns: true if service is registered and available
    @objc public func isAudioPlayerServiceAvailable() -> Bool {
        return audioPlayerService != nil
    }
}
