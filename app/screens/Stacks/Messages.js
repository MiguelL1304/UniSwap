import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestoreDB, auth } from "../../../Firebase/firebase";
import {
    Container,
    Card,
    UserInfo,
    UserImgWrapper,
    UserImg,
    UserInfoText,
    UserName,
    PostTime,
    MessageText,
    TextSection,
} from '../styles/MessageStyles';

const Messages = ({ navigation }) => {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const fetchChats = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const userEmail = user.email;

            // Fetch the profile document of the current user
            const profileDocRef = doc(firestoreDB, 'profile', userEmail);
            const profileDocSnapshot = await getDoc(profileDocRef);

            if (!profileDocSnapshot.exists()) {
                console.error('Profile document not found for the current user');
                return;
            }

            const userData = profileDocSnapshot.data();

            if (!userData.chatList) {
                console.error('No chat list found for the current user');
                return;
            }

            const chatList = userData.chatList;

            // Fetch each chat document from the chatList
            const fetchedChats = [];
            for (let i = 0; i < chatList.length; i++) {
                const chatId = chatList[i];
                const chatDocRef = doc(firestoreDB, 'chats', chatId);
                const chatDocSnapshot = await getDoc(chatDocRef);
                if (chatDocSnapshot.exists()) {
                    const chatData = chatDocSnapshot.data();

                    // Fetch the messages subcollection for this chat
                    const messagesQuery = query(collection(chatDocRef, 'messages'), orderBy('createdAt', 'desc'), limit(1));
                    const messagesSnapshot = await getDocs(messagesQuery);
                    let lastMessageTime = null;
                    let lastMessageText = '';
                    messagesSnapshot.forEach((doc) => {
                        const messageData = doc.data();
                        lastMessageTime = messageData.createdAt.toDate();
                        lastMessageText = messageData.text;
                    });

                    let formattedTime = '';
                    if (lastMessageTime) {
                        const diff = Date.now() - lastMessageTime.getTime();
                        const minute = 60 * 1000;
                        const hour = 60 * minute;
                        const day = 24 * hour;
                        if (diff < minute) {
                            formattedTime = 'Just now';
                        } else if (diff < hour) {
                            const minutes = Math.floor(diff / minute);
                            formattedTime = `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
                        } else if (diff < day) {
                            const hours = Math.floor(diff / hour);
                            formattedTime = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
                        } else {
                            const days = Math.floor(diff / day);
                            formattedTime = `${days} ${days === 1 ? 'day' : 'days'} ago`;
                        }
                    }
              

                    fetchedChats.push({ id: chatId, ...chatData, lastMessageTime: formattedTime, lastMessageText });
                }
            }

            setChats(fetchedChats);
        };

        fetchChats();
    }, []);

    return (
        <Container style={styles.container}>
          <FlatList
            data={chats}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              // Determine the current user and seller data
              const currentUserEmail = auth.currentUser.email;
              const isCurrentUserFirst = item.id.startsWith(currentUserEmail);
              const otherUserEmail = item.id.split('_').filter(email => email !== currentUserEmail)[0];
              const sellerEmail = isCurrentUserFirst ? otherUserEmail : currentUserEmail;
              const sellerData = item[sellerEmail];

              // Determine the current user data
              const currentUserData = item[currentUserEmail];

              return (
                <Card onPress={() => {
                  navigation.navigate('Chat', {
                    chatId: item.id,
                    currentUser: {
                      name: currentUserData.name,
                      profilePic: currentUserData.profilePic,
                      email: currentUserData.email,
                    },
                    seller: {
                      name: sellerData.name,
                      profilePic: sellerData.profilePic,
                      email: sellerData.email,
                    }
                  });
                }}>
                  <UserInfo>
                    <UserImgWrapper>
                      <UserImg source={{ uri: sellerData.profilePic }} />
                    </UserImgWrapper>
                    <TextSection>
                      <UserInfoText>
                        <UserName>{sellerData.name}</UserName>
                        <PostTime>{item.lastMessageTime}</PostTime>
                      </UserInfoText>                    
                      <MessageText>{item.lastMessageText}</MessageText>
                    </TextSection>
                  </UserInfo>
                </Card>
              );
            }}
          />
        </Container>
      );
};

export default Messages;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
});