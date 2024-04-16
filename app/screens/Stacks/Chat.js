import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Bubble, GiftedChat, Send } from 'react-native-gifted-chat';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { collection, addDoc, orderBy, query, onSnapshot, doc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { firestoreDB, auth } from "../../../Firebase/firebase";
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

export default function Chat({ route }) {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const { chatId } = route.params;

  useEffect(() => {
    if (!chatId) {
      console.error('Chat ID is undefined');
      return;
    }

    const chatMessagesRef = collection(firestoreDB, 'chats', chatId, 'messages');
    const messagesQuery = query(chatMessagesRef, orderBy('createdAt', 'desc')); // Order messages by createdAt field in ascending order

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const loadedMessages = querySnapshot.docs.map((doc) => {
        const messageData = doc.data();
        const createdAt = messageData.createdAt ? messageData.createdAt.toDate() : new Date(); // Convert Firestore Timestamp to JavaScript Date object
        return {
          _id: doc.id,
          text: messageData.text,
          user: messageData.user,
          createdAt,
        };
      });
      setMessages(loadedMessages);
    });

    return unsubscribe;
  }, [chatId]);

  const onSend = useCallback((messages = []) => {
    const message = messages[0];
    setMessages(previousMessages => GiftedChat.append(previousMessages, message));

    const { _id, text, user } = message;
    // Set the createdAt field to the current server timestamp
    const createdAt = serverTimestamp(); // Get the current server timestamp
    addDoc(collection(firestoreDB, 'chats', chatId, 'messages'), {
      _id,
      text,
      user,
      createdAt, // Set the createdAt field to the current server timestamp
    }).catch((error) => console.error('Error sending message:', error));
  }, [chatId]);

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View>
          <MaterialCommunityIcons
            name="send-circle"
            style={{ marginBottom: 5, marginRight: 5 }}
            size={32}
            color="#3f9eeb"
          />
        </View>
      </Send>
    );
  };

  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={25} color="#333" />;
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#3f9eeb',
          },
          left: {
            backgroundColor: '#e6f2ff',
          },
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
          left: {
            color: '#3f9eeb',
          },
        }}
      />
    );
  };

  const renderAvatar = (props) => {
    const user = props.currentMessage.user;
    const currentUser = route.params.currentUser;
    const seller = route.params.seller;
  
    // Determine if the message belongs to the current user or the seller
    const isCurrentUser = user._id === currentUser.email;
    const profilePic = isCurrentUser ? currentUser.profilePic : seller.profilePic;
  
    // Use the profile picture URI for the left bubble
    return (
      <Image
        source={{ uri: profilePic }}
        style={{ width: 40, height: 40, borderRadius: 20 }}
      />
    );
  };


  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, paddingBottom: 20, backgroundColor: '#ffffff' }}
    >
      <GiftedChat
        messages={messages}
        alwaysShowSend
        onSend={onSend}
        renderSend={renderSend}
        renderAvatar={renderAvatar}
        user={{
          _id: auth.currentUser?.uid,
        }}
        scrollToBottom
        scrollToBottomComponent={scrollToBottomComponent}
        renderBubble={renderBubble}
      />
    </KeyboardAvoidingView>
    
  );
}

