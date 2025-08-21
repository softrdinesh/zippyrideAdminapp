import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Modalize } from "react-native-modalize";
import Svg, { Path, Circle, G } from "react-native-svg";
import ImagePicker from "react-native-image-crop-picker";
import Toast from "react-native-toast-message";

const { height } = Dimensions.get("window");

const ImageUploadModal = ({
  modalRef,
  onImageSelected,
  isLoading = false,
  modalHeight = height * 0.25,
  imageOptions = {
    width: 300,
    height: 400,
    cropping: true,
    multiple: false,
    mediaType: "photo",
  },
}) => {
  const handleImageSelection = async (source) => {
    try {
      const image =
        source === "camera"
          ? await ImagePicker.openCamera(imageOptions)
          : await ImagePicker.openPicker(imageOptions);

      if (image) {
        onImageSelected(image);
        modalRef.current?.close();
      }
    } catch (error) {
      console.log("Image selection error:", error);
      if (error.code !== "E_PICKER_CANCELLED") {
        Toast.show({
          type: "error",
          text1: "Error selecting image",
          text2: error.message || "Please try again",
        });
      }
    }
  };

  return (
    <Modalize
      ref={modalRef}
      modalHeight={modalHeight}
      adjustToContentHeight={false}
      withHandle={true}
      handlePosition="inside"
      handleStyle={styles.modalHandle}
      modalStyle={styles.modalStyle}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalOptions}>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleImageSelection("camera")}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.modalIcon}>
              <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
                <Circle cx="24" cy="24" r="24" fill="#F6A000" />
                <Path
                  d="M16 20C16 18.8954 16.8954 18 18 18H19L20.4472 16.1056C20.7865 15.6322 21.3704 15.3333 22 15.3333H26C26.6296 15.3333 27.2135 15.6322 27.5528 16.1056L29 18H30C31.1046 18 32 18.8954 32 20V28C32 29.1046 31.1046 30 30 30H18C16.8954 30 16 29.1046 16 28V20Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M24 27C25.6569 27 27 25.6569 27 24C27 22.3431 25.6569 21 24 21C22.3431 21 21 22.3431 21 24C21 25.6569 22.3431 27 24 27Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text style={styles.modalOptionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => handleImageSelection("gallery")}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.modalIcon}>
              <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
                <Circle cx="24" cy="24" r="24" fill="#F6A000" />
                <G transform="translate(13, 14.5)">
                  <Path
                    d="M0 2.71429C0 1.99441 0.289731 1.30402 0.805456 0.794996C1.32118 0.285969 2.02065 0 2.75 0H19.25C19.9793 0 20.6788 0.285969 21.1945 0.794996C21.7103 1.30402 22 1.99441 22 2.71429V16.2857C22 17.0056 21.7103 17.696 21.1945 18.205C20.6788 18.714 19.9793 19 19.25 19H2.75C2.02065 19 1.32118 18.714 0.805456 18.205C0.289731 17.696 0 17.0056 0 16.2857V2.71429Z"
                    fill="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </G>
              </Svg>
            </View>
            <Text style={styles.modalOptionText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modalize>
  );
};

const styles = StyleSheet.create({
  modalStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E9ECEF",
    borderRadius: 2,
    marginTop: 12,
    alignSelf: "center",
  },
  modalContent: {
    padding: 24,
    paddingBottom: 32,
  },
  modalOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  modalOption: {
    alignItems: "center",
    width: "40%",
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F6A000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalOptionText: {
    fontSize: 14,
    color: "#212529",
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "System",
  },
});

export default ImageUploadModal;
