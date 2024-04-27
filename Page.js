import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {useWeb3Modal} from '@web3modal/wagmi-react-native';
import {useAccount, useWalletClient} from 'wagmi';
import {disconnect} from 'wagmi/actions';
import FloatingInbox from './src/components/FloatingInbox-text/Home.js';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const Page = () => {
  const {open} = useWeb3Modal();
  const {data: walletClient} = useWalletClient();
  const {address, isDisconnected} = useAccount();
  const {loggingOut, setIsLoggingOut} = useState(false);
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await disconnect();
    console.log('Logging out...');
    setIsLoggingOut(false);
  };

  const isPWA = true;
  console.log('walletClient ', walletClient);
  return (
    <View style={{flex: 1}}>
      {isDisconnected && (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            style={{backgroundColor: '#1ea0fc', padding: 10, borderRadius: 10}}
            onPress={() => {
              open();
            }}>
            <Text style={{color: 'white'}}>Open Connect Modal</Text>
          </TouchableOpacity>
        </View>
      )}
      {!isDisconnected && walletClient && (
        <FloatingInbox
          isPWA={isPWA}
          wallet={walletClient}
          onLogout={handleLogout}
        />
      )}
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({});
