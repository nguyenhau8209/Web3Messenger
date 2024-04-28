import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useXmtp} from '@xmtp/react-native-sdk';
import {reactions} from '../../data/reactions';

export const MessageItem = ({message, senderAddress, reactPress, messages}) => {
  const {client} = useXmtp();

  // Hàm tìm emoji tương ứng với nội dung tin nhắn
  const findReactionEmoji = content => {
    const reaction = reactions.find(reaction => reaction.value === content);
    return reaction ? reaction.value : '';
  };

  console.log(message);
  const renderMessage = () => {
    if (
      message.id == message.nativeContent.reaction?.reference &&
      message.contentTypeId === 'xmtp.org/reaction:1.0'
    ) {
      return (
        <>
          <Text>{message?.nativeContent.text}</Text>
        </>
      );
    } else {
      return <Text>{message?.nativeContent.text}</Text>;
    }
  };

  const renderReaction = () => {
    if (message.nativeContent && message.nativeContent.reaction) {
      const content = message.nativeContent.reaction.content;
      const emoji = findReactionEmoji(content);
      const reactedMessageId = message.nativeContent.reaction.reference;
      const reactedMessage =
        messages.find(msg => msg.id === reactedMessageId)?.nativeContent.text ||
        '';
      if (emoji) {
        return (
          <View style={{}}>
            <Text style={{}}>
              You {senderAddress === client?.address ? '' : 'friend'} reacted{' '}
              {emoji} with "{reactedMessage}"
            </Text>
          </View>
        );
      }
    }
    return null;
  };

  const isSender = senderAddress === client?.address;
  return (
    <View
      style={isSender ? styles.senderMessage : styles.receiverMessage}
      key={message.id}>
      <TouchableOpacity
        onLongPress={reactPress}
        style={
          isSender
            ? styles.messageContentSeerder
            : styles.messageContentReceived
        }>
        {renderMessage()}
        {renderReaction()}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  senderMessage: {
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
  receiverMessage: {
    alignSelf: 'flex-start',
    textAlign: 'left',
  },
  messageContentSeerder: {
    backgroundColor: 'lightblue',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    maxWidth: '80%',
  },
  messageContentReceived: {
    backgroundColor: '#C0C0C0',
    color: 'black',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    maxWidth: '80%',
  },
  timeStamp: {
    fontSize: 8,
    color: 'grey',
  },
});
