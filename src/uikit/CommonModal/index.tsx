import React from "react";
import { StyleSheet } from "react-native";
import Modal from "react-native-modal";
import SvgSuccess from "../../icons/SvgSccess";
import SvgFailure from "../../icons/SvgFailure";
import Button from "../Button/Button";
import Card from "../Card/Card";
import Flex from "../Flex/Flex";
import Text from "../Text/Text";
import { WHITE } from "../UikitUtils/colors";

const styles = StyleSheet.create({
  overAll: {
    backgroundColor: WHITE,
    borderRadius: 4,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  btnContainer: {
    marginTop: 24,
  },
  messageText: {
    marginTop: 8,
  },
});

const CommonModal = ({
  isOpen,
  onClose,
  message,
  type = "success",
  buttonText = "Okay",
}) => {
  const Icon = type === "success" ? SvgSuccess : SvgFailure;

  return (
    <Modal animationInTiming={0} animationIn="slideInLeft" isVisible={isOpen}>
      <Card overrideStyle={styles.overAll}>
        <Flex center>
          <Icon height={60} width={60} />
        </Flex>
        <Text align={"center"} bold overrideStyle={styles.messageText}>
          {message}
        </Text>
        <Flex middle center overrideStyle={styles.btnContainer}>
          <Button onClick={onClose}>{buttonText}</Button>
        </Flex>
      </Card>
    </Modal>
  );
};

export default CommonModal;
