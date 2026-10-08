import React,{useMemo,useCallback} from 'react';
import {Screen,H,Empty} from '../components/ui';
import ListingRow from '../components/ListingRow';
import {useApp} from '../store';
export default function SavedScreen({navigation}){
 const {published,favs,user,toggleFav}=useApp(),rows=useMemo(()=>published.filter(x=>favs.has(x.id)),[published,favs]);
 const open=useCallback(id=>navigation.navigate('Detail',{id}),[navigation]);
 return(<Screen><H>Saved</H>
  {!user?<Empty text="Log in to save listings."/>:rows.length?rows.map(x=><ListingRow key={x.id} item={x} saved onStar={toggleFav} onOpen={open}/>):<Empty text="Nothing saved yet."/>}</Screen>)}
