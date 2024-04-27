import React, {useState, useRef, useEffect} from 'react';
import {MessageInput} from './MessageInput';
import {MessageItem} from './MessageItem';
import {useXmtp} from '@xmtp/react-native-sdk';
import {View, Text, ScrollView, Alert, StyleSheet, Button} from 'react-native';

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
  const [showPopup, setShowPopup] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
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
    let stream;
    let isMounted = true;
    let timer;
    const fetchMessages = async () => {
      if (conversation && conversation.peerAddress && isFirstLoad.current) {
        setIsLoading(true);
        const initialMessages = await conversation?.messages();

        //Consent state
        const consentState = await conversation.consentState();
        setShowPopup(consentState === 'unknown');
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
      if (stream) stream.return();
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

  //Function to handle the aceptance of a contact
  const handleAcept = async () => {
    //Allow the contact
    await client.contacts.allow([conversation.peerAddress]);
    //Hide the popup
    setShowPopup(false);
    //Refesh the consent list
    await client.contacts.refreshConsentList();
    //Log the aceptance
    console.log('acepted ', conversation.peerAddress);
  };

  //Function to handle block of a contact
  const handleBlock = async () => {
    //Block the contact
    await client.contacts.deny([conversation.peerAddress]);
    //Hide the popup
    setShowPopup(false);
    //Refesh the consent list
    await client.contacts.refreshConsentList();
    //Set blocked
    setIsBlocked(true);
    //Log the blocking
    console.log('Denied ', conversation.peerAddress);
  };
  const functionReturnBlock = async () => {
    const state = await conversation.consentState();

    if (state === 'denied') {
      return (
        <View style={{alignItems: 'center', marginBottom: 10}}>
          <Text>This account is denied!</Text>
        </View>
      );
    }
    return (
      <MessageInput
        onSendMessage={msg => {
          handleSendMessage(msg);
        }}
      />
    );
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
                />
              );
            })}
          </ScrollView>
          {showPopup ? (
            <View style={styles.popup}>
              <Text style={styles.popupTitle}>Do you trust this contact?</Text>
              <View style={styles.popupInner}>
                <Button
                  title="Accept"
                  style={{...styles.popupButton, ...styles.acceptButton}}
                  onPress={handleAcept}
                />
                <Button
                  title="Block"
                  style={{...styles.popupButton, ...styles.blockButton}}
                  onPress={handleBlock}
                  color="red"
                />
              </View>
            </View>
          ) : (
            functionReturnBlock()
          )}
        </View>
      )}
    </>
  );
};
