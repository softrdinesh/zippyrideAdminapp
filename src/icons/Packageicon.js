import React from 'react'
import { Svg, Path, Rect } from 'react-native-svg'

const Packageicon = ({ size = 24, color = '#000', strokeWidth = 2, ...rest }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      {/* Suitcase body */}
      <Rect
        x="3"
        y="7"
        width="18"
        height="12"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Suitcase handle */}
      <Path
        d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Handle detail */}
      <Rect x="10.5" y="11" width="3" height="2" rx="0.5" fill={color} />
    </Svg>
  )
}

export default Packageicon
