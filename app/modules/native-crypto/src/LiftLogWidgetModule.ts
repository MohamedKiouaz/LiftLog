import { NativeModule, requireNativeModule } from 'expo';
import { Platform } from 'react-native';

type SessionFrequencyWidgetSnapshot = {
  sessionsPerWeek: number;
  sessionCount: number;
};

declare class LiftLogWidgetModule extends NativeModule {
  updateSessionFrequency(snapshot: SessionFrequencyWidgetSnapshot): void;
}

const module =
  Platform.OS === 'android'
    ? requireNativeModule<LiftLogWidgetModule>('LiftLogWidget')
    : {
        updateSessionFrequency() {},
      };

export function updateSessionFrequencyWidget(
  snapshot: SessionFrequencyWidgetSnapshot,
) {
  module.updateSessionFrequency(snapshot);
}
