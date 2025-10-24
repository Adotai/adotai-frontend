import { View, Text, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import { Theme } from '../../../constants/Themes'

export default function ONGNotificationsScreen() {
  return (
    <>
      <StatusBar backgroundColor={Theme.TERTIARY} barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: Theme.BACK }}>
        <View style={{
          width: '100%', 
          padding: 16, 
          marginTop: 0, 
          alignSelf: 'center', 
          alignItems: 'center',
          justifyContent: 'space-between', 
          flexDirection: 'row', 
          backgroundColor: Theme.TERTIARY, 
          position: 'relative',
        }}>
          <Text style={{ 
            fontSize: 24, 
            fontFamily: 'Poppins-Bold', 
            color: Theme.BACK 
          }}>
            Notificações
          </Text>
        </View>
      </SafeAreaView>
    </>
  )
}