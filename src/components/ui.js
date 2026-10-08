import React,{useState,useEffect,useRef,useMemo,memo} from 'react';
import {Pressable,Text,TextInput,View,ScrollView,FlatList,RefreshControl,Animated,Modal,KeyboardAvoidingView,Platform,useWindowDimensions,StyleSheet} from 'react-native';
import {SafeAreaView,useSafeAreaInsets} from 'react-native-safe-area-context';
import {Image} from 'expo-image';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import Svg,{Defs,LinearGradient as SvgGrad,Stop,Rect,Polygon} from 'react-native-svg';
import {useC,cover,sized} from '../theme';

// react-native-svg se gradient: extra package nahi chahiye, halka bhi hai.
export function Grad({colors,locations,style,children}){
 const id=useRef('g'+Math.random().toString(36).slice(2,8)).current;
 return(<View style={[style,{overflow:'hidden'}]}>
  <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
   <Defs><SvgGrad id={id} x1="0" y1="0" x2="0" y2="1">{colors.map((c,i)=><Stop key={i} offset={locations?locations[i]:i/(colors.length-1)} stopColor={c}/>)}</SvgGrad></Defs>
   <Rect width="100%" height="100%" fill={`url(#${id})`}/></Svg>{children}</View>);}

const mk=C=>StyleSheet.create({
 btn:{marginTop:10,height:50,borderRadius:25,alignItems:'center',justifyContent:'center'},
 btnIn:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},
 ghost:{backgroundColor:'transparent',borderWidth:1,borderColor:C.line},bt:{color:'#fff',fontWeight:'700',fontSize:15},
 in:{backgroundColor:C.soft,borderWidth:1,borderColor:C.line,borderRadius:16,color:C.tx,paddingHorizontal:16,paddingVertical:14,fontSize:16,marginBottom:10},
 chip:{paddingHorizontal:14,paddingVertical:8,borderRadius:20,borderWidth:1,borderColor:C.line,backgroundColor:C.card},chipOn:{borderColor:C.red2,backgroundColor:C.tint},
 search:{flexDirection:'row',alignItems:'center',gap:10,height:52,paddingHorizontal:16,borderRadius:26,borderWidth:1,borderColor:C.line,backgroundColor:C.card},
 tile:{flex:1,alignItems:'center',gap:8,paddingVertical:14,borderRadius:20,borderWidth:1,borderColor:C.line,backgroundColor:C.card},
 ico:{width:46,height:46,borderRadius:23,alignItems:'center',justifyContent:'center',backgroundColor:C.tint},
 badge:{backgroundColor:C.red,paddingHorizontal:9,paddingVertical:3,borderRadius:10}});
export const useS=()=>{const C=useC();return useMemo(()=>mk(C),[C])};

const Shell=({children,top})=>{const C=useC();return(
 <SafeAreaView edges={top?['top']:[]} style={{flex:1,backgroundColor:C.bg}}>
  <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>{children}</KeyboardAvoidingView></SafeAreaView>)};
export const Screen=({children,top=true,onRefresh,refreshing,scrollRef,pad=16})=>{const C=useC();return(
 <Shell top={top}>
  <ScrollView ref={scrollRef} refreshControl={onRefresh?<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={C.red2}/>:undefined} contentContainerStyle={{padding:pad,paddingBottom:pad?40:0}} keyboardShouldPersistTaps="handled">
   <View style={{width:'100%',maxWidth:720,alignSelf:'center'}}>{children}</View></ScrollView></Shell>)};
// For screens that render a long virtualized FlatList (don't nest FlatList inside Screen's ScrollView).
export const Page=({children,top=true})=><Shell top={top}><View style={{flex:1,width:'100%',maxWidth:720,alignSelf:'center'}}>{children}</View></Shell>;
export const H=({children})=>{const C=useC();return <Text accessibilityRole="header" style={{color:C.tx,fontSize:26,fontWeight:'800',letterSpacing:-0.3,marginVertical:14}}>{children}</Text>};
export const Muted=({children,style})=>{const C=useC();return <Text style={[{color:C.mute,fontSize:14},style]}>{children}</Text>};
export const Empty=({text})=>{const C=useC();return(<View style={{alignItems:'center',paddingVertical:36,gap:10}}>
 <View style={{width:64,height:64,borderRadius:32,alignItems:'center',justifyContent:'center',backgroundColor:C.tint}}><Icon name="home-search-outline" size={30} color={C.red2}/></View>
 <Text style={{color:C.mute,textAlign:'center'}}>{text}</Text></View>)};
