import { SwitchProps } from '@/components/presentation/foundation/gesture-wrappers/switch-props';
import { Switch as PaperSwitch } from 'react-native-paper';

export function Switch(props: SwitchProps) {
  return <PaperSwitch {...props} />;
}
