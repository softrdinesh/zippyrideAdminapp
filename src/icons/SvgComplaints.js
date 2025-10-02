import React from "react";
import Svg, { Path } from "react-native-svg";
import { colors } from "../uikit/UikitUtils/colors";

const SvgComplaintIcon = ({ color = colors.gray[600], size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zM11 7h2v6h-2zm0 8h2v2h-2z"
    />
  </Svg>
);
export default SvgComplaintIcon;