export const Btn=({title,onPress,ghost,disabled,icon})=>{const C=useC(),s=useS();
 return(<Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{disabled:!!disabled}} onPress={onPress} disabled={disabled}
  style={({pressed})=>[s.btn,ghost?s.ghost:C.glow,pressed&&{opacity:.85,transform:[{scale:.98}]},disabled&&{opacity:.5}]}>
  {!ghost&&<Grad colors={C.btnG} style={[StyleSheet.absoluteFill,{borderRadius:25}]}/>}
  <View style={s.btnIn}>{!!icon&&<Icon name={icon} size={19} color={ghost?C.red2:'#fff'}/>}<Text style={[s.bt,ghost&&{color:C.tx}]}>{title}</Text></View></Pressable>)};
export const Field=({onFocus,onBlur,...p})=>{const C=useC(),s=useS(),[f,setF]=useState(false);
 return <TextInput placeholderTextColor={C.mute} accessibilityLabel={p.placeholder} {...p}
  onFocus={e=>{setF(true);onFocus&&onFocus(e)}} onBlur={e=>{setF(false);onBlur&&onBlur(e)}}
  style={[s.in,f&&{borderColor:C.red2},p.multiline&&{height:96,textAlignVertical:'top'}]}/>};
export const Chips=memo(({options,value,onChange})=>{const C=useC(),s=useS();return(
 <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:10}}>
  {options.map(([v,l])=><Pressable key={v} accessibilityRole="button" accessibilityState={{selected:value===v}} onPress={()=>onChange(v)} style={[s.chip,value===v&&s.chipOn]}><Text style={{color:value===v?C.red2:C.tx,fontWeight:value===v?'700':'400'}}>{l}</Text></Pressable>)}</View>)});
export const PillRow=memo(({options,value,onChange})=>{const C=useC(),s=useS();return(
 <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexGrow:0}} contentContainerStyle={{gap:8,paddingVertical:6}} keyboardShouldPersistTaps="handled">
  {options.map(([v,l])=><Pressable key={v} accessibilityRole="button" accessibilityState={{selected:value===v}} onPress={()=>onChange(v)} style={[s.chip,value===v&&s.chipOn]}><Text style={{color:value===v?C.red2:C.tx,fontWeight:value===v?'700':'400'}}>{l}</Text></Pressable>)}</ScrollView>)});
export const SearchBar=({value,onChangeText,onSubmitEditing})=>{const C=useC(),s=useS();return(
 <View style={[s.search,C.shadow]}><Icon name="magnify" size={22} color={C.mute}/>
  <TextInput accessibilityLabel="Search" value={value} onChangeText={onChangeText} onSubmitEditing={onSubmitEditing} returnKeyType="search" autoCorrect={false} placeholder="Search projects or properties" placeholderTextColor={C.mute} style={{flex:1,color:C.tx,fontSize:16}}/>
  {!!value&&<Pressable onPress={()=>onChangeText('')} hitSlop={10} accessibilityLabel="Clear search"><Icon name="close-circle" size={20} color={C.mute}/></Pressable>}</View>)};
export const Tile=({icon,label,onPress})=>{const C=useC(),s=useS();return(
 <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({pressed})=>[s.tile,pressed&&{transform:[{scale:.96}]}]}>
  <View style={s.ico}><Icon name={icon} size={24} color={C.red2}/></View>
  <Text style={{color:C.tx,fontSize:13,fontWeight:'500'}}>{label}</Text></Pressable>)};
export const Badge=({text,dark})=>{const s=useS();return <View style={[s.badge,dark&&{backgroundColor:'rgba(59,65,60,.9)'}]}><Text style={{color:'#fff',fontSize:11,fontWeight:'700'}}>{text}</Text></View>};
// expo-image = disk + memory caching, smooth fade-in, recycles views in long lists.
export const Thumb=memo(({item,style,w=480})=>{const C=useC(),u=sized(cover(item),w);return u
 ?<Image source={{uri:u}} style={style} contentFit="cover" transition={200} cachePolicy="memory-disk" recyclingKey={u}/>
 :<View style={[style,{backgroundColor:C.dark?`hsl(${item.hue??165}, 25%, 14%)`:`hsl(${item.hue??165}, 30%, 92%)`,alignItems:'center',justifyContent:'center'}]}><Icon name="office-building-outline" size={38} color={C.dark?'rgba(255,255,255,.25)':'rgba(0,0,0,.2)'}/></View>});
