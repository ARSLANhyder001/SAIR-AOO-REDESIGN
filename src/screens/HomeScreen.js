import React,{useRef,useState,useCallback,useMemo} from 'react';
import {View,Text,TextInput,Animated,Pressable,ScrollView,RefreshControl,StyleSheet,useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import Svg,{Polygon,Defs,LinearGradient as SvgGrad,Stop} from 'react-native-svg';
import {Grad,Thumb,Btn,Muted} from '../components/ui';
import ListingCard from '../components/ListingCard';
import {useApp} from '../store';
import {useC,priceText} from '../theme';

const TILES=[['Projects','crane','List',{kind:'project'}],['Properties','office-building-outline','List',{kind:'property'}],['Buy/Sell','home-city-outline','BuySell'],['Contact','phone-outline','Contact']];

function Mark({C}){return(<Svg width={104} height={120} viewBox="0 0 120 140">
 <Defs><SvgGrad id="mk" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={C.mark[0]}/><Stop offset="1" stopColor={C.mark[1]}/></SvgGrad></Defs>
 <Polygon points="20,8 100,0 100,34 20,44" fill="url(#mk)"/><Polygon points="20,44 52,40 52,68 20,76" fill="url(#mk)"/>
 <Polygon points="20,76 100,68 100,98 52,104" fill="#9d0d15"/><Polygon points="52,68 100,62 100,98 52,104" fill="url(#mk)"/>
 <Polygon points="20,106 68,100 68,136 20,140" fill="url(#mk)"/><Polygon points="68,100 100,96 100,132 68,136" fill={C.dark?'#d9d9d9':'#5b616b'}/></Svg>);}

function Card({C,s,item,index,scrollX,cw,snap,saved,onOpen,onStar}){
 const r=[(index-1)*snap,index*snap,(index+1)*snap];
 const scale=scrollX.interpolate({inputRange:r,outputRange:[0.9,1.04,0.9],extrapolate:'clamp'});
 const opacity=scrollX.interpolate({inputRange:r,outputRange:[0.7,1,0.7],extrapolate:'clamp'});
 return(<Animated.View style={[{width:cw,marginHorizontal:6,borderRadius:22,backgroundColor:C.card,transform:[{scale}],opacity},C.glow]}>
  <Grad colors={C.glass} style={s.card}>
   <View style={{height:150,borderRadius:16,overflow:'hidden'}}>
    <Thumb item={item} w={480} style={{width:'100%',height:150}}/>
    <Pressable onPress={()=>onStar(item.id)} hitSlop={8} accessibilityLabel={saved?'Remove from saved':'Save'} style={s.heart}>
     <Icon name={saved?'heart':'heart-outline'} size={18} color={saved?C.red2:'#fff'}/></Pressable></View>
   <Text numberOfLines={1} style={s.ct}>{item.title}</Text>
   <Text numberOfLines={1} style={s.cs}>{priceText(item,true)||[item.subtitle,item.city].filter(Boolean).join(' · ')||'Price on request'}</Text>
   <Pressable accessibilityRole="button" accessibilityLabel={'View details '+item.title} onPress={()=>onOpen(item.id)}>
    <Grad colors={C.btnG} style={s.btn}><Text style={s.bt}>View Details</Text></Grad></Pressable>
  </Grad></Animated.View>);}

export default function HomeScreen({navigation}){
 const C=useC(),s=useMemo(()=>mk(C),[C]),{published,favs,toggleFav,loading,error,reload}=useApp(),ins=useSafeAreaInsets(),{width}=useWindowDimensions();
 const [q,setQ]=useState(''),[rf,setRf]=useState(false),[idx,setIdx]=useState(0);
 const scrollX=useRef(new Animated.Value(0)).current,list=useRef(null);
 const cw=Math.min(width*0.6,300),snap=cw+12,side=(width-snap)/2,featured=useMemo(()=>published.slice(0,6),[published]),more=useMemo(()=>published.slice(6,10),[published]);
 const open=useCallback(id=>navigation.navigate('Detail',{id}),[navigation]);
 const star=useCallback(async id=>{if(!(await toggleFav(id)))navigation.navigate('Account')},[toggleFav,navigation]);
 const go=n=>{const i=Math.max(0,Math.min(featured.length-1,n));list.current?.scrollToOffset({offset:i*snap,animated:true});setIdx(i)};
 const refresh=async()=>{setRf(true);await reload();setRf(false)};
 return(<View style={{flex:1,backgroundColor:C.bg}}>
  <Grad colors={C.hero} locations={[0,0.45,0.85]} style={StyleSheet.absoluteFill}/>
  <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
   refreshControl={<RefreshControl refreshing={rf} onRefresh={refresh} tintColor={C.red2}/>}
   contentContainerStyle={{paddingTop:ins.top+16,paddingBottom:32}}>
   <View style={{alignItems:'center'}}><Mark C={C}/>
    <Text style={s.brand}>SAIR</Text><Text style={s.sub}>CONSTRUCTION & REAL ESTATE</Text></View>

   <Grad colors={C.glass} style={[s.search]}>
    <Icon name="magnify" size={24} color={C.tx}/>
    <TextInput accessibilityLabel="Search" value={q} onChangeText={setQ} returnKeyType="search" autoCorrect={false}
     onSubmitEditing={()=>navigation.navigate('List',{q})} placeholder="Search projects or properties" placeholderTextColor={C.mute} style={s.input}/>
    <Pressable hitSlop={10} accessibilityLabel="Filters" onPress={()=>navigation.navigate('List')}><Icon name="tune-variant" size={22} color={C.tx}/></Pressable>
   </Grad>

   <View style={{marginTop:14}}>
    {loading?<Text style={s.msg}>Loading...</Text>
    :error&&!featured.length?<Pressable onPress={reload}><Text style={s.msg}>Could not load listings. Tap to retry.</Text></Pressable>
    :!featured.length?<Text style={s.msg}>No listings yet.</Text>
    :<>
     <Animated.FlatList ref={list} data={featured} keyExtractor={i=>i.id} horizontal showsHorizontalScrollIndicator={false}
      snapToInterval={snap} decelerationRate="fast" contentContainerStyle={{paddingHorizontal:side-6,paddingVertical:26}}
      initialScrollIndex={featured.length>1?1:0} getItemLayout={(_,i)=>({length:snap,offset:snap*i,index:i})}
      onScroll={Animated.event([{nativeEvent:{contentOffset:{x:scrollX}}}],{useNativeDriver:true})} scrollEventThrottle={16}
      onMomentumScrollEnd={e=>setIdx(Math.round(e.nativeEvent.contentOffset.x/snap))}
      renderItem={({item,index})=><Card C={C} s={s} item={item} index={index} scrollX={scrollX} cw={cw} snap={snap} saved={favs.has(item.id)} onOpen={open} onStar={star}/>}/>
     {featured.length>1&&<><Pressable style={[s.arrow,{left:6}]} onPress={()=>go(idx-1)} accessibilityLabel="Previous"><Icon name="chevron-left" size={26} color={C.tx}/></Pressable>
      <Pressable style={[s.arrow,{right:6}]} onPress={()=>go(idx+1)} accessibilityLabel="Next"><Icon name="chevron-right" size={26} color={C.tx}/></Pressable></>}</>}
   </View>

   <View style={{flexDirection:'row',gap:10,paddingHorizontal:16}}>
    {TILES.map(([label,icon,route,params])=>(<Pressable key={label} style={{flex:1}} accessibilityRole="button" accessibilityLabel={label} onPress={()=>navigation.navigate(route,params)}>
     <Grad colors={C.tileG} style={s.tile}>
      <Icon name={icon} size={32} color={C.dark?'#e6e6e6':C.red}/><Text style={s.tt}>{label}</Text></Grad></Pressable>))}
   </View>

   {more.length>0&&<View style={{paddingHorizontal:16,marginTop:24}}>
    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline',marginBottom:12}}>
     <Text accessibilityRole="header" style={{color:C.tx,fontSize:20,fontWeight:'800'}}>More to explore</Text>
     <Pressable onPress={()=>navigation.navigate('List')} hitSlop={8}><Text style={{color:C.red2,fontWeight:'700'}}>See all</Text></Pressable></View>
    {more.map(x=><ListingCard key={x.id} item={x} saved={favs.has(x.id)} onStar={star} onOpen={open}/>)}</View>}

   <View style={[{marginHorizontal:16,marginTop:10,padding:18,borderRadius:22,backgroundColor:C.tint,borderWidth:1,borderColor:C.line}]}>
    <Text style={{color:C.tx,fontSize:18,fontWeight:'800'}}>Selling or renting out?</Text>
    <Muted style={{marginTop:4}}>Tell us about your property and SAIR will get back to you.</Muted>
    <Btn title="Sell or rent with SAIR" icon="home-city-outline" onPress={()=>navigation.navigate('BuySell')}/></View>
  </ScrollView></View>);}

const mk=C=>StyleSheet.create({
 brand:{color:C.tx,fontSize:60,fontWeight:'800',letterSpacing:6,marginTop:4,textShadowColor:C.dark?'#555':'transparent',textShadowOffset:{width:3,height:3},textShadowRadius:0},
 sub:{color:C.tx,fontSize:11,fontWeight:'600',letterSpacing:3.2,marginTop:8},
 search:{flexDirection:'row',alignItems:'center',gap:12,height:56,marginHorizontal:20,marginTop:22,paddingHorizontal:18,borderRadius:28,borderWidth:1,borderColor:C.line},
 input:{flex:1,color:C.tx,fontSize:15,fontWeight:'500'},
 card:{borderRadius:22,padding:8,paddingBottom:14,borderWidth:1,borderColor:C.line,borderBottomColor:C.red,borderBottomWidth:2},
 heart:{position:'absolute',top:8,right:8,width:32,height:32,borderRadius:16,backgroundColor:'rgba(0,0,0,0.5)',alignItems:'center',justifyContent:'center'},
 ct:{color:C.tx,fontSize:17,fontWeight:'700',marginTop:12,marginHorizontal:8},
 cs:{color:C.mute,fontSize:12.5,marginHorizontal:8,marginTop:2,marginBottom:10},
 btn:{height:38,borderRadius:19,marginHorizontal:8,alignItems:'center',justifyContent:'center'},bt:{color:'#fff',fontSize:13,fontWeight:'700'},
 arrow:{position:'absolute',top:'50%',marginTop:-22,width:44,height:44,borderRadius:22,borderWidth:1,borderColor:C.line,backgroundColor:C.dark?'rgba(10,3,5,0.9)':'rgba(255,255,255,0.95)',alignItems:'center',justifyContent:'center'},
 tile:{aspectRatio:1/1.12,borderRadius:18,alignItems:'center',justifyContent:'center',gap:10,borderWidth:1,borderColor:C.line,borderLeftColor:C.red},
 tt:{color:C.tx,fontSize:12.5,fontWeight:'700'},
 msg:{color:C.mute,textAlign:'center',paddingVertical:40}});
