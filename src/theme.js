import React,{createContext,useContext,useEffect,useMemo,useState,useCallback} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {IMAGE_TRANSFORMS} from './config';
// Palette: #ffffff, #3b413c, #9db5b2, #daf0ee, #94d1be. Dark + Light palettes. Colours yahan badlo, poori app follow karegi.
// Screens mein `const C=useC()` se current palette milti hai (system mode ya Menu mein chuna hua mode).
const LIGHT={dark:false,bg:'#f0f8f7',card:'#ffffff',line:'#b9cfcb',red:'#2a7360',red2:'#2a7360',tx:'#3b413c',mute:'#5d6a65',soft:'#eef6f5',skel:'#daf0ee',tint:'#daf0ee',mint:'#94d1be',
 tabBg:'#ffffff',hero:['#daf0ee','#e8f5f3','#f0f8f7'],glass:['#ffffff','#f3faf8'],tileG:['#ffffff','#eaf6f4'],btnG:['#34876f','#2a7360'],
 mark:['#3b413c','#9db5b2'],scrim:'rgba(59,65,60,0.55)',
 shadow:{shadowColor:'#3b413c',shadowOpacity:0.1,shadowRadius:12,shadowOffset:{width:0,height:4},elevation:3},
 glow:{shadowColor:'#2a7360',shadowOpacity:0.25,shadowRadius:10,shadowOffset:{width:0,height:4},elevation:4}};
const DARK={dark:true,bg:'#2a2f2b',card:'#3b413c',line:'rgba(255,255,255,0.14)',red:'#3a8f78',red2:'#94d1be',tx:'#f2f8f7',mute:'#a9bdb9',soft:'rgba(255,255,255,0.07)',skel:'#434a45',tint:'rgba(148,209,190,0.16)',mint:'#94d1be',
 tabBg:'#2f3531',hero:['#3f5750','#2f3935','#2a2f2b'],glass:['rgba(255,255,255,0.12)','rgba(47,53,49,0.9)'],tileG:['rgba(255,255,255,0.08)','rgba(42,47,43,0.9)'],btnG:['#3a8f78','#2a7360'],
 mark:['#ffffff','#9db5b2'],scrim:'rgba(0,0,0,0.6)',
 shadow:{shadowColor:'#000000',shadowOpacity:0.3,shadowRadius:12,shadowOffset:{width:0,height:0},elevation:6},
 glow:{shadowColor:'#94d1be',shadowOpacity:0.35,shadowRadius:14,shadowOffset:{width:0,height:0},elevation:8}};
export const C=LIGHT; // purana import chalta rahe; naye code mein useC() use karein
const Ctx=createContext({C:LIGHT,dark:false,mode:'system',setMode:()=>{}});
export function ThemeProvider({children}){
 const sys=useColorScheme(),[mode,setM]=useState('light');
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