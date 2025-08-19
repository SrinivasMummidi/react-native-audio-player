//
//  WebView.swift
//  AudioPlayerReact
//
//  Created by Assistant on 30/07/25.
//

import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL
    let accessToken: String
    let connectionId: String
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
    let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
    #if DEBUG
    webView.isInspectable = true
    #endif
        return webView
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        webView.load(request)
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, WKNavigationDelegate {
        var parent: WebView
        
        init(_ parent: WebView) {
            self.parent = parent
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            // Initialize the audio player once the page loads
            // Add a small delay to ensure page JavaScript is fully loaded
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                                // Escape values for JS template literals
                                let token = self.parent.accessToken
                                let connId = self.parent.connectionId
                                let initScript = """
                                        console.log('Attempting to initialize audio player...');
                                        (function(){
                                            const token = `\(token)`;
                                            const connectionId = `\(connId)`;
                                            function doInit(){
                                                if (typeof initializeAudioPlayer === 'function') {
                                                    try {
                                                        initializeAudioPlayer(JSON.stringify({ accessToken: token, connectionId, mode: "dev-preview" }));
                                                        console.log('Audio player initialization called');
                                                    } catch (e) {
                                                        console.log('initializeAudioPlayer error:', (e && e.message) ? e.message : e);
                                                    }
                                                } else {
                                                    console.log('initializeAudioPlayer function not found, retrying in 1s');
                                                    setTimeout(doInit, 1000);
                                                }
                                            }
                                            doInit();
                                        })();
                                """
                
                webView.evaluateJavaScript(initScript) { result, error in
                    if let error = error {
                        print("JavaScript execution error: \(error)")
                    } else {
                        print("Audio player initialization script executed successfully")
                    }
                }
            }
        }
    }
}
