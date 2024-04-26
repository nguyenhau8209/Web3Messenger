import {Button, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useWeb3Modal} from '@web3modal/wagmi-react-native';
import {useAccount, useWalletClient} from 'wagmi';
import {disconnect} from 'wagmi/actions';
import FloatingInbox from './src/components/FloatingInbox-text/Home.js';

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
        <View>
          <Button
            onPress={() => {
              open();
            }}
            title="Open Connect Modal"
          />
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
