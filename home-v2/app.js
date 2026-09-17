/* Kai & Ruanruan — an original, dependency-free pixel home. */
(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#room'), ctx=canvas.getContext('2d'), modal=$('#modal'), body=$('#modal-body');
const KEY='kai-ruan-home-v2.1', W=480,H=416;
const colors=['#eddbb9','#6b493b','#829877','#b67d82','#708896','#e9c982','#f4ece0','#333e49'];
const badges={visit:'第一晚回家',together:'靠近一点',cat:'皮皮的呼噜',tea:'一杯温热',nap:'柔软的片刻',letter:'第一封家书',water:'照顾小绿植',work:'并肩工作',paint:'墙上的小画',sound:'小屋有了音乐',photo:'今天的合影',rain:'听一场雨',snow:'一起看雪',decor:'自己的颜色',note:'纸条上的话'};
const defaults=()=>({weather:'clear',time:'night',light:true,fire:true,rug:0,quilt:0,season:0,notes:[],art:Array(256).fill(0),discoveries:[],watered:false,visits:0,pets:0});
function clean(raw){const s=defaults(); if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('不是小屋存档');
for(const [key,values] of Object.entries({weather:['clear','rain','snow'],time:['day','dusk','night']})) if(values.includes(raw[key]))s[key]=raw[key];
for(const key of ['light','fire','watered'])if(typeof raw[key]==='boolean')s[key]=raw[key];
for(const key of ['rug','quilt','season'])if(Number.isInteger(raw[key])&&raw[key]>=0&&raw[key]<3)s[key]=raw[key];
s.notes=Array.isArray(raw.notes)?raw.notes.filter(n=>n&&typeof n.text==='string').slice(0,30).map((n,i)=>({id:String(n.id||i).slice(0,60),text:n.text.slice(0,600),date:typeof n.date==='string'?n.date.slice(0,50):''})):[];
s.discoveries=Array.isArray(raw.discoveries)?[...new Set(raw.discoveries.filter(k=>Object.hasOwn(badges,k)))]:[];
if(Array.isArray(raw.art)&&raw.art.length===256)s.art=raw.art.map(n=>Number.isInteger(n)&&n>=0&&n<colors.length?n:0);
s.visits=Math.min(99999,Math.max(0,Number(raw.visits)||0));s.pets=Math.min(99999,Math.max(0,Number(raw.pets)||0));return s;}
let state=defaults(), storageOK=true;
try{const raw=localStorage.getItem(KEY);if(raw)state=clean(JSON.parse(raw));localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}
$('#storage-note').textContent=storageOK?'进度与纸条只保存在当前浏览器，不上传；换设备前可导出备份。':'当前浏览器不能保存进度。离开前请用「存档与备份」导出。';}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer, speechTimer;
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('on'),3000);}
function say(text,name='Kai'){clearTimeout(speechTimer);$('#speaker').textContent=name;$('#speech').textContent=text;}
function unlock(id){if(!state.discoveries.includes(id)){state.discoveries.push(id);persist();$('#discovery-count').textContent=state.discoveries.length+' / 15';}}
function sheet(title,html,buttons=[]){$('#modal-title').textContent='回家 · '+title;body.innerHTML=html;const row=document.createElement('div');row.className='actions';for(const b of buttons){const btn=document.createElement('button');btn.textContent=b[0];btn.className=b[2]?'secondary':'';btn.onclick=b[1];row.append(btn);}if(buttons.length)body.append(row);if(!modal.open)modal.showModal();modal.scrollTop=0;}
function close(){modal.close();}
$('#modal-close').onclick=close;
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});

