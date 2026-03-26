import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSize } from '../../theme';

// Mock types for web
export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const MapViewWeb = forwardRef<any, any>((props, ref) => {
  return (
    <View style={[props.style, styles.webPlaceholder]}>
      <Text style={styles.text}>Map not available on web</Text>
      <Text style={styles.subtext}>Native features only</Text>
    </View>
  );
});

(MapViewWeb as any).Marker = (props: any) => null;
(MapViewWeb as any).Callout = (props: any) => null;

const styles = StyleSheet.create({
  webPlaceholder: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.textDim
  },
  subtext: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4
  }
});

export default MapViewWeb;
