import {Button, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useWeb3Modal} from '@web3modal/wagmi-react-native';
import {useAccount, useWalletClient} from 'wagmi';
import FloatingInbox from './src/components/FloatingInbox-text/Home.js';
import {disconnect} from 'wagmi/actions';
import ConnectView from './src/components/WalletConnect/ConnectView.js';

const Page = () => {
  const {open} = useWeb3Modal();
  const {data: walletClient} = useWalletClient();
  const {address, isDisconnected} = useAccount();
  const [loggingOut, setIsLoggingOut] = useState(false);
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
          <ConnectView />
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
