//
//  NativeCommunicationTurboModule.mm
//  React Native Audio Player
//
//  Turbo Module implementation following official RN docs
//

#import <Foundation/Foundation.h>

#ifdef RCT_NEW_ARCH_ENABLED

#import <NativeCommunicationSpec/NativeCommunicationSpec.h>

@interface NativeCommunicationTurboModule : NSObject <NativeCommunicationSpec>
@end

@implementation NativeCommunicationTurboModule

RCT_EXPORT_MODULE(NativeCommunication)

- (void)processEvents:(NSString *)event
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject {
  NSLog(@"🎯 [NativeCommunicationTurboModule] Received event: %@", event);
  Class registryClass =
      NSClassFromString(@"AudioPlayerReact.NativeCommunicationServiceRegistry");

  if (registryClass) {
    id sharedRegistry = [registryClass valueForKey:@"shared"];
    NSLog(@"🔍 [NativeCommunicationTurboModule] Service registry shared "
          @"instance: %@",
          sharedRegistry ? @"YES" : @"NO");
    if (sharedRegistry &&
        [sharedRegistry respondsToSelector:@selector(processEvents:)]) {
      NSLog(@"🎯 [NativeCommunicationTurboModule] Found registered "
            @"processEvents, delegating call");

      // Call the service through the protocol interface
      NSString *response =
          [sharedRegistry performSelector:@selector(processEvents:)
                               withObject:event];

      NSLog(@"✅ [NativeCommunicationTurboModule] Received response from "
            @"registered service");
      resolve(response);
      return;
    } else {
      NSLog(@"⚠️ [NativeCommunicationTurboModule] NativeCommunication not "
            @"available or doesn't respond to processEvents:");
      reject(@"NO_PROCESS_EVENTS", @"Service does not implement processEvents",
             nil);
      return;
    }
  }
  reject(@"NO_REGISTRY", @"Could not find NativeCommunicationServiceRegistry",
         nil);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeCommunicationSpecJSI>(params);
}

@end

#endif // RCT_NEW_ARCH_ENABLED
