import React from 'react';
import {StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import SvgSuccess from '../../icons/SvgSccess';
import Button from '../../uikit/Button/Button';
import Card from '../../uikit/Card/Card';
import Flex from '../../uikit/Flex/Flex';
import Text from '../../uikit/Text/Text';
import {WHITE} from '../../uikit/UikitUtils/colors';
import SvgFailure from '../../icons/SvgFailure';

const styles = StyleSheet.create({
  overAll: {
    backgroundColor: WHITE,
    borderRadius: 4,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  cancelBtn: {
    marginRight: 16,
  },
  btnContainer: {
    marginTop: 24,
  },
  placeText: {
    marginTop: 8,
  },
});

const Registererrormodal = ({open, close,message}) => {
  return (
    <Modal animationInTiming={0} animationIn="slideInLeft" isVisible={open}>
      <Card overrideStyle={styles.overAll}>
        <Flex center>
          <SvgFailure height={60} width={60} />
        </Flex>
        <Text align={'center'} bold overrideStyle={styles.placeText}>
         {message}
        </Text>
        <Flex middle center overrideStyle={styles.btnContainer}>
          <Button onClick={close}>Okay</Button>
        </Flex>
      </Card>
    </Modal>
  );
};

export default Registererrormodal;
