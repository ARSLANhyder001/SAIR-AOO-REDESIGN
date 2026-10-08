import React,{createContext,useContext,useEffect,useMemo,useState,useCallback} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {IMAGE_TRANSFORMS} from './config';
// Dark + Light palettes. Colours yahan badlo, poori app follow karegi.
// Screens mein `const C=useC()` se current palette milti hai (system mode ya Menu mein chuna hua mode).
const LIGHT={dark:false,bg:'#f6f4f4',card:'#ffffff',line:'#e7e1e2',red:'#b3121b',red2:'#c8141f',tx:'#16181d',mute:'#6a6166',soft:'#f1eded',skel:'#e9e3e4',tint:'#fdecee',
 tabBg:'#ffffff',hero:['#fbe3e5','#f9eff0','#f6f4f4'],glass:['#ffffff','#fff4f4'],tileG:['#ffffff','#fbf1f1'],btnG:['#d4141e','#a30f17'],
 mark:['#3a3f4b','#8b909c'],scrim:'rgba(0,0,0,0.55)',
 shadow:{shadowColor:'#2a0a0d',shadowOpacity:0.1,shadowRadius:12,shadowOffset:{width:0,height:4},elevation:3},
 glow:{shadowColor:'#b3121b',shadowOpacity:0.28,shadowRadius:10,shadowOffset:{width:0,height:4},elevation:4}};
const DARK={dark:true,bg:'#0a0305',card:'#16090c',line:'rgba(255,255,255,0.13)',red:'#d4141e',red2:'#ff3340',tx:'#ffffff',mute:'#b9aeb0',soft:'rgba(255,255,255,0.07)',skel:'#241216',tint:'rgba(212,20,30,0.18)',
 tabBg:'#12060a',hero:['#4a0a10','#1a0508','#0a0305'],glass:['rgba(255,255,255,0.14)','rgba(60,6,10,0.85)'],tileG:['rgba(255,255,255,0.09)','rgba(40,4,8,0.85)'],btnG:['#c4141e','#7a0a10'],
 mark:['#ffffff','#9a9a9a'],scrim:'rgba(0,0,0,0.6)',
 shadow:{shadowColor:'#d4141e',shadowOpacity:0.3,shadowRadius:12,shadowOffset:{width:0,height:0},elevation:6},
 glow:{shadowColor:'#d4141e',shadowOpacity:0.55,shadowRadius:14,shadowOffset:{width:0,height:0},elevation:8}};
export const C=LIGHT; // purana import chalta rahe; naye code mein useC() use karein
const Ctx=createContext({C:LIGHT,dark:false,mode:'system',setMode:()=>{}});
export function ThemeProvider({children}){
 const sys=useColorScheme(),[mode,setM]=useState('system');
 useEffect(()=>{AsyncStorage.getItem('theme:v1').then(v=>{if(v==='light'||v==='dark'||v==='system')setM(v)}).catch(()=>{})},[]);
 const setMode=useCallback(m=>{setM(m);AsyncStorage.setItem('theme:v1',m).catch(()=>{})},[]);
 const dark=mode==='system'?sys==='dark':mode==='dark';
 const value=useMemo(()=>({C:dark?DARK:LIGHT,dark,mode,setMode}),[dark,mode,setMode]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>}
export const useTheme=()=>useContext(Ctx);
export const useC=()=>useContext(Ctx).C;
export const fmt=p=>p?`PKR ${Number(p).toLocaleString('en-PK')}`:'';
// Pakistani style: 2.5 Crore / 85 Lakh (cards), full number on the detail page.
export const fmtShort=p=>{const n=Number(p);if(!n)return '';
 if(n>=1e7)return `PKR ${+(n/1e7).toFixed(2)} Crore`;if(n>=1e5)return `PKR ${+(n/1e5).toFixed(2)} Lakh`;return fmt(n)};
export const AREA={marla:'Marla',kanal:'Kanal',sqft:'sq ft',sqyd:'sq yd'};
export const priceText=(x,short)=>{const n=Number(x?.price);if(!n)return '';const p=short?fmtShort(n):fmt(n);return x.purpose==='rent'?`${p}/mo`:p};
export const facts=x=>[x?.bedrooms!=null&&`${x.bedrooms} bed`,x?.bathrooms!=null&&`${x.bathrooms} bath`,x?.area_size&&`${+x.area_size} ${AREA[x.area_unit]||''}`.trim()].filter(Boolean);
export const cover=x=>x?.images?.[0]||x?.image_url||null;
export const isNew=x=>!!x?.created_at&&Date.now()-new Date(x.created_at).getTime()<7*864e5;
export const sized=(u,w)=>IMAGE_TRANSFORMS&&u?.includes('/storage/v1/object/public/')
 ?`${u.replace('/object/public/','/render/image/public/')}?width=${w}&quality=70`:u;
