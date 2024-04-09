import React, { useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Import Image component
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export default function CameraComponent() {
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [mediaPermission, requestMediaPermission ] = MediaLibrary.usePermissions({
    writeOnly: true
  })
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  let camera; // Add camera reference

  if (!permission) {
    // Camera permission
    return <View />;
  }

  if (!permission.granted) {
    // Camera permission not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to display the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  async function takePicture() {
    if (!camera) return;

    const photo = await camera.takePictureAsync();
    setCapturedPhoto(photo);
  }


  const doSavePhoto = async () => {
    const asset = await MediaLibrary.createAssetAsync(capturedPhoto.uri);
    MediaLibrary.createAlbumAsync('Expo Camera', asset)
        .then(() => {
          alert('Photo saved to gallery!');
        })
        .catch(error => {
          console.error('Error saving photo to gallery:', error);
        });
  }

  async function savePhotoToGallery() {
    if (!capturedPhoto) return;
    if (!mediaPermission.granted){
      requestMediaPermission().then(()=>{
        console.log('granted, save again')
        return doSavePhoto()
      }).catch(e=>{
        alert('Authorization is required to save the photo to the gallery')
      })
      return
    }
    await doSavePhoto()
  }

  function toggleCameraType() {
    setType(current => (current === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back));
  }

  return (
    <View style={styles.container}>
      <Camera 
        style={styles.camera} 
        type={type}
        ref={ref => { camera = ref; }}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Toggle Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </Camera>
      {capturedPhoto && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto.uri }} style={styles.previewImage} />
          <Button title="Save to Gallery" onPress={savePhotoToGallery} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});
