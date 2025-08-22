//
//  NativeCommunicationTurboModule.mm
//  React Native Audio Player
//
//  Turbo Module implementation following official RN docs
//

#import <Foundation/Foundation.h>

#ifdef RCT_NEW_ARCH_ENABLED

#import <NativeCommunicationSpec/NativeCommunicationSpec.h>

@interface NativeCommunicationTurboModule : NativeCommunicationSpecBase <NativeCommunicationSpec>
@end

@implementation NativeCommunicationTurboModule

RCT_EXPORT_MODULE(NativeCommunication)

- (instancetype)init {
  self = [super init];
  if (self) {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleNativeCommunicationEvent:)
                                                 name:@"NativeCommunicationEvent"
                                               object:nil];
    NSLog(@"📡 [NativeCommunicationTurboModule] Observer registered for NativeCommunicationEvent");
  }
  return self;
}

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self
                                                  name:@"NativeCommunicationEvent"
                                                object:nil];
  NSLog(@"🧹 [NativeCommunicationTurboModule] Observer removed for NativeCommunicationEvent");
}

- (void)handleNativeCommunicationEvent:(NSNotification *)notification {
  NSDictionary *userInfo = notification.userInfo;
  if (![userInfo isKindOfClass:[NSDictionary class]]) {
    return;
  }
  id typeVal = userInfo[@"type"];
  id dataVal = userInfo[@"data"];
  if (![typeVal isKindOfClass:[NSString class]]) {
    NSLog(@"⚠️ [NativeCommunicationTurboModule] Invalid event payload: missing type");
    return;
  }
  NSMutableDictionary *payload = [NSMutableDictionary new];
  payload[@"type"] = (NSString *)typeVal;
  if ([dataVal isKindOfClass:[NSString class]]) {
    payload[@"data"] = (NSString *)dataVal;
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    [self emitOnCommunicationEvent:payload];
  });
}

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
      if (response == nil) {
        NSLog(@"⚠️ [NativeCommunicationTurboModule] Service returned nil response");
        reject(@"NO_RESPONSE", @"Service returned nil response", nil);
        return;
      }
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
