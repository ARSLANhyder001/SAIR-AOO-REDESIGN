import React,{createContext,useContext,useEffect,useState,useCallback,useMemo,useRef} from 'react';
import {supabase,configured} from './lib/supabase';
import {readCache,writeCache} from './lib/cache';
import {notify} from './lib/dialog';
const Ctx=createContext(null),KEY='listings:v1';
export const useApp=()=>useContext(Ctx);
export function AppProvider({children}){
 const [listings,setListings]=useState([]),[user,setUser]=useState(null),[role,setRole]=useState('user'),[favs,setFavs]=useState(()=>new Set()),[loading,setLoading]=useState(true),[error,setError]=useState(null);
 const uid=useRef(null);
 const reload=useCallback(async()=>{
  const {data,error:err}=await supabase.from('listings').select('*').order('created_at',{ascending:false});
  if(err)setError(err.message);
  else{setError(null);setListings(data||[]);writeCache(KEY,(data||[]).filter(l=>l.status==='published'))}// drafts never cached
  setLoading(false)},[]);
 const loadUser=useCallback(async u=>{uid.current=u?.id??null;setUser(u);
  if(!u){setRole('user');setFavs(new Set());return}
  const [p,f]=await Promise.all([supabase.from('profiles').select('role').eq('id',u.id).maybeSingle(),supabase.from('favorites').select('listing_id')]);
  setRole(p.data?.role||'user');setFavs(new Set((f.data||[]).map(r=>r.listing_id)))},[]);
 useEffect(()=>{
  if(!configured){setLoading(false);return}
  readCache(KEY).then(c=>{if(c?.length){setListings(p=>p.length?p:c);setLoading(false)}});// instant start
  const {data:sub}=supabase.auth.onAuthStateChange((event,s)=>{
   if(!['INITIAL_SESSION','SIGNED_IN','SIGNED_OUT'].includes(event))return;// ignore token refresh / user update
   if(event==='SIGNED_IN'&&s?.user?.id===uid.current)return;// web re-emits SIGNED_IN on tab focus
   setTimeout(()=>Promise.all([loadUser(s?.user??null),reload()]),0)});
  return()=>sub.subscription.unsubscribe()},[loadUser,reload]);
 // Live updates: when admin edits a listing, every open app refreshes itself (needs migration_02.sql).
 useEffect(()=>{if(!configured)return;let t;
  const ch=supabase.channel('listings-live').on('postgres_changes',{event:'*',schema:'public',table:'listings'},()=>{clearTimeout(t);t=setTimeout(reload,800)}).subscribe();
  return()=>{clearTimeout(t);supabase.removeChannel(ch)}},[reload]);
 // Optimistic: star flips instantly, rolls back if the server says no.
 const toggleFav=useCallback(async id=>{if(!user)return false;const had=favs.has(id);
  const apply=on=>setFavs(p=>{const n=new Set(p);on?n.add(id):n.delete(id);return n});
  apply(!had);
  const {error:e}=had?await supabase.from('favorites').delete().eq('listing_id',id):await supabase.from('favorites').insert({listing_id:id});
  if(e){apply(had);notify('Could not update Saved','Please try again.')}
  return true},[user,favs]);
 const published=useMemo(()=>listings.filter(l=>l.status==='published'),[listings]);
 const value=useMemo(()=>({listings,published,user,role,favs,reload,toggleFav,loading,error}),[listings,published,user,role,favs,reload,toggleFav,loading,error]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>}
