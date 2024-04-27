import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useXmtp} from '@xmtp/react-native-sdk';

export const MessageItem = ({message, senderAddress}) => {
  const {client} = useXmtp();
  const renderMessage = () => {
    console.log(message);
    try {
      if (message?.contentType.sameAs(ContentTypeReaction)) {
        var reaction = message.content;
        return <Text>{reaction.content}</Text>;
      } else if (message?.content().length > 0) {
        return <Text>{message?.content()}</Text>;
      }
    } catch {
      return message?.fallback ? (
        message?.fallback
      ) : (
        <Text>{message?.content()}</Text>
      );
    }
  };

  const isSender = senderAddress === client?.address;
  return (
    <View
      style={isSender ? styles.senderMessage : styles.receiverMessage}
      key={message.id}>
      <View style={styles.messageContent}>
        {renderMessage()}
        <View style={styles.footer}>
          <Text style={styles.timeStamp}>
            {`${new Date(message.sent).getHours()}:${String(
              new Date(message.sent).getMinutes(),
            ).padStart(2, '0')}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  senderMessage: {
    alignSelf: 'flex-end',
    textAlign: 'left',
  },
  receiverMessage: {
    alignSelf: 'flex-start',
    textAlign: 'right',
  },
  messageContent: {
    backgroundColor: 'lightblue',
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