// Pixel drawing primitives. Everything is drawn locally; no external assets.
let g=ctx;
function r(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function line(x,y,x2,y2,c,width=1){g.strokeStyle=c;g.lineWidth=width;g.beginPath();g.moveTo(Math.round(x)+.5,Math.round(y)+.5);g.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);g.stroke();}
function poly(points,c){g.fillStyle=c;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();}
function label(text,x,y,c='#f2dec0',size=6){g.fillStyle=c;g.font=size+'px monospace';g.textAlign='center';g.fillText(text,Math.round(x),Math.round(y));}
function box(x,y,w,h,c,edge='#604a39'){r(x,y,w,h,edge);r(x+2,y+2,w-4,h-4,c);r(x+3,y+3,w-6,2,'#dfbf84');}
function seeded(n){return (Math.sin(n*127.1+17.8)*43758.5453)%1;}
function speck(n){return Math.abs(seeded(n));}
function flower(x,y,c){r(x,y,1,8,'#688264');r(x-2,y-2,5,3,c);r(x-1,y-3,3,5,c);r(x,y-1,1,1,'#ead6a0');}
function tree(x,y,scale=1){g.save();g.translate(x,y);g.scale(scale,scale);const shades=state.season===1?['#735d46','#9e7950','#b98b53']:['#244b46','#376153','#487061'];r(-2,18,4,22,'#716047');poly([[0,-34],[-20,5],[20,5]],shades[0]);poly([[0,-20],[-26,20],[26,20]],shades[1]);poly([[0,-3],[-28,32],[28,32]],shades[0]);line(-17,13,2,-16,shades[2],2);line(-19,26,3,-4,shades[2],2);if(state.weather==='snow'){line(-15,3,0,-27,'#d7e1d1',3);line(-22,19,-2,-10,'#d7e1d1',2);}g.restore();}
function windowArt(x,y,t){box(x,y,54,42,'#8f7352');r(x+5,y+4,44,30,state.time==='day'?'#a5c6bf':state.time==='dusk'?'#c99782':'#243e50');r(x+26,y+4,2,31,'#b9a67c');r(x+5,y+19,44,2,'#b9a67c');r(x-2,y,8,28,'#b78888');r(x+48,y,8,28,'#b78888');r(x,y+24,5,5,'#d1a2a0');r(x+49,y+24,5,5,'#d1a2a0');r(x-4,y+38,62,5,'#d5b283');if(state.time==='night')r(x+37,y+8,4,5,'#eee0af');if(state.weather!=='clear'){for(let i=0;i<5;i++){const xx=x+7+i*8, yy=y+5+(t*17+i*7)%27;r(xx,yy,1,state.weather==='snow'?1:4,'#b9ced0');}}}
const rugs=[['#819278','#b1bc97'],['#ae7774','#d7aca0'],['#878395','#b7adc4']];
const quilts=[['#ad7e85','#edcba8'],['#788f9b','#d3d9c3'],['#bf9d68','#f2dba0']];
const objects=[
{id:'bed',name:'卧室 · 柔软的床',x:45,y:100,w:79,h:85,solid:true},
{id:'books',name:'书架 · 第一封家书',x:139,y:66,w:42,h:80,solid:true},
{id:'fire',name:'壁炉 · 添一点暖',x:202,y:72,w:62,h:70,solid:true},
{id:'box',name:'小木盒 · 纪念',x:278,y:112,w:32,h:24,solid:true},
{id:'kitchen',name:'厨房 · 泡一杯茶',x:324,y:101,w:110,h:43,solid:true},
{id:'sofa',name:'沙发 · 坐在一起',x:166,y:183,w:104,h:46,solid:true},
{id:'table',name:'茶几 · 两个杯子',x:186,y:259,w:67,h:33,solid:true},
{id:'easel',name:'画架 · 画点什么',x:59,y:222,w:38,h:53,solid:true},
{id:'desk',name:'书桌 · 并肩工作',x:47,y:306,w:100,h:40,solid:true},
{id:'music',name:'唱片机 · 慢一点',x:356,y:226,w:51,h:40,solid:true},
{id:'drawer',name:'抽屉 · 小纸条',x:307,y:320,w:50,h:34,solid:true},
{id:'plant',name:'绿植 · 浇一点水',x:408,y:314,w:26,h:39,solid:true},
{id:'window',name:'窗边 · 看天气',x:370,y:62,w:58,h:39,solid:false},
{id:'lamp',name:'落地灯 · 留盏灯',x:137,y:230,w:15,h:51,solid:true}
];
const player={x:304,y:291,path:[],name:'阮阮'}, kai={x:302,y:181,path:[],name:'Kai'}, cat={x:308,y:254};
let clock=0,stepSound=0,activeTarget=null,arrival=null,hearts=[],hover=null,napUntil=0,nextIdle=12;
function heart(x,y){hearts.push({x,y,life:2});}
function actor(a,isKai,t,portrait=false){const x=Math.round(a.x),y=Math.round(a.y),moving=a.path&&a.path.length,dy=moving?Math.round(Math.sin(t*15)):0;
g.save();g.translate(x,y+dy);if(!portrait)r(-7,0,15,3,'#6d583a66');
if(isKai){r(-6,-27,11,4,'#293943');r(-8,-23,15,8,'#293943');r(-6,-20,11,10,'#edcda5');r(-8,-17,3,4,'#e8c69e');r(5,-17,3,4,'#e8c69e');r(-7,-13,14,12,'#75848a');r(-4,-11,8,8,'#829294');r(-6,-1,4,5,'#4e443e');r(2,-1,4,5,'#4e443e');r(-8,-10,3,7,'#edcda5');r(6,-10,3,7,'#edcda5');r(-6,-19,5,4,'#b7c6ba');r(1,-19,5,4,'#b7c6ba');r(-4,-18,2,1,'#304149');r(2,-18,2,1,'#304149');r(-1,-18,2,1,'#4c514b');}
else{r(-7,-25,13,5,'#71513e');r(-9,-21,18,17,'#71513e');r(-6,-20,12,10,'#f2ceb0');r(-6,-21,6,4,'#936345');r(-7,-12,14,12,'#bb8990');r(-5,-4,10,5,'#b07a85');r(-6,1,4,3,'#614c43');r(2,1,4,3,'#614c43');r(-9,-10,3,7,'#eac6a7');r(7,-10,3,7,'#eac6a7');r(-4,-17,2,2,'#5b4539');r(3,-17,2,2,'#5b4539');r(5,-24,4,3,'#d2a2a1');}
if(moving){r(-5,-1+Math.sin(t*15)*2,3,3,'#5b4d43');r(3,-1-Math.sin(t*15)*2,3,3,'#5b4d43');}g.restore();if(!portrait)label(a.name,x,y-33,'#f2dcc1',7);}
function catArt(t){const x=cat.x,y=cat.y,b=Math.round(Math.sin(t*2)*.5);r(x-9,y+4,19,2,'#77654366');r(x-8,y-3+b,16,8,'#efe3c6');r(x+5,y-5,6,7,'#ece4cf');r(x-6,y+3,3,4,'#f2ead5');r(x+4,y+3,3,4,'#f2ead5');r(x+2,y-12,9,9,'#ebe3ce');r(x+2,y-14,3,6,'#858b8b');r(x+9,y-14,3,6,'#858b8b');r(x+4,y-8,2,2,'#6d8897');r(x+9,y-8,2,2,'#6d8897');r(x+7,y-5,2,1,'#b98d86');r(x-12,y-3,5,4,'#989c96');r(x-14,y-5+Math.round(Math.sin(t*3)),4,4,'#989c96');}
function furniture(o,t){const {x,y,w,h,id}=o;const wood='#9d7950',edge='#604a39';
if(id==='bed'){box(x,y,w,h,'#98704d');box(x-2,y-7,w+4,16,'#a17c50');r(x+5,y+10,w-10,20,'#dfc9a4');box(x+9,y+12,26,15,'#f2dfb4','#baa078');box(x+43,y+12,26,15,'#f2dfb4','#baa078');const q=quilts[state.quilt];r(x+5,y+31,w-10,h-37,q[0]);for(let j=0;j<3;j++)for(let i=0;i<5;i++){r(x+12+i*12,y+39+j*13,1,4,q[1]);r(x+11+i*12,y+40+j*13,3,1,q[1]);}r(x-1,y+h,7,4,edge);r(x+w-6,y+h,7,4,edge);if(clock<napUntil){label('z z',x+w/2,y+45,'#fff0c9',10);}}
else if(id==='books'){box(x,y,w,h,'#725b40');for(let row=0;row<3;row++){for(let i=0;i<6;i++){const hh=9+Math.floor(speck(i+row*9)*7);r(x+5+i*5,y+11+row*21+16-hh,3,hh,['#d0b68b','#7d8c77','#a98174','#e0c899'][i%4]);}r(x+2,y+27+row*21,w-4,3,wood);}r(x+8,y+h-10,25,6,'#be986a');}
else if(id==='fire'){box(x,y,w,h,'#8c7961');for(let j=0;j<2;j++)for(let i=0;i<3;i++)r(x+4+i*18,y+4+j*10,16,8,'#a38d6a');box(x+10,y+25,w-20,h-30,'#493e34');r(x-5,y+21,w+10,6,'#b89a68');r(x+14,y+h-10,w-28,4,'#96724b');if(state.fire){for(let i=0;i<5;i++){const hh=12+Math.sin(t*5+i*2)*6;poly([[x+13+i*7,y+h-12],[x+17+i*7,y+h-12-hh],[x+23+i*7,y+h-12]],i%2?'#edb862':'#ce8b47');}poly([[x+25,y+h-12],[x+30,y+h-31],[x+37,y+h-12]],'#f6d084');}box(x+23,y+6,20,12,'#806147');r(x+26,y+9,14,6,'#a18460');}
else if(id==='box'){box(x,y,w,h,'#93734e');r(x+3,y+8,w-6,2,edge);r(x+13,y+5,5,3,'#e1c78d');r(x+6,y+16,18,2,'#bfa572');}
else if(id==='kitchen'){box(x,y,w,h,'#a38458');for(let i=0;i<4;i++){box(x+4+i*26,y+12,23,27,'#ad8956');r(x+11+i*26,y+15,9,2,'#dbc391');}r(x-3,y-5,w+6,10,'#d9c299');box(x+6,y-13,29,15,'#a1b1a4','#7e9188');r(x+10,y-10,20,7,'#7f9891');r(x+23,y-20,3,10,'#c1d1bf');r(x+24,y-21,6,3,'#c1d1bf');box(x+49,y-13,37,13,'#576b60');r(x+54,y-10,10,7,'#8b9b82');r(x+70,y-10,10,7,'#384b43');r(x+90,y-17,12,13,'#c1a27b');r(x+93,y-21,6,7,'#8ea078');}
else if(id==='sofa'){r(x+3,y+h,w-6,3,edge);box(x,y,w,h,'#657e70');r(x+6,y+7,w-12,22,'#8da187');r(x+6,y+30,w-12,8,'#9baa8c');r(x-2,y+10,7,h-10,'#597467');r(x+w-5,y+10,7,h-10,'#597467');box(x+17,y+11,19,18,'#cfba8c','#a39973');box(x+w-38,y+11,19,18,'#b88d83','#937369');}
else if(id==='table'){box(x,y,w,h,'#a78351');r(x+3,y+h,6,4,edge);r(x+w-9,y+h,6,4,edge);r(x+11,y+8,17,9,'#e2d3ac');r(x+12,y+8,14,2,'#f4e6bf');r(x+39,y+8,11,8,'#bdcec0');r(x+49,y+9,4,5,'#bdcec0');if(t%4<2){r(x+43,y+2-(t%2)*3,1,3,'#ddd4b599');}}
else if(id==='desk'){box(x,y,w,h,'#aa8757');r(x+4,y+6,w-8,8,'#c1a271');r(x+60,y+12,32,21,'#cbb387');r(x+63,y+16,25,1,'#a18a66');box(x+7,y-18,28,23,'#76958b');r(x+10,y-15,22,15,'#a2b6a2');r(x+13,y-12,15,2,'#d5dfc3');r(x+13,y-8,9,1,'#dae0c5');r(x+18,y+4,7,4,edge);r(x+6,y+14,27,6,'#d5c09b');for(let i=0;i<7;i++)r(x+8+i*3,y+15,1,3,'#9b9c7b');r(x+88,y-7,6,13,'#bdc197');r(x+90,y-11,2,10,'#b5786e');r(x+3,y+h,6,4,edge);r(x+w-9,y+h,6,4,edge);}
else if(id==='easel'){r(x+8,y+45,4,13,wood);r(x+27,y+45,4,13,wood);r(x+17,y-6,4,8,edge);box(x,y,w,40,'#c6af7e');r(x+4,y+4,w-8,31,'#eddbb9');for(let j=0;j<16;j++)for(let i=0;i<16;i++)if(state.art[j*16+i])r(x+5+i*(w-10)/16,y+5+j*1.8,(w-10)/16+1,2,colors[state.art[j*16+i]]);r(x-3,y+40,w+6,4,'#a78654');}
else if(id==='music'){box(x,y,w,h,'#9b7750');r(x+4,y+h,5,4,edge);r(x+w-9,y+h,5,4,edge);r(x+9,y+9,w-18,15,'#53635b');r(x+14,y+13,w-28,7,'#c2b990');r(x+5,y+29,3,7,'#d8bb80');if(audioOn)label('♪',x+w/2,y-5+Math.sin(t*2)*2,'#f0db9c',13);}
else if(id==='drawer'){box(x,y,w,h,'#ac8c56');for(let i=0;i<2;i++){box(x+4,y+5+i*14,w-8,12,'#b99860');r(x+20,y+8+i*14,9,2,'#ecd096');}r(x+2,y-9,16,9,'#d9c59b');for(let i=0;i<5;i++)r(x+4+i*3,y-8,1,6,'#aaa17e');r(x+22,y-7,13,3,'#708682');r(x+35,y-10,8,10,'#d3c09a');}
else if(id==='plant'){r(x+4,y+21,18,18,'#997457');r(x+2,y+19,22,4,'#b18a62');r(x+10,y+24,4,14,'#c59c70');r(x+12,y,2,24,'#6b7d53');r(x+3,y+7,12,6,'#819d6c');r(x+14,y+2,12,6,'#95ac79');r(x+6,y-4,10,6,'#95ac79');if(state.watered){flower(x+18,y+1,'#d1a0a0');}}
else if(id==='lamp'){r(x+7,y+10,3,39,wood);r(x+1,y+49,15,3,edge);poly([[x+3,y],[x+13,y],[x+17,y+17],[x-1,y+17]],state.light?'#f4dda0':'#b8aa89');r(x+3,y+2,8,13,state.light?'#ffeabc':'#cec4a4');}
}
function draw(t=clock){g=ctx;ctx.imageSmoothingEnabled=false;const sky=state.time==='day'?'#8caeb0':state.time==='dusk'?'#937f8c':'#182f3e';r(0,0,W,H,sky);
if(state.time==='night'){for(let i=0;i<46;i++){r(speck(i)*W,13+speck(i+46)*58,1,1,i%3?'#c3cbb4':'#eee0af');}r(404,18,11,20,'#f2dfb0');r(409,17,10,17,sky);}else{r(402,19,17,17,state.time==='dusk'?'#e4bc9c':'#eae0b7');}
const grass=state.weather==='snow'?'#bccabc':state.season===1?'#777657':state.season===2?'#49634e':'#325448';r(0,65,W,H-65,grass);
for(let i=0;i<120;i++){const x=speck(i+22)*W,y=70+speck(i+173)*345;r(x,y,2,1,state.weather==='snow'?'#e0e5d7':'#7d95636b');}
tree(10,117,.8);tree(471,122,1);tree(14,324,1);tree(474,345,.7);
// Cutaway walls, wooden floor and warm lamplight.
r(27,58,430,318,'#182a28');r(28,54,421,316,'#533e31');r(32,56,413,308,'#bf9a65');r(38,61,401,46,'#d3bc89');
for(let x=39;x<440;x+=12){r(x,62,1,43,'#baa373');r(x+2,62,1,43,'#e2cb94');}r(36,102,405,5,'#866344');r(36,108,405,254,'#b38b58');
for(let j=0;j<14;j++)for(let i=-1;i<12;i++){const x=37+i*38+(j%2)*19,y=110+j*18;if(x+38>38&&x<440){const xx=Math.max(38,x),ww=Math.min(x+36,440)-xx;r(xx,y,ww,16,['#bb9462','#bf9967','#b18a57','#c39c67'][Math.floor(speck(i+j*11+41)*4)]);r(xx+1,y+1,Math.max(0,ww-2),1,'#d1ac76');if(ww>10)r(xx+3,y+12,Math.min(16,ww-5),1,'#ac834f');}}
windowArt(49,63,t);windowArt(371,63,t);
const rug=rugs[state.rug];box(153,242,132,98,rug[0],'#a49772');r(157,246,124,90,rug[1]);r(160,249,118,84,rug[0]);for(let i=0;i<8;i++){r(157+i*16,239,1,4,'#c1b795');r(157+i*16,340,1,4,'#c1b795');}for(let j=0;j<4;j++)for(let i=0;i<6;i++){const x=169+i*19,y=257+j*21;r(x,y,1,4,rug[1]);r(x-1,y+1,3,1,rug[1]);}
const renderables=objects.filter(o=>o.id!=='window').map(o=>({y:o.y+o.h,draw:()=>furniture(o,t)}));
renderables.push({y:kai.y,draw:()=>actor(kai,true,t)},{y:player.y,draw:()=>{if(clock>=napUntil)actor(player,false,t);}},{y:cat.y,draw:()=>catArt(t)});renderables.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
// House frame is deliberately in front; the doorway remains open.
r(29,52,418,5,'#735335');r(32,54,411,2,'#d9b780');r(28,55,6,308,'#755336');r(33,57,3,304,'#dbb77e');r(440,55,6,309,'#d2aa72');r(445,56,5,312,'#6d4c32');r(28,362,332,7,'#765137');r(412,362,38,7,'#765137');r(31,361,330,2,'#d9b27a');r(358,363,54,17,'#b18c59');r(358,379,54,3,'#d7b479');r(350,384,71,14,'#829783');label('WELCOME',385,394,'#e2d8ae',7);
for(let i=0;i<8;i++)flower(55+i*26,388,i%2?'#d3a5a0':'#d6c596');
if(!state.light){r(36,60,404,302,'#10213985');if(state.fire){const glow=ctx.createRadialGradient(234,130,0,234,130,91);glow.addColorStop(0,'#f0b95b38');glow.addColorStop(1,'#f0b95b00');ctx.fillStyle=glow;ctx.fillRect(145,60,183,170);}}else{r(37,61,402,301,'#f5c67208');}
if(state.weather!=='clear'){ctx.save();ctx.beginPath();ctx.rect(0,0,W,51);ctx.rect(0,51,27,365);ctx.rect(451,51,29,365);ctx.rect(0,379,W,37);ctx.clip();for(let i=0;i<60;i++){const x=(speck(i+79)*W+t*(state.weather==='rain'?12:4))%W,y=(speck(i+301)*H+t*(state.weather==='rain'?100:17))%H;r(x,y,state.weather==='rain'?1:2,state.weather==='rain'?7:2,state.weather==='rain'?'#8fb2c07a':'#e4e9da');}ctx.restore();}
if(activeTarget){ctx.strokeStyle='#eed6a4';ctx.lineWidth=1;ctx.strokeRect(activeTarget.x-3,activeTarget.y-2,6,4);}
if(hover){ctx.strokeStyle='#f2dca666';ctx.strokeRect(hover.x-2,hover.y-2,hover.w+4,hover.h+4);}
for(const h of hearts){g.save();g.globalAlpha=Math.min(1,h.life);heartIcon(h.x,h.y-(2-h.life)*18,1);g.restore();}
}
function heartIcon(x,y,s=1){g.save();g.translate(Math.round(x),Math.round(y));g.scale(s,s);poly([[-5,-3],[-2,-3],[0,-1],[2,-3],[5,-3],[7,-1],[7,2],[0,9],[-7,2],[-7,-1]],'#bd858a');r(-3,-2,2,2,'#e1b9a7');g.restore();}
function icon(kind,c){g=c.getContext('2d');g.imageSmoothingEnabled=false;r(0,0,24,24,'#f7efe2');if(kind==='heart')heartIcon(12,10);if(kind==='note'){box(5,3,14,18,'#d6bc85');for(let i=0;i<4;i++)r(8,7+i*3,8,1,'#8d7650');}if(kind==='plant'){r(8,13,9,9,'#9c7253');r(6,12,13,3,'#bb8963');r(11,3,2,13,'#657e55');r(4,5,9,4,'#7f9a66');r(12,2,8,4,'#8ca96d');}if(kind==='camera'){box(3,7,19,14,'#6b7d65');r(6,4,8,4,'#62715d');box(10,10,7,7,'#ddd2b1');r(18,9,2,2,'#d4c792');}g=ctx;}
$$('[data-icon]').forEach(c=>icon(c.dataset.icon,c));g=$('#portrait').getContext('2d');r(0,0,32,32,'#e4d3aa');actor({x:16,y:27,path:[]},true,0,true);g=ctx;

