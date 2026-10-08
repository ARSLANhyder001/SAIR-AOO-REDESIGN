import React,{useMemo} from 'react';
import {View,Text,Share,Pressable,StyleSheet} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Screen,Btn,Muted,Empty,Gallery,Badge} from '../components/ui';
import {useApp} from '../store';
import {SAIR,hasPhone} from '../config';
import {call,whatsapp} from '../lib/contact';
import {useC,AREA,priceText,isNew} from '../theme';
const mk=C=>StyleSheet.create({
 stat:{flex:1,alignItems:'center',paddingVertical:14,borderRadius:18,borderWidth:1,borderColor:C.line,backgroundColor:C.card},
 bar:{backgroundColor:C.card,borderTopWidth:1,borderTopColor:C.line,paddingHorizontal:16},
 barIn:{flexDirection:'row',alignItems:'center',gap:10,width:'100%',maxWidth:720,alignSelf:'center'},
 ib:{marginTop:10,width:50,height:50,borderRadius:25,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center',backgroundColor:C.tint}});
export default function DetailScreen({navigation,route}){
 const C=useC(),s=useMemo(()=>mk(C),[C]),{listings,favs,toggleFav}=useApp(),ins=useSafeAreaInsets(),x=useMemo(()=>listings.find(l=>l.id===route.params.id),[listings,route.params.id]);
 if(!x)return <Screen top={false}><Empty text="Listing not found."/></Screen>;
 const IconBtn=({name,label,onPress})=><Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={s.ib}><Icon name={name} size={23} color={C.red2}/></Pressable>;
 const save=async()=>{if(!(await toggleFav(x.id)))navigation.navigate('Account')};
 const msg=`Assalam o Alaikum, I am interested in "${x.title}"${x.city?` (${x.city})`:''}. Please share details.`;
 const share=()=>Share.share({message:`${x.title}${x.city?` - ${x.city}`:''}${x.price?`\n${priceText(x)}`:''}\n${SAIR.name}${hasPhone?`\n${SAIR.phone}`:''}`}).catch(()=>{});
 const stats=[x.bedrooms!=null&&['bed-outline',x.bedrooms,'Beds'],x.bathrooms!=null&&['shower',x.bathrooms,'Baths'],x.area_size&&['ruler-square',+x.area_size,AREA[x.area_unit]||'Area']].filter(Boolean);
 return(<View style={{flex:1,backgroundColor:C.bg}}>
  <Screen top={false} pad={0}>
   <View><Gallery item={x} height={290}/>
    <View style={{position:'absolute',top:12,left:12,flexDirection:'row',gap:6}} pointerEvents="none">{isNew(x)&&<Badge text="NEW"/>}{x.purpose==='rent'&&<Badge text="FOR RENT" dark/>}</View></View>
   <View style={{padding:16,marginTop:-24,borderTopLeftRadius:28,borderTopRightRadius:28,backgroundColor:C.bg}}>
    <Text style={{color:C.red2,fontSize:30,fontWeight:'800'}}>{priceText(x)||'Price on request'}</Text>
    <Text style={{color:C.tx,fontSize:20,fontWeight:'700',marginTop:8}}>{x.title}</Text>
    <View style={{flexDirection:'row',alignItems:'center',gap:4,marginTop:4}}><Icon name="map-marker-outline" size={17} color={C.mute}/><Muted>{[x.subtitle,x.city].filter(Boolean).join(' · ')}</Muted></View>
    {stats.length>0&&<View style={{flexDirection:'row',gap:10,marginTop:16}}>
     {stats.map(([ic,v,l])=><View key={l} style={[s.stat,C.shadow]}><Icon name={ic} size={24} color={C.red2}/><Text style={{color:C.tx,fontSize:17,fontWeight:'800',marginTop:4}}>{v}</Text><Muted style={{fontSize:12}}>{l}</Muted></View>)}</View>}
    {!!x.description&&<><Text style={{color:C.tx,fontSize:17,fontWeight:'800',marginTop:22}}>About this {x.kind==='project'?'project':'property'}</Text>
     <Text style={{color:C.mute,marginTop:6,lineHeight:23,fontSize:15}}>{x.description}</Text></>}
    <View style={{flexDirection:'row',gap:10,marginTop:12}}>
     <View style={{flex:1}}><Btn ghost icon={favs.has(x.id)?'heart':'heart-outline'} title={favs.has(x.id)?'Saved':'Save'} onPress={save}/></View>
     <View style={{flex:1}}><Btn ghost icon="share-variant-outline" title="Share" onPress={share}/></View></View></View></Screen>
  <View style={[s.bar,{paddingBottom:Math.max(ins.bottom,10)}]}><View style={s.barIn}>
   {hasPhone&&<IconBtn name="phone" label="Call" onPress={()=>call(SAIR.phone)}/>}
   {hasPhone&&<IconBtn name="whatsapp" label="WhatsApp" onPress={()=>whatsapp(SAIR.whatsapp,msg)}/>}
   <View style={{flex:1}}><Btn title="Enquire" icon="message-text-outline" onPress={()=>navigation.navigate('Contact',{listingId:x.id})}/></View></View></View></View>)}
