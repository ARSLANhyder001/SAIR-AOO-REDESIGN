import React,{useState} from 'react';
import {View,TextInput,Pressable} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {useC} from '../theme';
// Password box with a show / hide eye. Usage: <PasswordField show={show} onToggle={...} value onChangeText placeholder />
export default function PasswordField({show,onToggle,...p}){
 const C=useC(),[f,setF]=useState(false);
 return(<View>
  <TextInput placeholderTextColor={C.mute} accessibilityLabel={p.placeholder} autoCapitalize="none" autoCorrect={false} {...p} secureTextEntry={!show}
   onFocus={()=>setF(true)} onBlur={()=>setF(false)}
   style={{backgroundColor:C.soft,borderWidth:1,borderColor:f?C.red2:C.line,borderRadius:16,color:C.tx,paddingHorizontal:16,paddingVertical:14,paddingRight:48,fontSize:16,marginBottom:10}}/>
  <Pressable onPress={onToggle} hitSlop={10} accessibilityRole="button" accessibilityLabel={show?'Hide password':'Show password'}
   style={{position:'absolute',right:14,top:0,bottom:10,justifyContent:'center'}}>
   <Icon name={show?'eye-off-outline':'eye-outline'} size={22} color={C.mute}/></Pressable></View>)}
