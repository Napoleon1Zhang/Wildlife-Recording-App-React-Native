import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Button, FlatList, StyleSheet, Alert, Linking, TouchableOpacity, Image, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import colors from '../assets/colors/colors';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { observer } from 'mobx-react';

import * as MediaLibrary from 'expo-media-library';

const List = () => {
  const [comment, setComment] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [location, setLocation] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [permission, requestPermission] = ImagePicker.useMediaLibraryPermissions({ writeOnly: false });
  const [comments, setComments] = useState([]);
  const [header, setHeader] = useState(null); 

  useEffect(() => {
    loadComments();
    getLocation();
  }, []);

  const loadComments = async () => {
    try {
      const storedComments = await AsyncStorage.getItem('profile_comments');
      if (storedComments !== null) {
        setComments(JSON.parse(storedComments));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const saveComments = async (newComments) => {
    try {
      await AsyncStorage.setItem('profile_comments', JSON.stringify(newComments));
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  };

  const getCurrentDateTime = () => {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    return `${formattedDate} ${formattedTime}`;
  };

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // Handle permission denied scenario
      Alert.alert('Location permission not granted', 'Please grant permission to access your location.');
      return;
    }

    // Get the user's current location
    let location = await Location.getCurrentPositionAsync({});
    // Store the location information in the state for later use
    setLocation(location);
  };

  const handleAddComment = () => {
    if (comment.trim() !== '') {
      if (editingIndex !== null) {
        const newComments = [...comments];
        newComments[editingIndex] = {
          text: comment,
          time: getCurrentDateTime(),
          location: location,
          image: null, // Add image field
        };
        console.log('Updated comments:', newComments); // Log updated comments
        
        setEditingIndex(null);
        setComments(newComments); 
      } else {
        const newComment = { text: comment, time: getCurrentDateTime(), location: location, image: null };
        console.log('New comment:', newComment); // Log new comment
        setComments(prevComments => [...prevComments, newComment]);
      }
      setComment('');
    }
  };
  

  const handleEditComment = (index) => {
    console.log('Editing comment at index:', index);
    setEditingIndex(index);
    setComment(comments[index].text);
  };
  

  const handleDeleteComment = async (index) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            const commentToDelete = comments[index];
            if (commentToDelete.image) {
              try {
                await MediaLibrary.deleteAssetsAsync([commentToDelete.image]);
              } catch (error) {
                console.error('Error deleting image:', error);
              }
            }

            const newComments = comments.filter((_, i) => i !== index);
            setComments(newComments);
            setEditingIndex(null);
          },
        },
      ],
      { cancelable: false }
    );
  };


  const choosePhoto = async (item, index) => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Requires authorized access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      base64: true,
    });

    if (!result.cancelled) {
      const asset = result.assets[0];
      const newComments = [...comments];
      newComments[index].image = `data:image/png;base64,${asset.base64}`;
      setComments(newComments);
      saveComments(newComments);
      console.log('Selected photo:', asset);
    }
  };
  

  const handleFilterComments = (keyword) => {
    const filteredComments = comments.filter(comment => comment.text.toLowerCase().includes(keyword.toLowerCase()));
    setComments(filteredComments);
    setFilterText(keyword);
  };

  const handleResetFilter = () => {
    loadComments();
    setFilterText('');
  };

  const handleEditConfirmation = () => {
    if (comment.trim() !== '') {
      handleAddComment();
    } else {
      Alert.alert('Edit Comment', 'Comment cannot be empty!');
    }
  };

  const sendSMS = (commentText, commentTime, commentIndex) => {
    const comment = comments[commentIndex];
    if (comment && comment.location) {
      const { coords } = comment.location;
      const message = `Comment: ${commentText}\nTime: ${commentTime}\nLocation: ${coords.latitude}, ${coords.longitude}`;
      Linking.openURL(`sms:?body=${message}`);
    } else {
      Alert.alert('Location not available', 'Location information is not available for this comment.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
      <TextInput
          placeholder="Search comments..."
          onChangeText={(text) => {
            if (text.trim() === '') {
              handleResetFilter();
            } else {
              handleFilterComments(text);
            }
          }}
          style={styles.filterInput}
        />
        <TouchableOpacity onPress={() => handleFilterComments(filterText)} style={styles.buttonsearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={comments}
        renderItem={({ item, index }) => (
          <View style={styles.commentContainer}>
            <Text style={styles.commentText}>{item.text}</Text>
            {/* <Image style={styles.image} source={{ uri: item.image }} /> */}
            {item.image && <Image style={styles.image} source={{ uri: item.image }} />}
            <Text style={styles.commentTime}>{item.time}</Text>
            {item.location && (
              <Text style={styles.commentLocation}>
                <Entypo name="location-pin" size={18} color={colors.gray} />
                {item.location.coords.latitude}, {item.location.coords.longitude}
              </Text>
            )}

            <View style={styles.buttonContainer}>
              {editingIndex !== index && (
                <TouchableOpacity onPress={() => handleEditComment(index)} style={styles.button}>
                  <Entypo name="edit" size={32} color={colors.gray} />
                </TouchableOpacity>
              )}

              {editingIndex === index && (
                <TouchableOpacity onPress={() => handleEditComment(index)} style={styles.button}>
                  <Entypo name="edit" size={32} color={colors.orange} />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => handleDeleteComment(index)} style={styles.button}>
                <Entypo name="trash" size={32} color={colors.gray} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={() => choosePhoto(item, index)}>
                <Entypo name="image" size={32} color={colors.gray} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => sendSMS(item.text, item.time, index)} style={styles.button}>
                <Entypo name="forward" size={32} color={colors.gray} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <View style={styles.addCommentContainer}>
        <TextInput
          value={comment}
          onChangeText={(text) => setComment(text)}
          placeholder="Add your comment..."
          style={styles.input}
        />
        <TouchableOpacity onPress={handleEditConfirmation} style={styles.button}>
          <Entypo name={editingIndex !== null ? 'edit' : 'plus'} size={50} color={colors.orange} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  input: {
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    flex: 1,
  },
  commentContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    
  },
  commentText: {
    fontSize: 20,
    marginBottom: 5,
    marginTop: 5,
    fontFamily: 'Lato_700Bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    
    width: '80%',
    minHeight: '50%',
  },

  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  commentLocation: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  filterInput: {
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  buttonsearch: {
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: 100,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  buttonText: {
    fontFamily: 'Lato_900Black_Italic',
    fontSize: 18,
    color: colors.white,
  },
});

export default List;
