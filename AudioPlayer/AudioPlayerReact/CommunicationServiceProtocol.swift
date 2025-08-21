//
//  CommunicationServiceProtocol.swift
//  AudioPlayerReact
//
//  Created by Assistant on Protocol-Oriented Design
//

import Foundation

@objc public protocol CommunicationServiceProtocol: NSObjectProtocol {
    func processEvents(event: String) -> String
}
