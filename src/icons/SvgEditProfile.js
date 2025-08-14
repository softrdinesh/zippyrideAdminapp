import React from 'react';
import Svg, {Path} from 'react-native-svg';

const defaultProps = {
  width: 22,
  height: 22,
  fill: '#9796A1',
};

const SvgEditProfile = ({width, height}) => (
  <Svg
    width={width}
    height={height}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="#9796A1">
    <Path d="M2 21h6a1 1 0 000-2H3.071A7.011 7.011 0 0110 13a5.044 5.044 0 10-3.377-1.337A9.01 9.01 0 001 20a1 1 0 001 1zm8-16a3 3 0 11-3 3 3 3 0 013-3zm10.207 4.293a1 1 0 00-1.414 0l-6.25 6.25a1.011 1.011 0 00-.241.391l-1.25 3.75A1 1 0 0012 21a1.014 1.014 0 00.316-.051l3.75-1.25a1 1 0 00.391-.242l6.25-6.25a1 1 0 000-1.414zm-5 8.583l-1.629.543.543-1.629 5.379-5.376 1.086 1.086z" />
  </Svg>
);

SvgEditProfile.defaultProps = defaultProps;

export default SvgEditProfile;
