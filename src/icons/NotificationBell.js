import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

const NotificationBell = ({ 
  size = 24, 
  color = '#4F46E5',
  hasNotification = false,
  notificationColor = '#4F46E5'
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Bell body */}
        <Path
          d="M18 13V9C18 5.93 16.37 3.36 13.5 2.68V2C13.5 1.17 12.83 0.5 12 0.5C11.17 0.5 10.5 1.17 10.5 2V2.68C7.64 3.36 6 5.92 6 9V13L4 15V16H20V15L18 13Z"
          fill={color}
        />
        
        {/* Bell handle */}
        <Path
          d="M12 21C13.1 21 14 20.1 14 19H10C10 20.1 10.9 21 12 21Z"
          fill={color}
        />
        
        {/* Notification dot */}
        {hasNotification && (
          <Circle cx="18" cy="7" r="4" fill={notificationColor} />
        )}
      </G>
    </Svg>
  );
};

export default NotificationBell;