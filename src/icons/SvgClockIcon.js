import Svg, { Path } from "react-native-svg";
import { colors } from "../uikit/UikitUtils/colors";

export const ClockIcon = ({ size = 18, color = colors.gray[500] }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12.5 7v5.5L17 15l-1 1.61-5.5-3.36V7h1.5z"
    />
  </Svg>
);
