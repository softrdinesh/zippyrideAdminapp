import React from 'react';
import Svg, { Path, Rect, Line } from 'react-native-svg';

const CalendarSubscriptionIcon = ({ 
  size = 24, 
  color = '#000000',
  ...props 
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      {/* Calendar */}
      <Rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke={color}
        strokeWidth="2"
      />
      
      {/* Calendar Top Bar */}
      <Rect
        x="3"
        y="4"
        width="18"
        height="4"
        fill={color}
      />
      
      {/* Calendar Lines */}
      <Line
        x1="8"
        y1="2"
        x2="8"
        y2="6"
        stroke={color}
        strokeWidth="2"
      />
      <Line
        x1="16"
        y1="2"
        x2="16"
        y2="6"
        stroke={color}
        strokeWidth="2"
      />
      
      {/* Dollar Sign */}
      <Path
        d="M12 8V16M10 10H14M10 14H14"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Recurring Indicator */}
      <Path
        d="M18 18C16.5 19.5 14 20 12 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
    </Svg>
  );
};

export default CalendarSubscriptionIcon;