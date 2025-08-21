//
//  NativeCommunicationServiceRegistry.swift
//  AudioPlayerReact
//
//  Created by Assistant on Dependency Injection Pattern
//

import Foundation

/// Service registry for Turbo Module dependencies
/// This follows iOS dependency injection best practices
@objc public class NativeCommunicationServiceRegistry: NSObject {
    
    // MARK: - Singleton
    @objc public static let shared = NativeCommunicationServiceRegistry()
    
    // MARK: - Registered Services
    private var communicationService: CommunicationServiceProtocol?
    
    private override init() {
        super.init()
        print("🏗️ [NativeCommunicationServiceRegistry] Registry initialized")
    }

    @objc public func registerCommunicationService(_ service: CommunicationServiceProtocol) {
        self.communicationService = service
        print("✅ [NativeCommunicationServiceRegistry] CommunicationService registered: \(type(of: service))")
    }
    
    @objc public func processEvents(_ event: String) -> String? {
        if communicationService == nil {
            print("⚠️ [NativeCommunicationServiceRegistry] No CommunicationService registered")
        }
        return communicationService?.processEvents(event: event)
    }

}
