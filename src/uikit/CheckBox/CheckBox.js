import React, { useCallback } from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import SvgCheckBox from "../../icons/SvgCheckBox";
import SvgCheckBoxOutline from "../../icons/SvgCheckBoxOutline";
import { colors } from "../UikitUtils/colors";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
  },
  label: {
    marginLeft: 8,
    maxWidth: "91%",
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 4,
  },
});

const CheckBox = ({
  size = 24,
  onClick,
  checked,
  onBlur,
  label,
  labelColor = "#000000",
  labelSize = 14,
  scale,
  name = "",
  value,
  testID,
  disabled = false,
  error = false,
  errorMessage = "",
  required = false,
}) => {
  const handleOnClick = useCallback(
    (e) => {
      if (disabled) return;

      const isValuePresent = Array.isArray(value);
      if (typeof onClick === "function") {
        if (!value) {
          e.target.value = [name];
        } else if (isValuePresent) {
          if (value.includes(name)) {
            const filteredValue = value.filter((v) => v !== name);
            e.target.value = filteredValue;
          } else {
            e.target.value = [...value, name];
          }
        }
        onClick(e);
      }
    },
    [onClick, name, value, disabled]
  );

  const getCheckboxColor = () => {
    if (disabled) return colors.gray[300];
    if (error) return colors.status.error;
    return colors.brand.primary;
  };

  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={handleOnClick}
        onBlur={onBlur}
        activeOpacity={disabled ? 1 : 0.7}
        style={[
          styles.container,
          disabled && styles.disabled,
          error && styles.error,
        ]}
        accessible={true}
        accessibilityLabel={label}
        accessibilityRole="checkbox"
        accessibilityState={{
          checked,
          disabled,
        }}
      >
        {checked ? (
          <SvgCheckBox
            width={size}
            height={size}
            fill={getCheckboxColor()}
            scale={scale}
          />
        ) : (
          <SvgCheckBoxOutline
            scale={scale}
            width={size}
            height={size}
            fill={getCheckboxColor()}
          />
        )}
        {label && (
          <Text
            testID="label"
            ellipsizeMode="tail"
            numberOfLines={1}
            style={[
              styles.label,
              {
                fontSize: labelSize,
                color: disabled ? colors.gray[300] : labelColor,
              },
            ]}
          >
            {label}
            {required && <Text style={{ color: colors.status.error }}> *</Text>}
          </Text>
        )}
      </TouchableOpacity>
      {error && errorMessage && (
        <Text
          style={{
            color: "red",
            fontSize: 12,
            marginTop: 4,
            marginLeft: size + 8,
          }}
        >
          {errorMessage}
        </Text>
      )}
    </>
  );
};

export default CheckBox;
