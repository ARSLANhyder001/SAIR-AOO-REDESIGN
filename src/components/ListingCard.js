import React,{memo,useMemo} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {Thumb,Badge} from './ui';
import {useC,priceText,isNew,AREA} from '../theme';
// One card for Home (fixed width) and for the List / Saved feeds (full width). Tap anywhere opens the listing.
const mk=C=>StyleSheet.create({
 card:{borderRadius:22,backgroundColor:C.card,borderWidth:1,borderColor:C.line},
 clip:{borderRadius:21,overflow:'hidden'},
 tags:{position:'absolute',top:10,left:10,flexDirection:'row',gap:6},
 heart:{position:'absolute',top:10,right:10,width:36,height:36,borderRadius:18,backgroundColor:'rgba(0,0,0,.45)',alignItems:'center',justifyContent:'center'},
 price:{position:'absolute',left:10,bottom:10,backgroundColor:C.scrim,paddingHorizontal:12,paddingVertical:6,borderRadius:12},
 pt:{color:'#fff',fontSize:16,fontWeight:'800'},
 t:{color:C.tx,fontSize:16,fontWeight:'700'},
 loc:{flexDirection:'row',alignItems:'center',gap:4,marginTop:4},
 f:{flexDirection:'row',gap:14,marginTop:10},fi:{flexDirection:'row',alignItems:'center',gap:5},ft:{color:C.tx,fontSize:13,fontWeight:'500'}});
export default memo(function ListingCard({item,width,saved,onOpen,onStar}){
 const C=useC(),s=useMemo(()=>mk(C),[C]);
 const stats=[item.bedrooms!=null&&['bed-outline',item.bedrooms],item.bathrooms!=null&&['shower',item.bathrooms],item.area_size&&['ruler-square',`${+item.area_size} ${AREA[item.area_unit]||''}`.trim()]].filter(Boolean);
 const place=[item.subtitle,item.city].filter(Boolean).join(' · ');
 return(<Pressable accessibilityRole="button" accessibilityLabel={item.title} onPress={()=>onOpen(item.id)} style={({pressed})=>[s.card,C.shadow,width?{width}:{marginBottom:16},pressed&&{opacity:.92}]}>
  <View style={s.clip}>
   <View><Thumb item={item} w={width?480:900} style={{height:width?170:200,width:'100%'}}/>
    <View style={s.tags} pointerEvents="none">{isNew(item)&&<Badge text="NEW"/>}{item.purpose==='rent'&&<Badge text="FOR RENT" dark/>}{item.status!=='published'&&<Badge text="DRAFT" dark/>}</View>
    {!!onStar&&<Pressable onPress={()=>onStar(item.id)} hitSlop={8} accessibilityLabel={saved?'Remove from saved':'Save'} style={s.heart}>
     <Icon name={saved?'heart':'heart-outline'} size={20} color={saved?C.red2:'#fff'}/></Pressable>}
    <View style={s.price} pointerEvents="none"><Text style={s.pt}>{priceText(item,true)||'Price on request'}</Text></View></View>
   <View style={{padding:14}}>
    <Text style={s.t} numberOfLines={1}>{item.title}</Text>
    {!!place&&<View style={s.loc}><Icon name="map-marker-outline" size={15} color={C.mute}/><Text style={{color:C.mute,fontSize:13,flex:1}} numberOfLines={1}>{place}</Text></View>}
    {stats.length>0&&<View style={s.f}>{stats.map(([ic,v])=><View key={ic} style={s.fi}><Icon name={ic} size={17} color={C.red2}/><Text style={s.ft}>{v}</Text></View>)}</View>}</View></View></Pressable>)});
