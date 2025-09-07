import React, { forwardRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import {
  BORDER_COLOR,
  ERROR,
  PRIMARY,
  TRANSPARENT,
  WHITE,
} from "../UikitUtils/colors";
import { isEmpty } from "../UikitUtils/validators";

const styles = StyleSheet.create({
  countryPickerButtonStyle: {
    marginLeft: 0,
  },
  containerStyle: {
    backgroundColor: WHITE,
    borderWidth: 1,
    height: 50,
    borderColor: "",
    borderRadius: 10,
    width: "100%",
  },
  textContainerStyle: {
    backgroundColor: TRANSPARENT,
  },
  textInputStyle: {
    height: 40,
    padding: 0,
    fontSize: 14,
  },
  overAll: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
    alignItems: "center",
    width: "100%",
    flex: 1,
  },
  actionLeft: {
    position: "absolute",
    zIndex: 11,
    left: -4,
  },
});

const PhoneInputText = (
  {
    actionLeft,
    actionLeftStyle,
    error,
    onChange,
    placeholder,
    onChangeText,
    value,
    defaultCode,
    onChangeCountry,
  },
  ref
) => {
  const [isFocused, setIsFocused] = useState(false);
  const [country, setCountry] = useState({ cca2: "IN", callingCode: ["91"] });

  let borderColor = BORDER_COLOR;
  if (isFocused || !isEmpty(error)) {
    borderColor = !isEmpty(error) ? ERROR : PRIMARY;
  }

  const callingCode = country.callingCode[0];
  const numberToDisplay =
    value && value.startsWith(`+${callingCode}`)
      ? value.substring(callingCode.length + 1)
      : value;

  return (
    <View style={styles.overAll}>
      {typeof actionLeft === "function" && (
        <View style={[actionLeftStyle, styles.actionLeft]}>{actionLeft()}</View>
      )}
      <PhoneInput
        ref={ref}
        defaultValue={numberToDisplay} // Use the stripped number for display
        placeholder={placeholder}
        textInputProps={{
          onFocus: () => {
            setIsFocused(true);
          },
          onBlur: () => {
            setIsFocused(false);
          },
          maxLength: country.cca2 == "IN" ? 10 : 12,
        }}
        countryPickerButtonStyle={styles.countryPickerButtonStyle}
        containerStyle={[styles.containerStyle, { borderColor }]}
        textContainerStyle={styles.textContainerStyle}
        textInputStyle={styles.textInputStyle}
        defaultCode={defaultCode ?? "IN"}
        layout="second"
        onChangeFormattedText={onChange} // This sends the FULL formatted number up to Formik
        onChangeText={onChangeText} // This sends the unformatted number up
        onChangeCountry={(selectedCountry) => {
          setCountry(selectedCountry);
          if (onChangeCountry) {
            onChangeCountry(selectedCountry);
          }
        }}
      />
    </View>
  );
};

export default forwardRef(PhoneInputText);