export function Skeleton({style}){const C=useC();
 const o=useRef(new Animated.Value(.35)).current;
 useEffect(()=>{const a=Animated.loop(Animated.sequence([Animated.timing(o,{toValue:.7,duration:700,useNativeDriver:true}),Animated.timing(o,{toValue:.35,duration:700,useNativeDriver:true})]));a.start();return()=>a.stop()},[o]);
 return <Animated.View style={[{backgroundColor:C.skel,borderRadius:18,opacity:o},style]}/>}
export const Loading=()=><View accessibilityLabel="Loading" style={{gap:10,paddingVertical:16}}>{[0,1,2].map(k=><Skeleton key={k} style={{height:70}}/>)}</View>;
export const ErrorBox=({text,onRetry})=>(<View style={{alignItems:'center',paddingVertical:24}}><Muted>{text}</Muted><View style={{width:160}}><Btn ghost title="Try again" icon="refresh" onPress={onRetry}/></View></View>);
export function Gallery({item,height=240}){
 const C=useC(),imgs=item.images?.length?item.images:(item.image_url?[item.image_url]:[]);
 const [w,setW]=useState(0),[i,setI]=useState(0),[full,setFull]=useState(false);
 const {width:sw,height:sh}=useWindowDimensions(),ins=useSafeAreaInsets();
 if(!imgs.length)return <Thumb item={item} style={{height,width:'100%'}}/>;
 return(<View onLayout={e=>setW(e.nativeEvent.layout.width)} style={{height}}>
  {w>0&&<FlatList horizontal pagingEnabled showsHorizontalScrollIndicator={false} data={imgs} keyExtractor={(u,k)=>u+k}
   getItemLayout={(_,k)=>({length:w,offset:w*k,index:k})} initialNumToRender={1} windowSize={3}
   onMomentumScrollEnd={e=>setI(Math.round(e.nativeEvent.contentOffset.x/w))}
   renderItem={({item:u})=><Pressable onPress={()=>setFull(true)} accessibilityLabel="Open photo full screen"><Image source={{uri:sized(u,900)}} style={{width:w,height}} contentFit="cover" transition={200} cachePolicy="memory-disk"/></Pressable>}/>}
  {imgs.length>1&&<View pointerEvents="none" style={{position:'absolute',bottom:34,alignSelf:'center',flexDirection:'row',gap:6}}>
   {imgs.map((_,k)=><View key={k} style={{width:k===i?18:8,height:8,borderRadius:4,backgroundColor:k===i?C.red2:'rgba(255,255,255,.6)'}}/>)}</View>}
  <Modal visible={full} transparent animationType="fade" statusBarTranslucent onRequestClose={()=>setFull(false)}>
   <View style={{flex:1,backgroundColor:'#000'}}>
    <FlatList horizontal pagingEnabled data={imgs} initialScrollIndex={i} keyExtractor={(u,k)=>u+k} showsHorizontalScrollIndicator={false}
     getItemLayout={(_,k)=>({length:sw,offset:sw*k,index:k})}
     renderItem={({item:u})=><Pressable onPress={()=>setFull(false)}><Image source={{uri:u}} style={{width:sw,height:sh}} contentFit="contain" cachePolicy="memory-disk"/></Pressable>}/>
    <Pressable onPress={()=>setFull(false)} hitSlop={12} accessibilityLabel="Close" style={{position:'absolute',top:ins.top+10,right:16}}><Icon name="close" size={30} color="#fff"/></Pressable></View></Modal></View>)}
export const Logo=({size=90})=>(
 <Svg width={size} height={size*1.1} viewBox="0 0 100 110">
  <Polygon points="20,10 60,0 60,22 36,30" fill="#2b2f36"/><Polygon points="60,0 82,12 82,34 60,22" fill="#2a7360"/>
  <Polygon points="20,40 78,48 78,68 20,60" fill="#5b616b"/><Polygon points="80,70 80,96 40,108 40,86" fill="#2b2f36"/>
  <Polygon points="20,70 40,76 40,100 20,92" fill="#1f5748"/></Svg>);
