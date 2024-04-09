import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ImageBackground, Dimensions, TouchableOpacity, TextInput, Button, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../assets/colors/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import * as Location from 'expo-location'; 

Entypo.loadFont();

const height = Dimensions.get('window').height;

const Details = ({ route, navigation }) => {
    const { item } = route.params || {};
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [editIndex, setEditIndex] = useState(null); 

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            const storedComments = await AsyncStorage.getItem('comments_' + item.id);
            if (storedComments !== null) {
                setComments(JSON.parse(storedComments));
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    const saveComments = async () => {
        try {
            await AsyncStorage.setItem('comments_' + item.id, JSON.stringify(comments));
        } catch (error) {
            console.error('Error saving comments:', error);
        }
    };

    const handleAddComment = async () => {
        if (comment.trim() !== '') {
            // 获取用户当前位置
            let location = null;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    location = await Location.getCurrentPositionAsync({});
                }
            } catch (error) {
                console.error('Error getting location:', error);
            }
    
            if (editIndex !== null) { // 修改原评论
                const updatedComments = [...comments];
                updatedComments[editIndex] = { text: comment, time: new Date().toLocaleString(), location: location };
                setComments(updatedComments);
                setEditIndex(null);
            } else { // 添加新评论
                const newComment = {
                    text: comment,
                    time: new Date().toLocaleString(),
                    location: location
                };
                setComments([...comments, newComment]);
            }
            setComment('');
            saveComments();
        } else {
            Alert.alert('Add Comment', 'Comment cannot be empty!');
        }
    };
    

    const handleDeleteComment = async (index) => {
        Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: () => {
                        const updatedComments = [...comments];
                        updatedComments.splice(index, 1);
                        setComments(updatedComments);
                        saveComments();
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleEditComment = (index) => { // 新增编辑评论函数
        setComment(comments[index].text);
        setEditIndex(index);
    };


    
    return (
        <View style={styles.container}>
            <ImageBackground source={item.imageBig} style={styles.backgroundImage}>
                <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
                    <Entypo name="chevron-left" size={32} color={colors.white} />
                </TouchableOpacity>

                <View style={styles.titleWrapper}>
                    <Text style={[styles.itemTitle, { color: colors.white }]}>{item.title}</Text>
                    <View style={styles.locationWrapper}>
                        <Entypo name="location-pin" size={24} color={colors.white} />
                        <Text style={[styles.locationText, { color: colors.white }]}>{item.cont}</Text>
                    </View>
                </View>

            </ImageBackground>

            <View style={styles.descriptionWrapper}>
                <View style={styles.heartWrapper}>
                    <Entypo name="heart" size={32} color={colors.orange} />
                </View>
                <View style={styles.descriptionTextWrapper}>
                    <Text style={styles.descriptionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{item.description}</Text>
                    <Text style={styles.commentTitle}>Comments</Text>

                    <FlatList
                    data={comments}
                    renderItem={({ item, index }) => (
                        <View style={styles.commentContainer}>
                            <Text style={styles.commentText}>{item.text}</Text>
                            <Text style={styles.commentTime}>{item.time}</Text>
                            {item.location && (
                            <Text style={styles.commentLocation}>
                                <Entypo name="location-pin" size={18} color={colors.gray} />
                                {item.location.coords.latitude}, {item.location.coords.longitude}
                            </Text>
                            )}
                            <View style={styles.commentActions}>
                            {editIndex !==index &&(
                            <TouchableOpacity onPress={() => handleEditComment(index)} style={styles.button}>
                                <Entypo name="edit" size={32} color={colors.gray} />
                            </TouchableOpacity>
                            )}

                            {editIndex ===index &&(
                            <TouchableOpacity onPress={() => handleEditComment(index)} style={styles.button}>
                                <Entypo name="edit" size={32} color={colors.orange} />
                            </TouchableOpacity>
                            )}



                                <TouchableOpacity onPress={() => handleDeleteComment(index)} style={styles.deleteButton}>
                                    <Entypo name="trash" size={32} color={colors.gray} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
                </View>

            </View>
            <View style={styles.commentInputContainer}>
                    <TextInput
                        value={comment}
                        onChangeText={(text) => setComment(text)}
                        placeholder="Add your comment..."
                        style={styles.commentInput}
                    />
                <TouchableOpacity style={styles.buttonWrapper} onPress={handleAddComment}>
                <Entypo name={editIndex !== null ? "edit" : "arrow-bold-up"} size={40} color={colors.orange} />
                </TouchableOpacity>
                </View>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white
    },
    backgroundImage: {
        height: height * 0.4,
        justifyContent: 'space-between'
    },
    descriptionWrapper: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 20,
        marginTop: -20
    },
    backIcon: {
        marginLeft: 20,
        marginTop: 50
    },
    titleWrapper: {
        marginHorizontal: 20,
        marginBottom: 40
    },
    itemTitle: {
        fontFamily: 'Lato_700Bold',
        fontSize: 32
    },
    locationWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    },
    locationText: {
        fontFamily: 'Lato_700Bold',
        fontSize: 16
    },
    heartWrapper: {
        position: 'absolute',
        right: 40,
        top: -30,
        width: 64,
        height: 64,
        backgroundColor: colors.white,
        borderRadius: 64,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    descriptionTextWrapper: {
        marginTop: 30,
        marginHorizontal: 20
    },
    descriptionTitle: {
        fontFamily: 'Lato_700Bold',
        fontSize: 24,
        color: colors.black
    },
    descriptionText: {
        marginTop: 20,
        fontSize: 16,
        fontFamily: 'Lato_900Black_Italic',
        color: colors.darkGray,
        height: 85
    },
    commentSection: {
        flex: 1,
        padding: 0
    },
    commentTitle: {
        fontFamily: 'Lato_700Bold',
        fontSize: 24,
        color: colors.black
    },
    commentContainer: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: colors.lightGray,
        borderRadius: 10
    },
    commentText: {
        fontSize: 16,
        marginBottom: 5
    },
    commentTime: {
        fontSize: 12,
        color: colors.gray
    },
    commentActions: {
        flexDirection: 'row',
        marginTop: 5
    },
    editButton: {
        marginRight: 10
    },
    deleteButton: {
        marginRight: 10
    },
    commentInputContainer: {
        flexDirection: 'row',
        marginLeft: 20,
        marginBottom:30
    },
    commentInput: {
        flex: 1,
        marginRight: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 10
    },
    buttonWrapper: {
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default Details;
