//
//  ContentView.swift
//  AudioPlayerNative
//
//  Created by Srinivas Mummidi on 24/07/25.
//

import SwiftUI
import WebKit
import NativeAppReact

struct ContentView: View {
    @State private var showSheet: Bool = false
    @FocusState private var focusedField: Field?
    private enum Field { case connectionId, accessToken }
    @State private var navigateReactNative: Bool = false
    @State private var navigateWebView: Bool = false
    @State private var inputConnectionId: String = {
        // Default from previously hard-coded example; override below if desired
        if let env = ProcessInfo.processInfo.environment["CONNECTION_ID"], !env.isEmpty {
            return env
        }
        // Fallback to Info.plist if you add CONNECTION_ID later; else default to sample
        let plistValue = Bundle.main.infoDictionary?["CONNECTION_ID"] as? String
        return plistValue ?? "adfe9954-aefc-4b4e-ba43-4dcd4073e2a5"
    }()
    @State private var inputAccessToken: String = {
        if let env = ProcessInfo.processInfo.environment["ACCESS_TOKEN"], !env.isEmpty {
            return env
        }
        return Bundle.main.infoDictionary?["ACCESS_TOKEN"] as? String ?? ""
    }()
    var callRecApiKey: String {
        if let env = ProcessInfo.processInfo.environment["CALLREC_API_KEY"], !env.isEmpty {
            return env
        }
        return Bundle.main.infoDictionary?["CALLREC_API_KEY"] as? String ?? ""
    }
    var body: some View {
        NavigationView {
            VStack(spacing: 16) {
                Text("Audio Player Component")
                    .padding()

                // Inputs for Connection ID and Access Token
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Connection ID").font(.caption).foregroundColor(.secondary)
                        Spacer()
                        Button("Paste") { if let s = UIPasteboard.general.string { inputConnectionId = s } }
                            .font(.caption)
                    }
                    TextField("Enter connection ID", text: $inputConnectionId)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled(true)
                        .textContentType(.oneTimeCode)
                        .submitLabel(.done)
                        .onSubmit { focusedField = nil }
                        .padding(10)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.gray.opacity(0.3)))
                        .focused($focusedField, equals: .connectionId)

                    HStack {
                        Text("Access Token").font(.caption).foregroundColor(.secondary)
                        Spacer()
                        Button("Paste") { if let s = UIPasteboard.general.string { inputAccessToken = s } }
                            .font(.caption)
                    }
                    ZStack(alignment: .topLeading) {
                        TextEditor(text: $inputAccessToken)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled(true)
                            .frame(minHeight: 100, maxHeight: 180, alignment: .topLeading)
                            .focused($focusedField, equals: .accessToken)
                        if inputAccessToken.isEmpty {
                            Text("Enter access token")
                                .foregroundColor(.secondary)
                                .padding(.top, 8)
                                .padding(.leading, 4)
                                .allowsHitTesting(false)
                        }
                    }
                    .padding(10)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.gray.opacity(0.3)))

                    HStack {
                        Spacer()
                        Text("\(inputAccessToken.count) characters")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                .padding([.leading, .trailing])
                .padding(.vertical, 8)
                .onTapGesture { focusedField = nil }
                //                Button("Present WebView") {
                //                    showSheet = true
                //                }
                
                let isFormValid = !inputConnectionId.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !inputAccessToken.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty

                // Hidden navigation links controlled by state
                NavigationLink(isActive: $navigateReactNative) {
                    ReactNativeView(
                        moduleName: "NativeApp",
                        initialProperties: [
                            "callRecApiKey":  "\(callRecApiKey)",
                            "accessToken": "\(inputAccessToken)",
                            "connectionId": "\(inputConnectionId)",
                            "mode": "dev-preview",
                            "access": "OWNER"
                        ]
                    )
                } label: { EmptyView() }.hidden()

                NavigationLink(isActive: $navigateWebView) {
                    WebView(
                        url: URL(string: "https://phonesystem-apps-qa-14908427417.us-central1.run.app/webview")!,
                        accessToken: inputAccessToken,
                        connectionId: inputConnectionId
                    )
                } label: { EmptyView() }.hidden()

                // Visible buttons that trigger navigation
                Button {
                    focusedField = nil
                    navigateReactNative = true
                } label: {
                    Text("Open React Native Screen").frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(!isFormValid)
                .opacity(isFormValid ? 1 : 0.5)
                .padding(.horizontal)

                Button {
                    focusedField = nil
                    navigateWebView = true
                } label: {
                    Text("Open Web View").frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .disabled(!isFormValid)
                .opacity(isFormValid ? 1 : 0.5)
                .padding(.horizontal)
                
            }
            // Intentionally no .toolbar for keyboard; use submit and tap to dismiss
            //            .sheet(isPresented: $showSheet) {
            //                WebView(url: URL(string: "https://wsk66k6v-3000.inc1.devtunnels.ms/webview")!)
            //            }
        }
    }
}
