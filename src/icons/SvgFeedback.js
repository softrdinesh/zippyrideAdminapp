import React from "react";
import Svg, { Path } from "react-native-svg";
import { colors } from "../uikit/UikitUtils/colors"; // Adjust path if needed

const SvgFeedbackIcon = ({ color = colors.gray[600], size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"
    />
  </Svg>
);

export default SvgFeedbackIcon;
