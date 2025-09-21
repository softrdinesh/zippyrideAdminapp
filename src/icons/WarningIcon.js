import Svg, { Path } from "react-native-svg";
import { colors } from "../uikit/UikitUtils/colors";

export const WarningIcon = ({ color = colors.status.error, size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </Svg>
);