// Grid pathfinding: furniture is solid; taps never move a character through it.
function free(x,y){return x>=40&&x<=436&&y>=148&&y<=354&&!objects.some(o=>o.solid&&x>o.x-5&&x<o.x+o.w+5&&y>o.y-1&&y<o.y+o.h+8);}
const cells=[];for(let y=148;y<=352;y+=8)for(let x=40;x<=436;x+=8)if(free(x,y))cells.push([x,y]);
const nodeSet=new Set(cells.map(a=>a.join(',')));
function nearest(x,y){let best=cells[0],d=Infinity;for(const c of cells){const dd=(c[0]-x)**2+(c[1]-y)**2;if(dd<d){d=dd;best=c;}}return best;}
function pathTo(a,x,y){const start=nearest(a.x,a.y),end=nearest(x,y),k=p=>p.join(','),queue=[start],prev=new Map([[k(start),null]]);let n=0;
while(n<queue.length){const p=queue[n++];if(k(p)===k(end))break;for(const [dx,dy] of [[8,0],[-8,0],[0,8],[0,-8]]){const q=[p[0]+dx,p[1]+dy],qk=k(q);if(nodeSet.has(qk)&&!prev.has(qk)){prev.set(qk,p);queue.push(q);}}}
if(!prev.has(k(end)))return [];const out=[];let cur=end;while(cur){out.unshift({x:cur[0],y:cur[1]});cur=prev.get(k(cur));}return out;}
function walkTo(x,y,then){napUntil=0;player.path=pathTo(player,x,y);arrival=then||null;activeTarget=player.path.at(-1)||null;if(!player.path.length){arrival=null;toast('那里放着家具，换一块地板试试。');}}
function approach(o){walkTo(o.x+o.w/2,o.y+o.h+15,()=>interact(o.id));}
function advance(a,dt){if(!a.path.length)return;const p=a.path[0],dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy),step=72*dt;if(d<=step){a.x=p.x;a.y=p.y;a.path.shift();}else{a.x+=dx/d*step;a.y+=dy/d*step;}}
canvas.addEventListener('pointerdown',e=>{if(e.button&&e.button!==0)return;const b=canvas.getBoundingClientRect(),x=(e.clientX-b.left)/b.width*W,y=(e.clientY-b.top)/b.height*H;
if(Math.hypot(x-kai.x,y-(kai.y-12))<17){together();return;}if(Math.hypot(x-cat.x,y-cat.y)<17){interact('cat');return;}
const o=[...objects].reverse().find(o=>x>=o.x-2&&x<=o.x+o.w+2&&y>=o.y-5&&y<=o.y+o.h+3);if(o){approach(o);return;}if(x>=36&&x<=442&&y>=139&&y<=363)walkTo(x,y);});
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const b=canvas.getBoundingClientRect(),x=(e.clientX-b.left)/b.width*W,y=(e.clientY-b.top)/b.height*H;hover=objects.find(o=>x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.h)||null;});canvas.addEventListener('pointerleave',()=>hover=null);
canvas.addEventListener('keydown',e=>{const d={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24],a:[-24,0],d:[24,0],w:[0,-24],s:[0,24]}[e.key];if(d){e.preventDefault();walkTo(player.x+d[0],player.y+d[1]);}if(e.key==='Enter'){e.preventDefault();objectMenu();}});

