import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgOwnerIcon(props) {
  return (
    <Svg
      width={props.size ?? 24}
      height={props.size ?? 24}
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      fill={props.color ?? "black"}
      overflow="hidden"
      {...props}
    >
      <Path
        d="M512 96.028a202.695 202.695 0 100 405.334 202.695 202.695 0 000-405.39zm0 64a138.638 138.638 0 110 277.277 138.638 138.638 0 010-277.333zm0 362.667a373.362 373.362 0 00-373.191 361.7l-.114 8.931a34.133 34.133 0 0034.133 34.702h678.344a34.133 34.133 0 0034.133-34.702l-.114-8.42A373.419 373.419 0 00512 522.697zm10.41 64.17a309.419 309.419 0 01296.278 268.63l.967 8.533H204.231l1.081-8.931A309.362 309.362 0 01512 586.638l10.41.228z"
        fill={props.color ?? "black"}
      />
      <Path d="M0 0h1024v1024H0z" fill="none" />
    </Svg>
  );
}

export default SvgOwnerIcon;
