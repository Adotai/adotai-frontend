import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Theme } from '../../constants/Themes'

const SignInScreen = () => {
  return (
    <View>  
                      <Text style={styles.subTitle}>Entre para fazer a diferença na vida de um animal!</Text>

                    <Text style={[styles.titleBold, {color: Theme.PRIMARY, fontSize: 16, marginBottom: 10}]}>Esqueceu a senha?</Text>
    </View>
  )
}

export default SignInScreen

const styles = StyleSheet.create({
  titleBold: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  subTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20
  },

})