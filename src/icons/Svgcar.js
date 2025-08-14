import React from 'react';
import Svg, { Path } from 'react-native-svg';

const CarTopIcon = ({ rotation = 0 }) => (
  <Svg width="40" height="40" viewBox="0 0 64 64" style={{ transform: [{ rotate: `${rotation}deg` }] }}>
    <Path
      d="M16 2h32l6 12v36l-6 12H16l-6-12V14z"
      fill="black"
      stroke="#000"
      strokeWidth="2"
    />
    <Path d="M20 6h24v8H20z" fill="#333" />
    <Path d="M24 50h16v8H24z" fill="#666" />
  </Svg>
);

export default CarTopIcon;
