import React from 'react';
import Svg, { Path } from 'react-native-svg';

const defaultProps = {
    width: 22,
    height: 16, // Reduced height
    fill: 'red',
};

const SvgEmail = ({ width, height, fill }) => {
  return (
    <Svg 
      viewBox="0 0 24 16" // Adjusted viewBox to match the reduced height
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height}
    >
      <Path 
        d="M4 6.00005L10.2 10.65C11.2667 11.45 12.7333 11.45 13.8 10.65L20 6" 
        stroke="#7f7f7f" 
        strokeWidth={1} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M3 6.17681C3 5.45047 3.39378 4.78123 4.02871 4.42849L11.0287 0.5396C11.6328 0.20402 12.3672 0.20402 12.9713 0.5396L19.9713 4.42849C20.6062 4.78123 21 5.45047 21 6.17681V14C21 15.1046 20.1046 16 19 16H5C3.89543 16 3 15.1046 3 14V6.17681Z" 
        stroke="#7f7f7f" 
        strokeWidth={1} 
        strokeLinecap="round"
      />
    </Svg>
  );
};

SvgEmail.defaultProps = defaultProps;

export default SvgEmail;
