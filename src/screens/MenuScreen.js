import React from 'react';
import {View,Text,Pressable} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {Screen,H,Muted} from '../components/ui';
import {useApp} from '../store';
import {useTheme} from '../theme';
const THEMES=[['system','System','theme-light-dark'],['light','Light','white-balance-sunny'],['dark','Dark','weather-night']];
export default function MenuScreen({navigation}){
 const {role}=useApp(),{C,mode,setMode}=useTheme(),go=(n,p)=>()=>navigation.navigate(n,p);
 const rows=[['Projects','crane','List',{kind:'project'}],['Properties','office-building-outline','List',{kind:'property'}],['Buy / Sell','home-city-outline','BuySell'],['Contact','phone-outline','Contact'],...(role==='admin'?[['Admin panel','shield-account-outline','Admin']]:[])];
 return(<Screen><H>Menu</H>
  {rows.map(([l,ic,n,p])=>(<Pressable key={l} accessibilityRole="button" accessibilityLabel={l} onPress={go(n,p)} style={({pressed})=>[{flexDirection:'row',alignItems:'center',gap:14,padding:14,marginBottom:10,borderRadius:18,borderWidth:1,borderColor:C.line,backgroundColor:C.card},C.shadow,pressed&&{opacity:.85}]}>
   <View style={{width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center',backgroundColor:C.tint}}><Icon name={ic} size={24} color={C.red2}/></View>
   <Text style={{flex:1,color:C.tx,fontSize:16,fontWeight:'600'}}>{l}</Text><Icon name="chevron-right" size={22} color={C.mute}/></Pressable>))}
  <Text style={{color:C.tx,fontSize:18,fontWeight:'800',marginTop:18,marginBottom:4}}>Appearance</Text><Muted style={{marginBottom:10}}>Choose how SAIR looks on your phone.</Muted>
  <View style={{flexDirection:'row',backgroundColor:C.soft,borderRadius:16,padding:4}}>
   {THEMES.map(([v,l,ic])=>(<Pressable key={v} onPress={()=>setMode(v)} accessibilityRole="tab" accessibilityState={{selected:mode===v}}
    style={{flex:1,flexDirection:'row',gap:6,paddingVertical:11,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:mode===v?C.card:'transparent'}}>
    <Icon name={ic} size={18} color={mode===v?C.red2:C.mute}/><Text style={{color:mode===v?C.red2:C.mute,fontWeight:'700'}}>{l}</Text></Pressable>))}</View></Screen>)}
