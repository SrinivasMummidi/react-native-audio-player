//
//  AudioPlayerTurboModule.mm
//  React Native Audio Player
//
//  Turbo Module implementation following official RN docs
//

#import <Foundation/Foundation.h>

#ifdef RCT_NEW_ARCH_ENABLED

#import <AudioPlayerSpec/AudioPlayerSpec.h>

@interface AudioPlayerTurboModule : NSObject <NativeAudioPlayerSpec>
@end

@implementation AudioPlayerTurboModule

RCT_EXPORT_MODULE(AudioPlayer)

- (void)getGreetingFromNative:(NSString *)name
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject
{
    NSLog(@"🎯 [AudioPlayerTurboModule] Received greeting request for: %@", name);
    
    // 🏗️ iOS BEST PRACTICE: Use Service Registry (Dependency Injection)
    NSArray *registryClassNames = @[
        @"TurboModuleServiceRegistry",
        @"AudioPlayerReact.TurboModuleServiceRegistry",
        @"AudioPlayerReactApp.TurboModuleServiceRegistry"
    ];
    
    for (NSString *registryClassName in registryClassNames) {
        Class registryClass = NSClassFromString(registryClassName);
        NSLog(@"🔍 [AudioPlayerTurboModule] Trying service registry class: %@, found: %@", registryClassName, registryClass ? @"YES" : @"NO");
        
        if (registryClass) {
            id sharedRegistry = [registryClass valueForKey:@"shared"];
            NSLog(@"🔍 [AudioPlayerTurboModule] Service registry shared instance: %@", sharedRegistry ? @"YES" : @"NO");
            
            if (sharedRegistry && [sharedRegistry respondsToSelector:@selector(getAudioPlayerService)]) {
                NSLog(@"🔧 [AudioPlayerTurboModule] Found service registry, getting audio player service");
                
                // Get the registered service through dependency injection
                id audioPlayerService = [sharedRegistry performSelector:@selector(getAudioPlayerService)];
                NSLog(@"🔍 [AudioPlayerTurboModule] Retrieved audio player service: %@", audioPlayerService ? @"YES" : @"NO");
                
                if (audioPlayerService && [audioPlayerService respondsToSelector:@selector(getGreetingWithName:)]) {
                    NSLog(@"🎯 [AudioPlayerTurboModule] Found registered AudioPlayerService, delegating call");
                    
                    // Call the service through the protocol interface
                    NSString *greeting = [audioPlayerService performSelector:@selector(getGreetingWithName:) withObject:name];
                    
                    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                        NSLog(@"✅ [AudioPlayerTurboModule] Received response from registered service");
                        resolve(greeting);
                    });
                    return;
                } else {
                    NSLog(@"⚠️ [AudioPlayerTurboModule] AudioPlayerService not available or doesn't respond to getGreetingWithName:");
                }
            } else {
                NSLog(@"⚠️ [AudioPlayerTurboModule] Service registry doesn't respond to getAudioPlayerService");
            }
        }
    }
    
    // 🔄 FALLBACK: Try the old dynamic lookup method as backup
    NSArray *classNames = @[
        @"AudioPlayerManager",                    // Direct name
        @"AudioPlayerReact.AudioPlayerManager",   // Module.Class format
        @"AudioPlayerReactApp.AudioPlayerManager" // App.Class format
    ];
    
    for (NSString *className in classNames) {
        Class audioPlayerManagerClass = NSClassFromString(className);
        NSLog(@"🔍 [AudioPlayerTurboModule] Fallback - Trying class name: %@, found: %@", className, audioPlayerManagerClass ? @"YES" : @"NO");
        
        if (audioPlayerManagerClass) {
            // Get the shared instance using KVC (Key-Value Coding)
            id sharedInstance = [audioPlayerManagerClass valueForKey:@"shared"];
            if (sharedInstance && [sharedInstance respondsToSelector:@selector(getGreetingWithName:)]) {
                NSLog(@"🔗 [AudioPlayerTurboModule] Fallback - Found native app AudioPlayerManager, delegating call");
                
                // Call the native app's method
                NSString *greeting = [sharedInstance performSelector:@selector(getGreetingWithName:) withObject:name];
                
                dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                    NSLog(@"✅ [AudioPlayerTurboModule] Received response from native app (fallback)");
                    resolve(greeting);
                });
                return;
            }
        }
    }
    
    // 🚨 FINAL FALLBACK: generate response from Turbo Module if nothing else works
    NSLog(@"⚠️ [AudioPlayerTurboModule] No AudioPlayerService found, using final fallback");
    NSString *appName = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleName"] ?: @"AudioPlayer";
    NSString *version = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"] ?: @"1.0";
    
    NSString *greeting = [NSString stringWithFormat:@"🎵 Hello %@!\n\nGreetings from Turbo Module fallback in %@ app (v%@)!\n\n⚠️ No AudioPlayerService found - using final fallback.\n🚀 This message was generated in Turbo Module.", name, appName, version];
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSLog(@"✅ [AudioPlayerTurboModule] Responding with final fallback greeting");
        resolve(greeting);
    });
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAudioPlayerSpecJSI>(params);
}

@end

#endif // RCT_NEW_ARCH_ENABLED
