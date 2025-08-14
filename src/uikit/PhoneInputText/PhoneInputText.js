import React, {forwardRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import {
  BORDER_COLOR,
  ERROR,
  PRIMARY,
  TRANSPARENT,
  WHITE,
} from '../UikitUtils/colors';
import {isEmpty} from '../UikitUtils/validators';

const styles = StyleSheet.create({
  countryPickerButtonStyle: {
    marginLeft: 0,
  },
  containerStyle: {
    backgroundColor: WHITE,
    borderWidth: 1,
    height: 50,
    borderColor:"",
   borderRadius:10,
    width: '100%',
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
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    width: '100%',
    flex: 1,
  },
  actionLeft: {
    position: 'absolute',
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
  ref,
) => {
  const [isFocused, setIsFocused] = useState(false);
  const [countryName, setCountryName] = useState('IN');
  let borderColor = BORDER_COLOR;
  if (isFocused) {
    if (!isEmpty(error)) {
      borderColor = ERROR;
    } else {
      borderColor = PRIMARY;
    }
  } else {
    if (!isEmpty(error)) {
      borderColor = ERROR;
    } else {
     borderColor = BORDER_COLOR;
    }
  }

  return (
    <View style={styles.overAll}>
      {typeof actionLeft === 'function' && (
        <View style={[actionLeftStyle, styles.actionLeft]}>{actionLeft()}</View>
      )}
      <PhoneInput
        ref={ref}
        placeholder={placeholder}
        textInputProps={{
          onFocus: () => {
            setIsFocused(true);
          },
          onBlur: () => {
            setIsFocused(false);
          },
          maxLength: countryName == 'IN' ? 10 : 12,
        }}
        countryPickerButtonStyle={styles.countryPickerButtonStyle}
        containerStyle={[styles.containerStyle, {borderColor: borderColor}]}
        textContainerStyle={styles.textContainerStyle}
        textInputStyle={styles.textInputStyle}
        defaultCode={defaultCode ?? 'IN'}
        layout="second"
        onChangeFormattedText={onChange}
        onChangeText={onChangeText}
        value={value}
        onChangeCountry={country => {
          // Call the onChangeCountry prop with the selected country
          // onChangeCountry(country);
          // console.log('onChangeCountry country->', country);
          setCountryName(country.cca2);
          if (onChangeCountry) {
            onChangeCountry(country);
          }
        }}
      />
    </View>
  );
};

export default forwardRef(PhoneInputText);
