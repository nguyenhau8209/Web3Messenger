import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {XmtpProvider} from '@xmtp/react-native-sdk';
import {FloatingInboxXMTP} from './index.js';

const FloatingInbox = ({isPWA = false, wallet, onLogout}) => {
  console.log('isPWA ', isPWA);
  console.log('wallet ', wallet);
  console.log('onLogout ', onLogout);
  return (
    <View style={{flex: 1}}>
      <XmtpProvider>
        <FloatingInboxXMTP isPWA={isPWA} wallet={wallet} onLogout={onLogout} />
      </XmtpProvider>
    </View>
  );
};

export default FloatingInbox;

const styles = StyleSheet.create({});
