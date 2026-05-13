import { SwitchProps } from '@/components/presentation/foundation/gesture-wrappers/switch-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Host, Switch as NativeSwitch } from '@expo/ui/jetpack-compose';

export function Switch(props: SwitchProps) {
  const { colors } = useAppTheme();
  return (
    <Host matchContents style={{ marginBlock: -14 }}>
      <NativeSwitch
        value={props.value}
        onCheckedChange={props.onValueChange}
        enabled={!props.disabled}
        colors={{
          checkedTrackColor: colors.primary,
          checkedThumbColor: colors.onPrimary,
          checkedBorderColor: colors.primary,
          checkedIconColor: colors.onPrimaryContainer,

          uncheckedTrackColor: colors.surfaceVariant,
          uncheckedThumbColor: colors.outline,
          uncheckedBorderColor: colors.outline,
          uncheckedIconColor: colors.surfaceVariant,

          disabledCheckedTrackColor: colors.onSurface,
          disabledCheckedThumbColor: colors.surface,
          disabledCheckedBorderColor: colors.onSurface,
          disabledCheckedIconColor: colors.onSurface,

          disabledUncheckedTrackColor: colors.surfaceVariant,
          disabledUncheckedThumbColor: colors.onSurface,
          disabledUncheckedBorderColor: colors.onSurface,
          disabledUncheckedIconColor: colors.surfaceVariant,
        }}
      />
    </Host>
  );
}
