//
//  NativeCommunicationEmitter.swift
//  AudioPlayerReact
//
//  Lightweight helper to emit events to React Native via NotificationCenter.
//

import Foundation

extension Notification.Name {
    static let nativeCommunicationEvent = Notification.Name("NativeCommunicationEvent")
}

public enum NativeCommunicationEmitter {
    public static func emit(type: String, data: String? = nil) {
        var userInfo: [String: Any] = ["type": type]
        if let data = data { userInfo["data"] = data }
        NotificationCenter.default.post(name: .nativeCommunicationEvent,
                                        object: nil,
                                        userInfo: userInfo)
    }
}
