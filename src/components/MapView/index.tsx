import React, { forwardRef } from 'react';
import MapView, { MapViewProps } from 'react-native-maps';

const MapViewWrapper = forwardRef<MapView, MapViewProps>((props, ref) => {
  return <MapView ref={ref} {...props} />;
});

export default MapViewWrapper;
export * from 'react-native-maps';
