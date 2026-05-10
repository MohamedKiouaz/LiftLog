import { Appbar } from 'react-native-paper';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useScroll } from '@/hooks/useScrollListener';
import { useEffect, useRef } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Animated, Platform } from 'react-native';

export default function MaterialStackHeader(props: NativeStackHeaderProps) {
  const { isScrolled } = useScroll();
  const scrollColor = useRef(new Animated.Value(0)).current;
  const { colors } = useAppTheme();

  useEffect(() => {
    Animated.timing(scrollColor, {
      toValue: isScrolled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isScrolled, scrollColor]);

  const backgroundColor = scrollColor.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.surfaceContainer],
  });

  return (
    <Animated.View style={{ backgroundColor }}>
      <Appbar.Header
        mode={props.back && Platform.OS !== 'ios' ? 'small' : 'center-aligned'}
        style={{ backgroundColor: 'transparent' }}
      >
        {props.back ? (
          <Appbar.BackAction onPress={() => props.navigation.goBack()} />
        ) : null}
        <Appbar.Content title={props.options.title} />
        {props.options.headerRight?.({})}
      </Appbar.Header>
    </Animated.View>
  );
}
