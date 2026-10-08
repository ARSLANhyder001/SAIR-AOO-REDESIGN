import React,{useEffect,useState,useMemo,useCallback,useDeferredValue} from 'react';
import {FlatList,RefreshControl,View,Text,Pressable} from 'react-native';
import {Page,SearchBar,Chips,PillRow,Empty,Field,Loading,ErrorBox} from '../components/ui';
import ListingCard from '../components/ListingCard';
import {useApp} from '../store';
import {useC} from '../theme';
const PURPOSE=[['all','All'],['sale','Buy'],['rent','Rent']],KINDS=[['all','Any type'],['project','Projects'],['property','Properties']],
 BEDS=[['any','Any beds'],['1','1'],['2','2'],['3','3'],['4','4+']],SORTS=[['new','Newest'],['low','Price: low to high'],['high','Price: high to low']];
export default function ListScreen({navigation,route}){
 const C=useC(),{published,favs,toggleFav,loading,error,reload}=useApp();
 const [q,setQ]=useState(''),[kind,setKind]=useState('all'),[purpose,setPurpose]=useState('all'),[city,setCity]=useState('all'),[bed,setBed]=useState('any'),[sort,setSort]=useState('new'),
  [min,setMin]=useState(''),[max,setMax]=useState(''),[more,setMore]=useState(false),[rf,setRf]=useState(false);
 useEffect(()=>{setQ(route.params?.q||'');setKind(route.params?.kind||'all');setPurpose(route.params?.purpose||'all')},[route.params]);
 const txt=useDeferredValue(q.trim().toLowerCase());
 const cityOpts=useMemo(()=>[['all','All cities'],...[...new Set(published.map(x=>x.city).filter(Boolean))].map(c=>[c,c])],[published]);
 const index=useMemo(()=>published.map(x=>({x,h:`${x.title} ${x.subtitle||''} ${x.city||''} ${x.description||''}`.toLowerCase()})),[published]);
 const rows=useMemo(()=>{
  const lo=min?Number(min):0,hi=max?Number(max):null;
  let r=index.filter(({x,h})=>(kind==='all'||x.kind===kind)&&(purpose==='all'||(x.purpose||'sale')===purpose)&&(city==='all'||x.city===city)
   &&(bed==='any'||(bed==='4'?x.bedrooms>=4:x.bedrooms===Number(bed)))
   &&Number(x.price||0)>=lo&&(hi==null||(x.price!=null&&Number(x.price)<=hi))&&h.includes(txt)).map(o=>o.x);
  if(sort==='low')r.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
  if(sort==='high')r.sort((a,b)=>(b.price??-1)-(a.price??-1));
  return r},[index,kind,purpose,city,bed,sort,min,max,txt]);
 const n=[city!=='all',bed!=='any',sort!=='new',!!min,!!max].filter(Boolean).length;
 const clear=()=>{setCity('all');setBed('any');setSort('new');setMin('');setMax('')};
 const star=useCallback(async id=>{if(!(await toggleFav(id)))navigation.navigate('Account')},[toggleFav,navigation]);
 const open=useCallback(id=>navigation.navigate('Detail',{id}),[navigation]);
 const onRefresh=async()=>{setRf(true);await reload();setRf(false)};
 const renderItem=useCallback(({item})=><ListingCard item={item} saved={favs.has(item.id)} onStar={star} onOpen={open}/>,[favs,star,open]);
 const header=(<>
  <Text accessibilityRole="header" style={{color:C.tx,fontSize:26,fontWeight:'800',marginBottom:12}}>Search</Text>
  <SearchBar value={q} onChangeText={setQ}/>
  <PillRow options={PURPOSE} value={purpose} onChange={setPurpose}/>
  <PillRow options={KINDS} value={kind} onChange={setKind}/>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginVertical:8}}>
   <Text style={{color:C.mute}}>{loading?'Loading...':`${rows.length} ${rows.length===1?'listing':'listings'}`}</Text>
   <Pressable onPress={()=>setMore(m=>!m)} hitSlop={8}><Text style={{color:C.red2,fontWeight:'600'}}>{more?'Hide filters':`Filters${n?` (${n})`:''}`}</Text></Pressable></View>
  {more&&<>
   <Chips options={cityOpts} value={city} onChange={setCity}/><Chips options={BEDS} value={bed} onChange={setBed}/><Chips options={SORTS} value={sort} onChange={setSort}/>
   <Field placeholder="Min price (PKR)" keyboardType="numeric" value={min} onChangeText={setMin}/>
   <Field placeholder="Max price (PKR)" keyboardType="numeric" value={max} onChangeText={setMax}/>
   {n>0&&<Pressable onPress={clear} style={{alignSelf:'flex-start',marginBottom:10}}><Text style={{color:C.red2,fontWeight:'600'}}>Clear filters</Text></Pressable>}</>}</>);
 return(<Page>
  <FlatList data={loading||(error&&!published.length)?[]:rows} keyExtractor={x=>x.id} renderItem={renderItem}
   ListHeaderComponent={header} keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:16,paddingBottom:40}}
   initialNumToRender={6} maxToRenderBatch={6} windowSize={7} removeClippedSubviews
   refreshControl={<RefreshControl refreshing={rf} onRefresh={onRefresh} tintColor={C.red2}/>}
   ListEmptyComponent={loading?<Loading/>:error&&!published.length?<ErrorBox text="Could not load listings. Check your internet." onRetry={reload}/>:<Empty text="Nothing found."/>}/></Page>)}
