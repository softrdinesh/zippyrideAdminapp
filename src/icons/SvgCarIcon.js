import * as React from "react";
import Svg, { G, Circle, Path } from "react-native-svg";

function SvgCarIcon(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 256 256"
      {...props}
    >
      <G
        transform="matrix(2.81 0 0 2.81 1.407 1.407)"
        stroke="none"
        strokeWidth={0}
        strokeDasharray="none"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit={10}
        fill="none"
        fillRule="nonzero"
        opacity={1}
      >
        <Circle
          cx={70.735}
          cy={56.775}
          r={1.955}
          stroke="none"
          strokeWidth={1}
          strokeDasharray="none"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit={10}
          fill={props.color ?? "#000"}
          fillRule="nonzero"
          opacity={1}
        />
        <Circle
          cx={19.765}
          cy={56.775}
          r={1.955}
          stroke="none"
          strokeWidth={1}
          strokeDasharray="none"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit={10}
          fill={props.color ?? "#000"}
          fillRule="nonzero"
          opacity={1}
        />
        <Path
          d="M75.479 36.045l-7.987-1.22-2.35-2.574a29.686 29.686 0 00-21.874-9.649h-6.245c-1.357 0-2.696.107-4.016.296l-.066.01a28.1 28.1 0 00-19.285 12.106C5.706 37.913 0 45.358 0 52.952c0 3.254 2.647 5.9 5.9 5.9h3.451c.969 4.866 5.269 8.545 10.416 8.545s9.447-3.679 10.416-8.545h30.139c.969 4.866 5.27 8.545 10.416 8.545s9.446-3.679 10.415-8.545H84.1c3.254 0 5.9-2.646 5.9-5.9 0-8.511-6.106-15.621-14.521-16.907zm-32.21-9.443a25.668 25.668 0 0118.676 8.094H39.464l-3.267-8.068c.275-.009.55-.026.826-.026h6.246zm-11.189.516l3.068 7.578H18.972a24.086 24.086 0 0113.108-7.578zM19.767 63.397a6.63 6.63 0 01-6.623-6.622c0-3.652 2.971-6.623 6.623-6.623s6.623 2.971 6.623 6.623a6.63 6.63 0 01-6.623 6.622zm50.971 0a6.63 6.63 0 01-6.623-6.622 6.63 6.63 0 016.623-6.623 6.63 6.63 0 016.622 6.623 6.629 6.629 0 01-6.622 6.622z"
          stroke="none"
          strokeWidth={1}
          strokeDasharray="none"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit={10}
          fill={props.color ?? "#000"}
          fillRule="nonzero"
          opacity={1}
        />
      </G>
    </Svg>
  );
}

export default SvgCarIcon;
