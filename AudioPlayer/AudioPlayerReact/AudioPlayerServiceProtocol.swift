//
//  AudioPlayerServiceProtocol.swift
//  AudioPlayerReact
//
//  Created by Assistant on Protocol-Oriented Design
//

import Foundation

/// Protocol defining the contract for audio player services
/// This follows iOS best practices for protocol-oriented programming
@objc public protocol AudioPlayerServiceProtocol: NSObjectProtocol {
    
    /// Get a greeting message from the native audio player
    /// - Parameter name: The name to include in the greeting
    /// - Returns: A personalized greeting string from the native app
    func getGreeting(name: String) -> String
    
    // Future audio player methods can be added here:
    // func playAudio(url: String) -> Bool
    // func pauseAudio() -> Bool
    // func getCurrentPlaybackState() -> PlaybackState
    // func setVolume(_ volume: Float) -> Bool
}
