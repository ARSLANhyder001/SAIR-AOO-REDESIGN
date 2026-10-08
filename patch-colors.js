// Bache hue purane lal rang naye palette se badalta hai. Ek hi baar chalayein: node patch-colors.js
const fs=require('fs');
const edit=(f,pairs)=>{let s=fs.readFileSync(f,'utf8');for(const [a,b] of pairs){if(!s.includes(a)&&!s.includes(b))throw new Error(f+': not found: '+a);s=s.split(a).join(b)}fs.writeFileSync(f,s);console.log('ok',f)};
edit('App.js',[["rgba(212,20,30,.45)","rgba(148,209,190,.45)"]]);
edit('src/screens/HomeScreen.js',[["#9d0d15","#2a7360"],["rgba(10,3,5,0.9)","rgba(42,47,43,0.9)"]]);
edit('src/components/ui.js',[["rgba(22,24,29,.85)","rgba(59,65,60,.9)"],["item.hue??350","item.hue??165"],["#b3121b","#2a7360"],["#8a0d14","#1f5748"]]);