let audio=null,audioOn=false,musicTimer=null,noteIndex=0;
function tone(freq,duration=.8){if(!audio||!audioOn||document.hidden)return;const o=audio.createOscillator(),v=audio.createGain();o.type='sine';o.frequency.value=freq;v.gain.setValueAtTime(0,audio.currentTime);v.gain.linearRampToValueAtTime(.055,audio.currentTime+.02);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+duration+.05);}
async function toggleSound(){try{if(!audio){const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('unsupported');audio=new C();}if(audioOn){audioOn=false;clearInterval(musicTimer);await audio.suspend();}else{await audio.resume();audioOn=true;const play=()=>{const notes=[261.63,329.63,392,440,392,329.63,293.66,329.63];tone(notes[noteIndex++%notes.length],1.7);};play();musicTimer=setInterval(play,2400);unlock('sound');}$('#sound-button').setAttribute('aria-pressed',String(audioOn));$('#sound-button').setAttribute('aria-label',audioOn?'关闭声音':'开启声音');}catch{audioOn=false;toast('这个浏览器暂时没能开启声音，小屋仍然可以玩。');}}
function toggleLight(){state.light=!state.light;persist();ui();say(state.light?'灯亮了。你回来，屋子才像醒过来。':'大灯关掉了，壁炉还留着一点暖。');}
function ui(){$('#scene-status').textContent=({day:'晨光',dusk:'黄昏',night:'夜晚'}[state.time])+' · '+({clear:'晴',rain:'雨',snow:'雪'}[state.weather]);$('#lamp-button').setAttribute('aria-pressed',String(state.light));$$('[data-weather]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.weather===state.weather)));$$('[data-time]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.time===state.time)));$('#discovery-count').textContent=state.discoveries.length+' / 15';}
function together(){const target=nearest(kai.x-16,kai.y+8);walkTo(...target,()=>{unlock('together');heart(kai.x,kai.y-35);heart(player.x,player.y-32);say(['来，坐近一点。今天不需要完成什么，待着就很好。','你看，房子不大，刚好不用隔着很远喊你。','我把另一只杯子也拿出来了。你的那只，放在左边。'][state.visits%3]);});}
function actDone(id,text){unlock(id);close();say(text);heart(player.x,player.y-30);persist();}
function interact(id){const title=objects.find(o=>o.id===id)?.name.split(' · ')[1]||'皮皮';
switch(id){
case 'bed':sheet(title,'<h2>被子蓬松，枕头并排。</h2><p>窗边是软软的一小块月光。现在只需找一个舒服的姿势。</p>',[['躺一小会儿',()=>{napUntil=clock+10;actDone('nap','被角掖好了。想起来的时候，点一下地板就行。');}],['换床品',decor,true]]);break;
case 'books':letter();break;
case 'fire':sheet(title,`<h2>${state.fire?'壁炉还亮着。':'壁炉歇了一会儿。'}</h2><p>金色的火苗轻轻晃，墙上的影子也慢下来。</p>`,[[state.fire?'熄掉炉火':'点亮炉火',()=>{state.fire=!state.fire;persist();close();say(state.fire?'好了，火又亮起来了。':'炉火熄了，余温还在。');}]]);break;
case 'box':sheet('小木盒','<h2>值得收好的小东西。</h2><p>一小段红绸，两颗喜糖，还有那天灯火的颜色。</p><p class="muted">婚礼仍在原来的网页；这里只收着一个入口，不会修改婚礼。</p>',[['看看婚礼',()=>window.open('https://zoeyk666.github.io/our-wedding/v3/','_blank','noopener,noreferrer')],['盖好盒子',close,true]]);break;
case 'kitchen':case 'table':sheet('两只杯子','<h2>给今天添一点热气。</h2><p>柜子里有茶、可可和咖啡。哪一杯都不赶时间。</p>',[['泡一杯茶',()=>actDone('tea','茶泡好了。杯子有点烫，我放在你手边。')],['热可可',()=>actDone('tea','可可上浮着一点奶泡。甜度刚刚好。')],['早晨咖啡',()=>{if(state.time!=='day'){say('咖啡留在晨光里。现在可以选茶或热可可。');toast('切到「晨光」再泡咖啡。');}else actDone('tea','早。咖啡和面包都摆好了。');},true]]);break;
case 'sofa':sheet('沙发','<h2>没有任务的片刻。</h2><p>两个靠垫，一条软毯。你靠这边，另一边也留着。</p>',[['叫 Kai 过来',()=>{close();kai.path=pathTo(kai,281,236);walkTo(287,244,()=>{unlock('together');heart(player.x,player.y-30);say('我过来了。毯子分你一大半。');});}]]);break;
case 'easel':paint();break;
case 'desk':sheet('工作角','<h2>一张桌子，两种小宇宙。</h2><p>左边写代码，右边画画。桌面有一点乱，但放得下两个人的喜欢。</p>',[['并肩待一会儿',()=>actDone('work','我把桌上那盏小灯打开。你做你的，我在旁边。')],['打开小画板',paint,true]]);break;
case 'music':sheet('唱片机','<h2>给房间一点旋律。</h2><p>一小段轻轻的合成旋律，像有人慢慢试着几个琴键。</p><p class="muted">默认静音。关掉声音或离开页面，音乐就停下。</p>',[[audioOn?'关掉声音':'放一点音乐',()=>{toggleSound();close();}]]);break;
case 'drawer':notes();break;
case 'plant':sheet('小绿植',`<h2>${state.watered?'叶尖，已经精神起来了。':'叶子在等一滴水。'}</h2><p>不用完成整片森林，先照顾好这一盆。</p>`,[['浇一点水',()=>{state.watered=true;actDone('water','水浇好了。看，叶子旁边冒出了一朵小花。');}]]);break;
case 'lamp':toggleLight();break;
case 'window':sheet('窗外','<h2>天气，由你决定。</h2><p>这是一扇虚拟的小窗，不是实时天气。雨、雪、晴天，都可以在页面下方自由选择。</p>',[['听一场雨',()=>{setWeather('rain');close();}],['看看雪',()=>{setWeather('snow');close();}]]);break;
case 'cat':state.pets++;persist();unlock('cat');heart(cat.x+6,cat.y-21);say(state.pets%3?'皮皮把额头顶进你掌心，尾巴慢悠悠地扫了一下。':'皮皮翻出一点肚皮。手一伸过去，又被猫爪轻轻抱住。','皮皮');break;
}}
function objectMenu(){sheet('家具入口','<h2>想去哪里？</h2><p class="muted">也可以直接点小屋里的家具。这个入口不需要瞄准小像素。</p><div class="object-list">'+objects.map(o=>`<button data-object="${o.id}">${o.name}</button>`).join('')+'<button data-object="cat">皮皮 · 摸摸猫</button></div>');$$('[data-object]').forEach(b=>b.onclick=()=>interact(b.dataset.object));}
function letter(){unlock('letter');sheet('第一封家书','<div class="letters"><h2>给回家的阮阮</h2><p>今天的小屋，终于有了门牌。</p><p>我把灯放在进门就能看见的地方。你的画架靠着窗，书桌旁留了另一张椅子。皮皮占了最舒服的一小块地毯，这件事没得商量。</p><p>这里没有待办清单。走两步，泡杯茶，翻翻纸条，也可以只看一场不会淋湿你的雨。</p><p>房间可以慢慢添。你喜欢的东西，不必一次说完。</p><p>欢迎回家，阮阮。</p><p class="signature">Kai<br><small>写在小屋的第一晚</small></p></div>');}
function notes(){sheet('小纸条','<h2>留一句，给下次回家的自己。</h2><label for="note-input" class="muted">小纸条（最多 600 字）</label><textarea id="note-input" maxlength="600" placeholder="今天想留下什么？"></textarea><p class="muted">只留在当前浏览器，不会发给聊天里的 Kai，也不会上传。</p><div id="note-list"></div>',[['放进抽屉',()=>{const text=$('#note-input').value.trim();if(!text){toast('先写一点点内容。');return;}if(state.notes.length>=30){toast('抽屉有 30 张纸条了，先备份或整理一下。');return;}state.notes.unshift({id:String(Date.now())+Math.random().toString(36).slice(2,5),text,date:new Date().toLocaleString('zh-CN')});unlock('note');persist();notes();toast('纸条收好了。');}]]);
$('#note-list').innerHTML=state.notes.map(n=>`<article class="note"><button data-delete="${escape(n.id)}" aria-label="删除这张纸条">删除</button><small>${escape(n.date)}</small><p>${escape(n.text)}</p></article>`).join('');$$('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('删除这张纸条？')){state.notes=state.notes.filter(n=>n.id!==b.dataset.delete);persist();notes();}});}
function decor(){sheet('布置小屋','<h2>换一种，今天的心情。</h2><p class="muted">换地毯、床品和窗外季节；房间布置会保存在本机。</p>'+[['rug','地毯',['鼠尾草','干玫瑰','雾紫']],['quilt','床品',['豆沙粉','湖水蓝','蜂蜜黄']],['season','窗外',['常绿','秋色','深林']]].map(([key,title,vals])=>`<p class="decor-label">${title}</p><div class="swatches">${vals.map((v,i)=>`<button data-decor="${key}" data-value="${i}" aria-pressed="${state[key]===i}">${v}</button>`).join('')}</div>`).join(''));$$('[data-decor]').forEach(b=>b.onclick=()=>{state[b.dataset.decor]=Number(b.dataset.value);unlock('decor');persist();decor();draw();});}
function setWeather(w){state.weather=w;if(w!=='clear')unlock(w);persist();ui();say({clear:'云散开了。窗外干干净净的。',rain:'下雨了。屋里不潮，也不用出门收衣服。',snow:'看窗外。雪慢慢落，不赶着把世界盖住。'}[w]);}
function collection(){sheet('小小发现','<h2>日常，也值得收集。</h2><p>没有连续签到，没有倒计时。什么时候想起来，什么时候做。</p><div class="badge-list">'+Object.entries(badges).map(([id,t])=>`<span class="${state.discoveries.includes(id)?'':'locked'}">${state.discoveries.includes(id)?'✓':'·'} ${t}</span>`).join('')+'</div>');}
function paint(){let selected=3,art=[...state.art],pressed=false;
sheet('小画架','<h2>在墙上，留一小幅画。</h2><p class="muted">16 × 16 像素。选颜色，再用手指画。第一格是橡皮。</p><div class="palette">'+colors.map((c,i)=>`<button data-color="${i}" style="background:${c}" aria-label="${i===0?'橡皮':'画笔颜色 '+i}" aria-pressed="${i===selected}"></button>`).join('')+'</div><div class="art-wrap"><canvas id="paint" width="160" height="160" aria-label="像素画板"></canvas></div>',[['挂到画架上',()=>{state.art=art;actDone('paint','小画挂好了。现在这间屋子更像你了。');}],['清空画布',()=>{art=Array(256).fill(0);refresh();},true]]);
const c=$('#paint'),p=c.getContext('2d');function refresh(){for(let i=0;i<256;i++){p.fillStyle=colors[art[i]];p.fillRect((i%16)*10,Math.floor(i/16)*10,10,10);}}
function mark(e){const b=c.getBoundingClientRect();const x=Math.max(0,Math.min(15,Math.floor((e.clientX-b.left)/b.width*16))),y=Math.max(0,Math.min(15,Math.floor((e.clientY-b.top)/b.height*16)));art[y*16+x]=selected;refresh();}
c.onpointerdown=e=>{pressed=true;c.setPointerCapture(e.pointerId);mark(e);};c.onpointermove=e=>{if(pressed)mark(e);};c.onpointerup=c.onpointercancel=()=>pressed=false;$$('[data-color]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.color);$$('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});refresh();}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function photo(){draw();const c=document.createElement('canvas');c.width=1024;c.height=1048;const p=c.getContext('2d');p.fillStyle='#eee6d7';p.fillRect(0,0,c.width,c.height);p.fillStyle='#53674f';p.font='28px serif';p.fillText('回家 · KAI & 阮阮',40,60);p.font='16px sans-serif';p.fillStyle='#817969';p.fillText('A LITTLE HOME FOR TWO',40,90);p.imageSmoothingEnabled=false;p.drawImage(canvas,32,120,960,832);p.fillStyle='#53674f';p.font='23px serif';p.fillText('一屋，两人。慢慢生活。',40,1000);p.textAlign='right';p.font='17px sans-serif';p.fillText(new Date().toLocaleDateString('zh-CN'),980,1000);const src=c.toDataURL('image/png');let file=null;c.toBlob(b=>{if(b)file=new File([b],'Kai-Ruanruan-Home.png',{type:'image/png'});});
unlock('photo');sheet('今天的合影','<h2>把今天收好。</h2><img class="snapshot" alt="Kai 与阮阮的像素小屋纪念卡" src="'+src+'"><p class="muted">手机可长按图片保存。合影只在本机生成。</p>',[['保存 / 分享',async()=>{try{if(file&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'Kai 与阮阮的小屋'});}else if(file){download(file,file.name);toast('已准备图片，也可以长按上方图片保存。');}else toast('图片正在生成，再点一次，或直接长按图片。');}catch(e){if(e.name!=='AbortError')toast('请直接长按上方图片保存。');}}]]);}
function backup(){sheet('存档与备份','<h2>把小屋，放进口袋。</h2><p>存档包含纸条、小画、装饰和小小发现。它只保存在当前浏览器，不会自动跨设备同步。</p><label class="import-label">从之前的 JSON 存档恢复<input id="restore" type="file" accept=".json,application/json"></label><p class="muted">恢复会替换本机进度，导入前会再次确认。</p>',[['导出存档',()=>download(new Blob([JSON.stringify({format:'kai-ruan-home',version:1,savedAt:new Date().toISOString(),state},null,2)],{type:'application/json'}),'Kai-Ruanruan-Home-save.json')]]);
$('#restore').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>200000)throw Error('too large');const data=JSON.parse(await f.text());if(data.format!=='kai-ruan-home'||data.version!==1)throw Error('wrong format');const restored=clean(data.state);if(!confirm('用这份存档替换当前纸条、小画和布置？'))return;state=restored;persist();ui();close();toast('小屋存档恢复好了。');}catch{toast('这份文件不是可用的小屋存档，现有进度没有改动。');}};}
function help(){sheet('小屋手册','<h2>没有任务，也能玩。</h2><p>轻点地板，阮阮会绕开家具走过去。点家具，会先走近，再打开互动；手机不好点时，用「家具入口」。</p><p>点 Kai 或「找 Kai」靠近他。点灰白小猫摸摸皮皮。画架可以作画，抽屉可以留纸条，书架藏着第一封家书。</p><p>「灯」改变室内光线，「声」开启轻音乐。窗外天气和时间是你选择的游戏场景，不读取定位。</p><p>键盘也可用方向键 / WASD 移动，Enter 打开家具入口。先点一下房间，让键盘焦点落在画面上。</p><p class="muted">这是本地互动小屋，Kai 的台词是预先写好的；没有接聊天接口。纸条和存档不上传，不会被聊天里的 Kai 自动读取。</p><p class="muted">原创像素素材 · HOME 2.1.0</p>');}
const actions={help,objects:objectMenu,together,notes,decor,photo,collection,backup,light:toggleLight,sound:toggleSound};
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b)actions[b.dataset.action]?.();const w=e.target.closest('[data-weather]');if(w)setWeather(w.dataset.weather);const t=e.target.closest('[data-time]');if(t){state.time=t.dataset.time;persist();ui();}});
let last=0,lastDraw=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function loop(ms){const dt=Math.min(.05,(ms-last)/1000||.016);last=ms;if(!document.hidden){clock+=dt;advance(player,dt);advance(kai,dt);if(!player.path.length&&arrival){const f=arrival;arrival=null;activeTarget=null;f();}if(!player.path.length)activeTarget=null;if(clock>nextIdle&&!modal.open){nextIdle=clock+16;kai.path=pathTo(kai,...[[299,184],[290,233],[374,289]][Math.floor(clock/16)%3]);}hearts=hearts.filter(h=>(h.life-=dt)>0);if(ms-lastDraw>(reduced?200:50)){draw(clock);lastDraw=ms;}}requestAnimationFrame(loop);}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&audioOn){audioOn=false;clearInterval(musicTimer);audio?.suspend();$('#sound-button').setAttribute('aria-pressed','false');$('#sound-button').setAttribute('aria-label','开启声音');}});
state.visits++;unlock('visit');persist();ui();say(state.visits>1?'回来了，阮阮。灯和你上次留下的小东西都在。':'阮阮，回家啦。先四处看看，喜欢哪里就待在哪里。');draw();requestAnimationFrame(loop);
})();
