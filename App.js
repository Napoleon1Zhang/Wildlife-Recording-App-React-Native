import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import colors from './assets/colors/colors'
import Entypo from 'react-native-vector-icons/Entypo'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import Home from './components/Home';
import Liked from './components/List';
import Camera from './components/Camera';
import Googlemap from './components/Map';
import Details from './components/Details';

import { useFonts } from 'expo-font';


import {
  Lato_100Thin,
  Lato_100Thin_Italic,
  Lato_300Light,
  Lato_300Light_Italic,
  Lato_400Regular,
  Lato_400Regular_Italic,
  Lato_700Bold,
  Lato_700Bold_Italic,
  Lato_900Black,
  Lato_900Black_Italic
} from '@expo-google-fonts/lato'
import AppLoading from 'expo-app-loading'


Entypo.loadFont()
MaterialCommunityIcons.loadFont()


const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()


const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        style: styles.tabBar,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.gray,
        showLabel: false,
      }}

      
    >
      <Tab.Screen name="Home" component={Home}
        options={{
          tabBarIcon: ({ color }) => <Entypo name="home" size={32} color={color} />,
        }}
      />
      <Tab.Screen name="List" component={Liked}
        options={{
          tabBarIcon: ({ color }) => <Entypo name="list" size={32} color={color} />,
        }}
      />

      <Tab.Screen name="Map" component={Googlemap}
        options={{
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map" size={32} color={color} />,
        }}
      />

      <Tab.Screen name="Camera" component={Camera}
        options={{
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="camera" size={32} color={color} />,
        }}
      />


    </Tab.Navigator>
  )
}


export default function App() {
  let [fontsLoaded, error] = useFonts({
    Lato_100Thin,
    Lato_100Thin_Italic,
    Lato_300Light,
    Lato_300Light_Italic,
    Lato_400Regular,
    Lato_400Regular_Italic,
    Lato_700Bold,
    Lato_700Bold_Italic,
    Lato_900Black,
    Lato_900Black_Italic
  })

  if (!fontsLoaded) {
    return <AppLoading />
  }
  // initialRouteName='Googlemap'
  return (
    <NavigationContainer>
      <Stack.Navigator >        
        <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Details" component={Details} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
})

