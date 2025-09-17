import Svg, { Path } from "react-native-svg";
import { colors } from "../uikit/UikitUtils/colors";

export const TelegramIcon = ({ color = colors.gray[500] }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.62 12c-.88-.25-.88-1.37 0-1.62l16.84-6.37c.71-.27 1.36.22 1.15.99L19.34 18c-.16.58-.58.72-1.11.45l-4.88-3.58l-2.31 2.2a1.28 1.28 0 0 1-1.28.2z"
    />
  </Svg>
);
