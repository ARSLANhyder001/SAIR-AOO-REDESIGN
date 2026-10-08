import React,{useEffect,useRef,useState} from 'react';
import {View,Text,Image,Pressable} from 'react-native';
import {Screen,H,Btn,Field,Chips,Muted,Empty} from '../components/ui';
import {supabase} from '../lib/supabase';
import {pickAndUpload,removeImage} from '../lib/images';
import {notify,confirm} from '../lib/dialog';
import {call,whatsapp,toWa} from '../lib/contact';
import {useApp} from '../store';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {useC,AREA} from '../theme';
const MAX=10;
const blank={id:null,kind:'project',title:'',subtitle:'',city:'',price:'',bedrooms:'',bathrooms:'',area_size:'',area_unit:'marla',purpose:'sale',description:'',status:'published',images:[],orig:[]};
export default function AdminScreen(){
 const C=useC(),{role,listings,reload}=useApp(),[f,setF]=useState(blank),[inq,setInq]=useState([]),[busy,setBusy]=useState(false),[rf,setRf]=useState(false),[ifilter,setIf]=useState('new'),sr=useRef(null);
 const loadInq=async()=>{const {data}=await supabase.from('inquiries').select('*').order('created_at',{ascending:false}).limit(50);setInq(data||[])};
 useEffect(()=>{if(role==='admin')loadInq()},[role]);
 if(role!=='admin')return <Screen top={false}><Empty text="Admins only."/></Screen>;
 const set=k=>v=>setF(p=>({...p,[k]:v}));
 const onRefresh=async()=>{setRf(true);await Promise.all([reload(),loadInq()]);setRf(false)};
 const addPhotos=async()=>{if(f.images.length>=MAX)return notify('Limit reached',`Up to ${MAX} photos per listing.`);
  setBusy(true);
  try{const urls=await pickAndUpload(MAX-f.images.length);setF(p=>({...p,images:[...p.images,...urls].slice(0,MAX)}))}
  catch(e){notify('Upload failed',e.message)}
  setBusy(false)};
 const makeCover=i=>setF(p=>({...p,images:[p.images[i],...p.images.filter((_,k)=>k!==i)]}));
 const dropImg=i=>{const u=f.images[i];if(u&&!f.orig.includes(u))removeImage(u).catch(()=>{});// brand-new upload: delete now, no orphan files
  setF(p=>({...p,images:p.images.filter((_,k)=>k!==i)}))};
 const cancel=()=>{f.images.filter(u=>!f.orig.includes(u)).forEach(u=>removeImage(u).catch(()=>{}));setF(blank)};
 const save=async()=>{
  if(f.title.trim().length<2)return notify('Title needed');
  if([f.price,f.bedrooms,f.bathrooms,f.area_size].some(v=>v!==''&&isNaN(Number(v))))return notify('Check numbers','Price, bedrooms, bathrooms and area must be numbers.');
  const row={kind:f.kind,title:f.title.trim(),subtitle:f.subtitle.trim()||null,city:f.city.trim()||null,description:f.description.trim()||null,
   status:f.status,price:f.price?Number(f.price):null,bedrooms:f.bedrooms!==''?Number(f.bedrooms):null,bathrooms:f.bathrooms!==''?Number(f.bathrooms):null,
   area_size:f.area_size!==''?Number(f.area_size):null,area_unit:f.area_unit,purpose:f.purpose,images:f.images};
  setBusy(true);
  const {error}=f.id?await supabase.from('listings').update(row).eq('id',f.id):await supabase.from('listings').insert(row);
  setBusy(false);
  if(error)return notify('Error',error.message);
  f.orig.filter(u=>!f.images.includes(u)).forEach(u=>removeImage(u).catch(()=>{}));
  setF(blank);reload()};
 const edit=l=>{setF({id:l.id,kind:l.kind,title:l.title,subtitle:l.subtitle||'',city:l.city||'',price:l.price?String(l.price):'',
   bedrooms:l.bedrooms!=null?String(l.bedrooms):'',bathrooms:l.bathrooms!=null?String(l.bathrooms):'',area_size:l.area_size?String(+l.area_size):'',area_unit:l.area_unit||'marla',purpose:l.purpose||'sale',description:l.description||'',status:l.status,images:l.images||[],orig:l.images||[]});
  sr.current?.scrollTo({y:0,animated:true})};
 const toggle=async l=>{const {error}=await supabase.from('listings').update({status:l.status==='published'?'draft':'published'}).eq('id',l.id);error?notify('Error',error.message):reload()};
 const del=l=>confirm('Delete listing?',l.title,async()=>{const {error}=await supabase.from('listings').delete().eq('id',l.id);
  if(error)return notify('Error',error.message);(l.images||[]).forEach(u=>removeImage(u).catch(()=>{}));reload()});
 const setSt=async(i,status)=>{const {error}=await supabase.from('inquiries').update({status}).eq('id',i.id);error?notify('Error',error.message):loadInq()};
 const delIn=i=>confirm('Delete inquiry?',i.name,async()=>{const {error}=await supabase.from('inquiries').delete().eq('id',i.id);error?notify('Error',error.message):loadInq()});
 const half={width:'48%'},shown=ifilter==='all'?inq:inq.filter(i=>i.status===ifilter);
 return(<Screen top={false} onRefresh={onRefresh} refreshing={rf} scrollRef={sr}>
  <H>{f.id?'Edit listing':'Add listing'}</H>
  <Chips options={[['project','Project'],['property','Property']]} value={f.kind} onChange={set('kind')}/>
  <Field placeholder="Title" value={f.title} onChangeText={set('title')}/><Field placeholder="Subtitle" value={f.subtitle} onChangeText={set('subtitle')}/>
  <Field placeholder="City" value={f.city} onChangeText={set('city')}/><Field placeholder="Price in PKR (optional)" keyboardType="numeric" value={f.price} onChangeText={set('price')}/>
  <Chips options={[['sale','For sale'],['rent','For rent (price per month)']]} value={f.purpose} onChange={set('purpose')}/>
  <Field placeholder="Bedrooms (optional)" keyboardType="numeric" value={f.bedrooms} onChangeText={set('bedrooms')}/>
  <Field placeholder="Bathrooms (optional)" keyboardType="numeric" value={f.bathrooms} onChangeText={set('bathrooms')}/>
  <Field placeholder="Area size (optional)" keyboardType="numeric" value={f.area_size} onChangeText={set('area_size')}/>
  <Chips options={Object.entries(AREA)} value={f.area_unit} onChange={set('area_unit')}/>
  <Field placeholder="Description" multiline value={f.description} onChangeText={set('description')}/>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:6}}>
   {f.images.map((u,i)=><View key={u}>
    <Pressable onPress={()=>makeCover(i)}><Image source={{uri:u}} style={{width:84,height:70,borderRadius:12,borderWidth:i===0?2:0,borderColor:C.red2}}/></Pressable>
    <Pressable onPress={()=>dropImg(i)} hitSlop={8} style={{position:'absolute',top:-6,right:-6,width:22,height:22,borderRadius:11,backgroundColor:C.red,alignItems:'center',justifyContent:'center'}}><Icon name="close" size={14} color="#fff"/></Pressable>
    {i===0&&<Text style={{color:C.red2,fontSize:11,textAlign:'center'}}>Cover</Text>}</View>)}</View>
  <Muted>{f.images.length}/{MAX} photos. Tap a photo to make it the cover.</Muted>
  <Btn ghost title={busy?'Please wait...':'Add photos'} onPress={addPhotos} disabled={busy}/>
  <Chips options={[['published','Published'],['draft','Draft']]} value={f.status} onChange={set('status')}/>
  <Btn title={f.id?'Save changes':'Save listing'} onPress={save} disabled={busy}/>
  {!!f.id&&<Btn ghost title="Cancel editing" onPress={cancel}/>}
  <H>Listings</H>
  {listings.map(l=><View key={l.id} style={{padding:12,marginBottom:8,borderRadius:16,borderWidth:1,borderColor:C.line,backgroundColor:C.card}}>
   <Text style={{color:C.tx,fontWeight:'600'}}>{l.title}</Text><Muted>{l.kind} · {l.status} · {(l.images||[]).length} photos</Muted>
   <View style={{flexDirection:'row',gap:8}}>
    <View style={{flex:1}}><Btn ghost title="Edit" onPress={()=>edit(l)}/></View>
    <View style={{flex:1}}><Btn ghost title={l.status==='published'?'Hide':'Show'} onPress={()=>toggle(l)}/></View>
    <View style={{flex:1}}><Btn ghost title="Delete" onPress={()=>del(l)}/></View></View></View>)}
  <H>Inquiries</H>
  <Chips options={[['new',`New (${inq.filter(i=>i.status==='new').length})`],['contacted','Contacted'],['closed','Closed'],['all','All']]} value={ifilter} onChange={setIf}/>
  {shown.length?shown.map(i=><View key={i.id} style={{padding:12,marginBottom:8,borderRadius:16,borderWidth:1,borderColor:C.line,backgroundColor:C.card}}>
   <Text style={{color:C.tx,fontWeight:'600'}}>{i.name} · {i.type} · <Text style={{color:i.status==='new'?C.red2:C.mute}}>{i.status}</Text></Text>
   <Muted>{i.phone}{i.area?` · ${i.area}`:''}</Muted>{!!i.message&&<Muted>{i.message}</Muted>}
   <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'}}>
    <View style={half}><Btn ghost title="Call" onPress={()=>call(i.phone)}/></View>
    <View style={half}><Btn ghost title="WhatsApp" onPress={()=>whatsapp(toWa(i.phone),`Assalam o Alaikum ${i.name}, this is SAIR regarding your enquiry.`)}/></View>
    <View style={half}><Btn ghost title="Contacted" onPress={()=>setSt(i,'contacted')}/></View>
    <View style={half}><Btn ghost title="Closed" onPress={()=>setSt(i,'closed')}/></View>
    <View style={half}><Btn ghost title="Delete" onPress={()=>delIn(i)}/></View></View></View>):<Empty text="No inquiries here."/>}</Screen>)}
