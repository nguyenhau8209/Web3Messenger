import React, {useState, useRef, useEffect} from 'react';
import {MessageInput} from './MessageInput';
import {MessageItem} from './MessageItem';
import {useXmtp} from '@xmtp/react-native-sdk';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {reactions} from '../../data/reactions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  messagesContainer: {
    flex: 1,
  },
});

export const MessageContainer = ({
  conversation,
  searchTerm,
  selectConversation,
}) => {
  const isFirstLoad = useRef(true);
  const {client} = useXmtp();
  const bottomOfList = useRef(null);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisiableReaction, setIsVisiableReaction] = useState(false);
  const [selectedMessId, setSelectedMessId] = useState(null);

  const updateMessages = (prevMessages, newMessage) => {
    const doesMessageExist = prevMessages.some(
      existingMessage => existingMessage.id === newMessage.id,
    );

    if (!doesMessageExist) {
      return [...prevMessages, newMessage];
    }

    return prevMessages;
  };

  useEffect(() => {
    let isMounted = true;
    let timer;
    const fetchMessages = async () => {
      if (conversation && conversation.peerAddress && isFirstLoad.current) {
        setIsLoading(true);
        const initialMessages = await conversation?.messages();
        const orderedMessages = initialMessages.reverse();
        let updatedMessages = [];
        orderedMessages.forEach(message => {
          updatedMessages = updateMessages(updatedMessages, message);
        });

        setMessages(updatedMessages);
        setIsLoading(false);
        isFirstLoad.current = false;
      }
      // Delay scrolling to the bottom to allow the layout to update
      timer = setTimeout(() => {
        if (isMounted && bottomOfList.current) {
          bottomOfList.current.scrollToEnd({animated: false});
        }
      }, 0);
    };

    fetchMessages();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [conversation]);

  useEffect(() => {
    // Define the callback function to be called for each new message
    const handleMessage = async message => {
      console.log('Stream', message.content());
      setMessages(prevMessages => updateMessages(prevMessages, message));
    };

    const unsubscribe = conversation.streamMessages(handleMessage);
    return () => {
      console.log('Unsubscribing from message stream');
      unsubscribe();
      // call unsubscribe(); if you want to cancel the stream when the component is unmounted
    };
  }, []);

  useEffect(() => {
    if (bottomOfList.current) {
      bottomOfList.current.scrollToEnd({animated: true});
    }
    console.log(messages);
  }, [messages]);

  const handleSendMessage = async newMessage => {
    if (!newMessage.trim()) {
      Alert.alert('Empty message');
      return;
    }
    if (conversation && conversation.peerAddress) {
      await conversation.send(newMessage);
    } else if (conversation) {
      const conv = await client.conversations.newConversation(searchTerm);
      selectConversation(conv);
      await conv.send(newMessage);
    }
  };

  const showReactModal = async mess => {
    setIsVisiableReaction(true);
    setSelectedMessId(mess.id);
  };

  return (
    <>
      {isLoading ? (
        <Text>Loading messages...</Text>
      ) : (
        <View style={styles.container}>
          <ScrollView style={styles.messagesContainer} ref={bottomOfList}>
            {messages.slice().map(message => {
              console.log('vaooo');
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  senderAddress={message.senderAddress}
                  client={client}
                  reactPress={() => showReactModal(message)}
                  messages={messages}
                />
              );
            })}
          </ScrollView>
          <MessageInput
            onSendMessage={msg => {
              handleSendMessage(msg);
            }}
          />
        </View>
      )}
      <Modal visible={isVisiableReaction} transparent animationType="slide">
        <TouchableWithoutFeedback
          onPress={() => {
            setIsVisiableReaction(false);
          }}>
          <View style={{flex: 1, justifyContent: 'flex-end'}}>
            <View
              style={{
                width: '100%',
                backgroundColor: 'white',
              }}>
              <FlatList
                style={{alignSelf: 'center'}}
                data={reactions}
                horizontal
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      style={{margin: 10}}
                      onPress={async () => {
                        const reactionContent = {
                          reaction: {
                            reference: selectedMessId,
                            action: 'added',
                            schema: 'unicode',
                            content: item.value,
                          },
                        };
                        await conversation.send(reactionContent);
                      }}>
                      <Text style={{fontSize: 24}}>{item.value}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};
