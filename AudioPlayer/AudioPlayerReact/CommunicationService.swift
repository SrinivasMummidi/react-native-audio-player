//
//  CommunicationService.swift
//  AudioPlayerReact
//
//  Created by Assistant on Protocol-Oriented Architecture
//

import Foundation

/// Main audio player manager implementing the service protocol
/// This follows iOS best practices with protocol conformance and dependency injection
@objc(CommunicationService)
public class CommunicationService: NSObject, CommunicationServiceProtocol {
    
    // MARK: - Singleton
    @objc public static let shared = CommunicationService()
    
    private override init() {
        super.init()
        print("🎵 [CommunicationService] Singleton initialized")
        
        // Auto-register with the service registry (convenience)
        NativeCommunicationServiceRegistry.shared.registerCommunicationService(self)
    }
    
    // MARK: - CommunicationServiceProtocol Implementation

    /// Implementation of the communication service method
    /// - Parameter event: The event to process
    /// - Returns: A response from the native audio player app
    @objc public func processEvents(event: String) -> String {
        print("🎯 [CommunicationService] Native app received event: \(event)")
        let accessToken = "<access_token>"
        return accessToken
    }
    
}
