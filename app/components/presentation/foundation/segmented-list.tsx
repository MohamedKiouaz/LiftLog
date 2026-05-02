import Icon from '@/components/presentation/foundation/gesture-wrappers/icon';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { rounding, spacing, useAppTheme } from '@/hooks/useAppTheme';
import { useBottomSheetScrollableCreator } from '@gorhom/bottom-sheet';
import { LegendList } from '@legendapp/list';
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Card, Text } from 'react-native-paper';
import { match } from 'ts-pattern';

export function SegmentedList<T>(props: {
  renderItem: (item: T, index: number) => ReactNode;
  onItemPress?: (item: T, index: number) => void;
  itemKey?: (item: T, index: number) => string;
  items: T[];
  scrollable?: boolean;
  isInBottomSheet?: boolean;
  renderScrollComponent?: ScrollView;
  style?: ViewStyle;
}) {
  const BottomSheetScrollable = useBottomSheetScrollableCreator();
  const itemKey = props.itemKey ?? ((_, index) => index.toString());
  const onItemPress = props.onItemPress;
  if (!props.scrollable) {
    return (
      <View style={[{ gap: spacing[0.5] }, props.style]}>
        {props.items.map((item, index) => (
          <SegmentedListItem
            key={itemKey(item, index)}
            isFirst={index === 0}
            isLast={index === props.items.length - 1}
            onPress={onItemPress ? () => onItemPress(item, index) : undefined}
          >
            {props.renderItem(item, index)}
          </SegmentedListItem>
        ))}
      </View>
    );
  }
  return (
    <LegendList
      contentContainerStyle={[props.style]}
      ItemSeparatorComponent={() => (
        <View style={{ height: spacing[0.5] }}></View>
      )}
      data={props.items}
      renderScrollComponent={
        props.isInBottomSheet ? BottomSheetScrollable : undefined!
      }
      keyExtractor={itemKey}
      renderItem={({ item, index }) => (
        <SegmentedListItem
          key={itemKey(item, index)}
          isFirst={index === 0}
          isLast={index === props.items.length - 1}
          onPress={onItemPress ? () => onItemPress(item, index) : undefined}
        >
          {props.renderItem(item, index)}
        </SegmentedListItem>
      )}
    />
  );
}

export function SegmentListFormElement(props: {
  label: string;
  icon: AppIconSource;
  right?: ReactNode | string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View
        style={{ flexDirection: 'row', gap: spacing[2], alignItems: 'center' }}
      >
        <Icon size={20} source={props.icon} />
        <Text variant="labelLarge">{props.label}</Text>
      </View>
      {typeof props.right === 'string' ? (
        <Text variant="labelLarge">{props.right}</Text>
      ) : (
        props.right
      )}
    </View>
  );
}

function SegmentedListItem(props: {
  isFirst: boolean;
  isLast: boolean;
  children: ReactNode;
  onPress: undefined | (() => void);
}) {
  const { colors } = useAppTheme();
  const style = match(props)
    .with(
      {
        isFirst: true,
        isLast: true,
      },
      () => styles.onlyItem,
    )
    .with({ isFirst: true }, () => styles.firstItem)
    .with({ isLast: true }, () => styles.lastItem)
    .with({ isFirst: false, isLast: false }, () => styles.middleItem)
    .exhaustive();
  return (
    <Card
      mode="elevated"
      elevation={0}
      style={[{ backgroundColor: colors.surfaceContainer }, style]}
      onPress={props.onPress}
    >
      <Card.Content>{props.children}</Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  onlyItem: {},
  firstItem: {
    borderBottomLeftRadius: rounding.segmentedBetweenRadius,
    borderBottomRightRadius: rounding.segmentedBetweenRadius,
  },
  middleItem: {
    borderTopLeftRadius: rounding.segmentedBetweenRadius,
    borderTopRightRadius: rounding.segmentedBetweenRadius,
    borderBottomLeftRadius: rounding.segmentedBetweenRadius,
    borderBottomRightRadius: rounding.segmentedBetweenRadius,
  },
  lastItem: {
    borderTopLeftRadius: rounding.segmentedBetweenRadius,
    borderTopRightRadius: rounding.segmentedBetweenRadius,
  },
});
