import React,{useMemo} from 'react';
import {Text,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {NavigationContainer,DefaultTheme,DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {AppProvider} from './src/store';
import {configured} from './src/lib/supabase';
import {ThemeProvider,useTheme,useC} from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import ListScreen from './src/screens/ListScreen';
import SavedScreen from './src/screens/SavedScreen';
import AccountScreen from './src/screens/AccountScreen';
import MenuScreen from './src/screens/MenuScreen';
import DetailScreen from './src/screens/DetailScreen';
import BuySellScreen from './src/screens/BuySellScreen';
import ContactScreen from './src/screens/ContactScreen';
import AdminScreen from './src/screens/AdminScreen';
const Tab=createBottomTabNavigator(),Stack=createNativeStackNavigator();
const icons={Home:['home-variant','home-variant-outline','Home'],List:['magnify','magnify','Search'],Saved:['heart','heart-outline','Saved'],Account:['account','account-outline','Account'],Menu:['view-grid','view-grid-outline','More']};
function Tabs(){const C=useC();return(<Tab.Navigator screenOptions={({route})=>({headerShown:false,tabBarLabel:icons[route.name][2],tabBarLabelStyle:{fontSize:11,fontWeight:'700'},
 tabBarActiveTintColor:C.red2,tabBarInactiveTintColor:C.mute,tabBarStyle:{backgroundColor:C.tabBg,borderTopColor:C.dark?'rgba(212,20,30,.45)':C.line},
 tabBarIcon:({color,focused})=><Icon name={icons[route.name][focused?0:1]} size={26} color={color}/>})}>
 <Tab.Screen name="Home" component={HomeScreen}/><Tab.Screen name="List" component={ListScreen}/><Tab.Screen name="Saved" component={SavedScreen}/>
 <Tab.Screen name="Account" component={AccountScreen}/><Tab.Screen name="Menu" component={MenuScreen}/></Tab.Navigator>)}
function Root(){
 const {C,dark}=useTheme();
 const theme=useMemo(()=>({...(dark?DarkTheme:DefaultTheme),colors:{...(dark?DarkTheme:DefaultTheme).colors,background:C.bg,card:C.card,border:C.line,primary:C.red2,text:C.tx}}),[C,dark]);
 if(!configured)return <View style={{flex:1,backgroundColor:C.bg,justifyContent:'center',padding:24}}><Text style={{color:C.tx,fontSize:20,fontWeight:'700'}}>Setup needed</Text><Text style={{color:C.mute,marginTop:8}}>Copy .env.example to .env, add your Supabase URL and anon key, then restart with: npx expo start -c</Text></View>;
 return(<SafeAreaProvider><AppProvider><NavigationContainer theme={theme}><StatusBar style={dark?'light':'dark'}/>
  <Stack.Navigator screenOptions={{headerStyle:{backgroundColor:C.bg},headerTintColor:C.tx,headerTitleStyle:{fontWeight:'700'},headerShadowVisible:false,contentStyle:{backgroundColor:C.bg}}}>
   <Stack.Screen name="Tabs" component={Tabs} options={{headerShown:false}}/>
   <Stack.Screen name="Detail" component={DetailScreen} options={{title:'Details'}}/>
   <Stack.Screen name="BuySell" component={BuySellScreen} options={{title:'Buy, sell or rent'}}/>
   <Stack.Screen name="Contact" component={ContactScreen} options={{title:'Contact SAIR'}}/>
   <Stack.Screen name="Admin" component={AdminScreen} options={{title:'Admin panel'}}/></Stack.Navigator></NavigationContainer></AppProvider></SafeAreaProvider>)}
export default function App(){return <ThemeProvider><Root/></ThemeProvider>}
