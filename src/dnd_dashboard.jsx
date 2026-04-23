import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend, Area, AreaChart, ReferenceLine } from "recharts";
import { AlertTriangle, TrendingUp, TrendingDown, Anchor, Ship, Clock, DollarSign, Package, Target, Zap, Layers, Calendar, Activity, MapPin, Truck, Box, AlertCircle, X, ChevronDown, HelpCircle, ArrowRight, Download } from "lucide-react";

// ═══ DATA ═══
const BASE={
  summary:{totalContainers:2671,completed:341,inProgress:2186,cancelled:39},
  stages:{gateOutEmpty_actual:1768,gateInPOL_actual:1778,loadPOL_actual:1653,dischargePOD_actual:800,gateOutPOD_actual:653,emptyReturn_actual:352,total:2670},
  stageIncurred:{gateOutEmpty:142,gateInPOL:118,loadPOL:87,dischargePOD:203,gateOutPOD:167,emptyReturn:94},
  stageDays:{origin_detention:{avg:4.8},origin_demurrage:{avg:0.87},dest_demurrage:{avg:2.6},dest_detention:{avg:5.51},ocean_transit:{avg:44.87},storage_origin:{avg:1.2},storage_dest:{avg:0.9},combined_origin:{avg:5.67},combined_dest:{avg:8.11}},
  missingMilestones:{gateOutEmpty:816,gateInPOL:787,loadPOL:910,dischargePOD:1751,gateOutPOD:1895,emptyReturn:2186},
  freeTimeHealth:{red:35,yellow:24,green:205,expired:3780},
  costMatrix:{detention_origin:{total:49169,withCost:261,avgFP:5.1},detention_destination:{total:1955,withCost:8,avgFP:6.0},demurrage_origin:{total:22353,withCost:52,avgFP:3.1},demurrage_destination:{total:5144,withCost:12,avgFP:3.0},storage_origin:{total:3075,withCost:23,avgFP:3.1},storage_destination:{total:1295,withCost:9,avgFP:3.0},dnd_origin:{total:99565,withCost:212,avgFP:9.9},dnd_destination:{total:1814,withCost:4,avgFP:12.0},demurrageStorage_origin:{total:8420,withCost:31,avgFP:4.2},demurrageStorage_destination:{total:2190,withCost:7,avgFP:4.0},detentionDemurrage_origin:{total:34610,withCost:87,avgFP:7.8},detentionDemurrage_destination:{total:3280,withCost:11,avgFP:8.5},detentionDemurrageStorage_origin:{total:18740,withCost:44,avgFP:11.2},detentionDemurrageStorage_destination:{total:890,withCost:3,avgFP:13.0}},
  mom:{prevTotal:168420,currTotal:184370,prevOrigin:159800,currOrigin:174162,prevDest:8620,currDest:10208},
  carriers:{OOLU:{containers:288,avgODet:9.86,avgODem:0.97,avgDDem:2.78,avgDDet:5.81,missingMilestones:813},ONEY:{containers:905,avgODet:2.37,avgODem:0.87,avgDDem:2.66,avgDDet:5.48,missingMilestones:3106},MSCU:{containers:227,avgODet:5.98,avgODem:1.01,avgDDem:2.55,avgDDet:5.59,missingMilestones:642},MAEU:{containers:229,avgODet:7.77,avgODem:1.0,avgDDem:3.22,avgDDet:5.86,missingMilestones:744},HLCU:{containers:427,avgODet:5.62,avgODem:0.74,avgDDem:2.39,avgDDet:5.23,missingMilestones:1301},EGLV:{containers:139,avgODet:2.09,avgODem:0.43,avgDDem:1.38,avgDDet:4.82,missingMilestones:375},COSU:{containers:141,avgODet:0.73,avgODem:0.82,avgDDem:2.82,avgDDet:5.74,missingMilestones:451},CMDU:{containers:279,avgODet:6.35,avgODem:1.0,avgDDem:2.79,avgDDet:5.81,missingMilestones:815}},
  topLanes:[
    {lane:"DEHAM-CNSHA",containers:34,avgODet:2.52,avgODem:0.94,avgDDem:3.12,avgDDet:5.46,freightPct:72,surchargePct:28},
    {lane:"DEHAM-CNYTN",containers:28,avgODet:7.85,avgODem:0.71,avgDDem:2.07,avgDDet:5.27,freightPct:65,surchargePct:35},
    {lane:"CNSHA-SGSIN",containers:26,avgODet:3.91,avgODem:0.31,avgDDem:0.84,avgDDet:4.34,freightPct:80,surchargePct:20},
    {lane:"DEBRV-CNSHA",containers:24,avgODet:5.5,avgODem:0.83,avgDDem:3.06,avgDDet:6.04,freightPct:68,surchargePct:32},
    {lane:"CNSHA-NLRTM",containers:23,avgODet:12.33,avgODem:0.77,avgDDem:1.96,avgDDet:4.89,freightPct:55,surchargePct:45},
    {lane:"DEHAM-CNTAO",containers:22,avgODet:8.59,avgODem:0.49,avgDDem:1.47,avgDDet:5.46,freightPct:62,surchargePct:38},
    {lane:"DEBRV-USCHS",containers:21,avgODet:4.41,avgODem:1.37,avgDDem:3.73,avgDDet:6.59,freightPct:60,surchargePct:40},
    {lane:"DEBRV-TWKEL",containers:19,avgODet:11.64,avgODem:0.8,avgDDem:2.81,avgDDet:5.67,freightPct:58,surchargePct:42},
    {lane:"DEHAM-THLCH",containers:19,avgODet:7.9,avgODem:1.52,avgDDem:4.09,avgDDet:6.87,freightPct:56,surchargePct:44},
    {lane:"DEHAM-JPNGO",containers:18,avgODet:8.95,avgODem:0.81,avgDDem:2.37,avgDDet:4.58,freightPct:70,surchargePct:30}],
  monthlyCost:[
    {month:"Apr 25",detention:5665,demurrage:0,storage:1300,combined:4820,total:11785,oDetention:5200,oDemurrage:0,oStorage:1100,oCombined:4400,dDetention:465,dDemurrage:0,dStorage:200,dCombined:420,containers:150},
    {month:"May 25",detention:27128,demurrage:13115,storage:2235,combined:57146,total:99624,oDetention:25800,oDemurrage:12400,oStorage:1900,oCombined:54200,dDetention:1328,dDemurrage:715,dStorage:335,dCombined:2946,containers:890},
    {month:"Jun 25",detention:18331,demurrage:13365,storage:2135,combined:38479,total:72310,oDetention:17100,oDemurrage:12600,oStorage:1800,oCombined:36200,dDetention:1231,dDemurrage:765,dStorage:335,dCombined:2279,containers:620},
    {month:"Jul 25",detention:0,demurrage:1017,storage:0,combined:934,total:1951,oDetention:0,oDemurrage:800,oStorage:0,oCombined:700,dDetention:0,dDemurrage:217,dStorage:0,dCombined:234,containers:45}],
  grandTotal:184370,totalOriginCost:174162,totalDestCost:10208,
};
const CDATA={topRisk:[
  {cn:"HLCU_021020",ca:"HLCU",po:"DEWVN",pd:"CNTAO",oDet:11.1,risk:80,cat:"Detention",cost:726,cost3d:1476,cost7d:2976,stage:"Gate In POL"},
  {cn:"COSU_120720",ca:"COSU",po:"DEBRV",pd:"PHMNN",oDet:51.2,risk:80,cat:"Combined D&D",cost:2737,cost3d:4237,cost7d:6737,stage:"Load POL"},
  {cn:"OOLU_131020",ca:"OOLU",po:"CNSHA",pd:"BEZEE",oDet:9.9,risk:77,cat:"Demurrage",cost:687,cost3d:1707,cost7d:3387,stage:"Gate In POL"},
  {cn:"ONEY_150920",ca:"ONEY",po:"DEHAM",pd:"ILASH",oDet:99.0,risk:77,cat:"Detention",cost:5117,cost3d:6887,cost7d:10247,stage:"Ocean Transit"},
  {cn:"HLCU_221020",ca:"HLCU",po:"DEBRV",pd:"USORF",oDet:10.0,risk:77,cat:"Detention",cost:631,cost3d:1381,cost7d:2631,stage:"Gate In POL"},
  {cn:"MAEU_170620",ca:"MAEU",po:"DEBRV",pd:"USEWR",oDet:83.8,risk:76,cat:"Combined D&D",cost:4374,cost3d:5994,cost7d:9234,stage:"Ocean Transit"},
  {cn:"MAEU_150620",ca:"MAEU",po:"DEBRV",pd:"DZALG",oDet:79.7,risk:75,cat:"Combined D&D",cost:4187,cost3d:5807,cost7d:8867,stage:"Discharge POD"},
  {cn:"CMDU_191020",ca:"CMDU",po:"DEWVN",pd:"DZORN",oDet:10.5,risk:75,cat:"Storage",cost:709,cost3d:1729,cost7d:3389,stage:"Gate In POL"},
  {cn:"MSCU_080620",ca:"MSCU",po:"DEHAM",pd:"BHBAH",oDet:46.8,risk:74,cat:"Detention",cost:2438,cost3d:3788,cost7d:6038,stage:"Ocean Transit"},
  {cn:"ONEY_021120",ca:"ONEY",po:"DEBRV",pd:"CNJMN",oDet:9.8,risk:74,cat:"Demurrage",cost:624,cost3d:1374,cost7d:2624,stage:"Gate Out POD"}
]};
const COST_CATS=[{name:"Detention",oKey:"detention_origin",dKey:"detention_destination",color:"#D97706"},{name:"Demurrage",oKey:"demurrage_origin",dKey:"demurrage_destination",color:"#7C3AED"},{name:"Storage",oKey:"storage_origin",dKey:"storage_destination",color:"#059669"},{name:"Combined D&D",oKey:"dnd_origin",dKey:"dnd_destination",color:"#EF4444"}];

// ═══ THEME ═══
const T={bg:"#F8F9FC",page:"#ffffff",card:"#ffffff",card2:"#F8F9FC",border:"#E8ECF1",text:"#1A1D26",sub:"#5E6578",dim:"#98A1B3",amber:"#C27815",amberBg:"#FFF8EE",purple:"#6D5ACE",purpleBg:"#F5F3FF",green:"#0D9668",greenBg:"#EEFBF4",red:"#DC3545",redBg:"#FFF0F1",blue:"#2563EB",blueL:"#4F8FEE",blueBg:"#EEF4FF",cyan:"#0E7F96",actionBg:"#F5F8FF",warmBg:"#FFFCF0",intBg:"#F0F5FF"};
const fmt=n=>n>=1e6?"$"+(n/1e6).toFixed(2)+"M":n>=1e3?"$"+(n/1e3).toFixed(1)+"K":"$"+Math.round(n);
const momPct=(c,p)=>{const v=p>0?Math.round((c-p)/p*100):0;return{v,color:v>0?T.red:v<0?T.green:T.sub,arrow:v>0?"↑":v<0?"↓":"→"};};
const catColor=c=>c==="Detention"?T.amber:c==="Demurrage"?T.purple:c==="Storage"?T.green:T.red;
const inferReason=c=>c.oDet>50?"Extended origin dwell — review carrier equipment return":c.oDet>10?"Origin depot delay — likely documentation or scheduling":c.stage==="Gate Out POD"?"Destination clearance — check customs or truck availability":c.stage==="Discharge POD"?"Destination port dwell — check customs status":"Within normal parameters";

// ═══ SHARED UI (Upgraded) ═══
const SolidBadge=({children,color=T.red})=><span style={{background:color,color:"#fff",padding:"3px 11px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap",boxShadow:"0 1px 3px "+color+"30"}}>{children}</span>;
const Badge=({children,color=T.blue})=><span style={{background:color+"12",color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>;
const BigPill=({children,color})=><span style={{background:color+"10",color,padding:"6px 14px",borderRadius:20,fontSize:11,fontWeight:500,whiteSpace:"nowrap",lineHeight:1.3}}>{children}</span>;
const Pill=({active,onClick,children,color=T.blue})=><button onClick={onClick} style={{padding:"6px 16px",borderRadius:20,border:"1px solid "+(active?color+"50":T.border),background:active?color+"10":"transparent",color:active?color:T.sub,fontSize:11,fontWeight:active?600:400,cursor:"pointer",transition:"all .15s ease"}}>{children}</button>;
function Card({children,style,onClick,urgency}){const bg=urgency==="critical"?"#FFF0F1":urgency==="warn"?"#FFF8EE":urgency==="action"?T.actionBg:T.card;const bTop=urgency==="critical"?T.red:urgency==="warn"?T.amber:null;return <div onClick={onClick} style={{background:bg,border:bTop?"none":"1px solid "+T.border+"80",borderRadius:14,padding:20,cursor:onClick?"pointer":"default",boxShadow:bTop?"0 2px 12px rgba(0,0,0,.06)":"0 1px 4px rgba(0,0,0,.03), 0 1px 2px rgba(0,0,0,.02)",borderTop:bTop?"3px solid "+bTop:undefined,transition:"all .2s ease",...style}}>{children}</div>;}
function HoverTip({text}){const[s,setS]=useState(false);return <span onMouseEnter={()=>setS(true)} onMouseLeave={()=>setS(false)} style={{position:"relative",cursor:"help",display:"inline-flex",marginLeft:3}}><HelpCircle size={11} color={T.dim}/>{s&&<div style={{position:"absolute",bottom:20,left:-100,width:280,background:T.text,color:"#fff",padding:"8px 12px",borderRadius:8,fontSize:11,lineHeight:1.5,zIndex:99,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>{text}<div style={{position:"absolute",bottom:-4,left:104,width:8,height:8,background:T.text,transform:"rotate(45deg)"}}/></div>}</span>;}
const SH=({title,sub})=><div style={{marginBottom:18}}><div style={{color:T.text,fontSize:15,fontWeight:700}}>{title}</div>{sub&&<div style={{color:T.sub,fontSize:11,marginTop:2}}>{sub}</div>}</div>;
const Insight=({text})=><div style={{background:T.blueBg,borderRadius:10,padding:"12px 16px",marginTop:10,borderLeft:"3px solid "+T.blue+"90"}}><div style={{fontSize:12,fontWeight:500,color:"#1E40AF",lineHeight:1.5}}>{text}</div></div>;
const NavLink=({text,onClick})=><div onClick={onClick} style={{fontSize:12,color:T.blue,fontWeight:500,cursor:"pointer",marginTop:10,display:"flex",alignItems:"center",gap:5,padding:"6px 0",opacity:.85}}>{text}<ArrowRight size={11}/></div>;
function ChartBox({title,sub,children,h=260,insight,nav}){return <Card style={{padding:20}}>{title&&<div style={{color:T.text,fontSize:13,fontWeight:600}}>{title}</div>}{sub&&<div style={{color:T.sub,fontSize:11,marginBottom:8}}>{sub}</div>}<div style={{height:h}}>{children}</div>{insight&&<Insight text={insight}/>}{nav}</Card>;}
const CTip=({active,payload,label})=>{if(!active||!payload)return null;return <div style={{background:"#fff",border:"none",borderRadius:10,padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,.08)"}}><div style={{fontSize:11,fontWeight:700,marginBottom:4}}>{label}</div>{payload.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.sub}}><div style={{width:6,height:6,borderRadius:"50%",background:p.color}}/>{p.name}: <span style={{fontWeight:700,color:T.text}}>{typeof p.value==="number"?p.value.toLocaleString():p.value}</span></div>)}</div>;};

// ═══ NAV (with notification dots) ═══
const NAV=[{id:"home",label:"Command Center",icon:Activity,dot:true},{id:"costs",label:"Cost Overview",icon:DollarSign},{id:"carriers",label:"Carrier Intel",icon:Ship},{id:"optimizer",label:"Cost Optimizer",icon:Target,dot:true},{id:"history",label:"Historical",icon:Calendar},{id:"surcharges",label:"Surcharges",icon:Layers}];
function TopNav({page,setPage}){return <div style={{background:"#fff",borderBottom:"1px solid "+T.border,padding:"12px 28px",display:"flex",alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}><div style={{display:"flex",alignItems:"center",gap:16,width:"100%"}}><div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1A1D26,#2563EB)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Anchor size={18} color="#fff"/></div><div style={{flexShrink:0}}><div style={{fontWeight:700,fontSize:18,color:T.text,letterSpacing:"-0.3px"}}>D&D Intelligence Hub</div><div style={{fontSize:10,color:T.dim,fontWeight:400}}>Last updated: 3 min ago</div></div><div style={{width:1,height:28,background:T.border,margin:"0 10px",flexShrink:0}}/><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{NAV.map(n=>{const I=n.icon;const a=page===n.id;return <button key={n.id} onClick={()=>setPage(n.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,border:"none",background:a?"#1A1D26":"transparent",color:a?"#fff":T.sub,fontSize:11,fontWeight:a?600:500,cursor:"pointer",whiteSpace:"nowrap",position:"relative",transition:"all .15s ease"}}><I size={13}/>{n.label}{n.dot&&!a&&<div style={{position:"absolute",top:4,right:4,width:6,height:6,borderRadius:"50%",background:T.red,boxShadow:"0 0 0 2px #fff"}}/>}</button>;})}</div></div></div>;}

// ═══ MODULE 1: COMMAND CENTER ═══
function HomePage({setPage}){
  const cm=BASE.costMatrix;const fth=BASE.freeTimeHealth;const sd=BASE.stageDays;const st=BASE.stages;
  const mom=momPct(BASE.mom.currTotal,BASE.mom.prevTotal);
  const storagePct=Math.round((cm.storage_origin.total+cm.storage_destination.total)/BASE.grandTotal*100);
  const originPct=Math.round(BASE.totalOriginCost/BASE.grandTotal*100);
  const topBurn=CDATA.topRisk.slice(0,5).reduce((s,c)=>s+Math.round((c.cost3d-c.cost)/3),0);
  const totalMissing=Object.values(BASE.missingMilestones).reduce((a,b)=>a+b,0);
  const milestonePct=Math.round((1-totalMissing/(BASE.summary.totalContainers*6))*100);

  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    {/* HERO ROW: Main metric + Alert panel */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16,marginBottom:12}}>
      <Card style={{padding:"16px 20px"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:12}}><span style={{fontSize:28,fontWeight:700,color:T.text,letterSpacing:"-0.5px"}}>{fmt(BASE.grandTotal)}</span><span style={{fontSize:12,fontWeight:600,color:mom.color}}>{mom.arrow} {Math.abs(mom.v)}% MoM</span></div>
        <div style={{fontSize:10,color:T.sub,marginTop:2}}>Total D&D Exposure</div>
        <div style={{display:"flex",gap:16,marginTop:10}}>
          {[{l:"Origin",v:fmt(BASE.totalOriginCost),s:originPct+"% of total",c:T.amber},{l:"Destination",v:fmt(BASE.totalDestCost),s:(100-originPct)+"% of total",c:T.purple},{l:"Storage",v:fmt(cm.storage_origin.total+cm.storage_destination.total),s:storagePct+"% of total",c:T.green}].map(k=><div key={k.l} style={{borderLeft:"3px solid "+k.c,paddingLeft:8}}><div style={{fontSize:14,fontWeight:600,color:T.text}}>{k.v}</div><div style={{fontSize:10,color:T.sub}}>{k.l} | {k.s}</div></div>)}
          <div style={{borderLeft:"3px solid "+T.blue,paddingLeft:8}}><div style={{fontSize:14,fontWeight:600,color:T.text}}>{BASE.summary.inProgress.toLocaleString()}</div><div style={{fontSize:10,color:T.sub}}>Active | {BASE.summary.totalContainers.toLocaleString()} total</div></div>
        </div>
      </Card>
      <Card style={{padding:"16px 18px",display:"flex",flexDirection:"column",justifyContent:"center",borderTop:"3px solid "+T.red,background:"#fff"}}>
        <div style={{fontSize:24,fontWeight:800,color:T.red}}>{fth.red} critical</div>
        <div style={{fontSize:11,color:T.sub}}>{fth.yellow} monitor | {fth.expired.toLocaleString()} expired</div>
        <div style={{fontSize:13,fontWeight:700,color:T.red,marginTop:6}}>{"Est. daily burn: "+fmt(topBurn)+"/day"}</div>
        <div onClick={()=>document.getElementById("actionTable")&&document.getElementById("actionTable").scrollIntoView({behavior:"smooth"})} style={{fontSize:10,color:T.blueL,fontWeight:600,cursor:"pointer",marginTop:6}}>{"See Action List ↓"}</div>
      </Card>
    </div>

    {/* NARRATIVE BANNER */}
    <div style={{background:T.blueBg,borderRadius:12,padding:"14px 20px",marginBottom:18,borderLeft:"3px solid "+T.blue+"80"}}>
      <div style={{fontSize:12,color:"#1E40AF",fontWeight:500,lineHeight:1.5}}>{fth.red+" containers breaching free time today, adding ~"+fmt(topBurn)+"/day. "+originPct+"% of your "+fmt(BASE.grandTotal)+" exposure is at origin. Scroll down to see which containers need action."}</div>
    </div>
    <div style={{height:1,background:T.border+"40",margin:"6px 0 14px"}}/>
    {/* JOURNEY */}
    <Card style={{padding:18,marginBottom:18,background:"#FEFCE808"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div><div style={{fontSize:14,fontWeight:600}}>Container D&D Cost Journey</div><div style={{fontSize:9,color:T.sub}}>Where in the lifecycle are costs accumulating? Focus on stages with highest "missing" counts — these are your data blind spots.</div></div>
        <Badge color={T.cyan}>{"Milestone completeness: "+milestonePct+"%"}</Badge>
      </div>
      {[{label:"ORIGIN",bg:T.amberBg,lc:T.amber,nodes:[
          {label:"Gate Out Empty",sub:"Depot",icon:Box,color:T.amber,actual:st.gateOutEmpty_actual,missing:BASE.missingMilestones.gateOutEmpty,incurred:BASE.stageIncurred.gateOutEmpty},
          {label:"Gate In POL",sub:"Port",icon:MapPin,color:T.amber,actual:st.gateInPOL_actual,missing:BASE.missingMilestones.gateInPOL,incurred:BASE.stageIncurred.gateInPOL},
          {label:"Load POL",sub:"Vessel",icon:Ship,color:T.purple,actual:st.loadPOL_actual,missing:BASE.missingMilestones.loadPOL,incurred:BASE.stageIncurred.loadPOL}],
        metrics:[{t:"Detention",dw:sd.origin_detention.avg,fp:cm.detention_origin.avgFP,cost:cm.detention_origin.total,n:cm.detention_origin.withCost,c:T.amber},{t:"Demurrage",dw:sd.origin_demurrage.avg,fp:cm.demurrage_origin.avgFP,cost:cm.demurrage_origin.total,n:cm.demurrage_origin.withCost,c:T.purple},{t:"Storage",dw:sd.storage_origin.avg,fp:cm.storage_origin.avgFP,cost:cm.storage_origin.total,n:cm.storage_origin.withCost,c:T.green},{t:"Combined",dw:sd.combined_origin.avg,fp:cm.dnd_origin.avgFP,cost:cm.dnd_origin.total,n:cm.dnd_origin.withCost,c:T.red}]},
        {label:"DESTINATION",bg:T.purpleBg,lc:T.purple,nodes:[
          {label:"Discharge POD",sub:"Arrived",icon:Anchor,color:T.purple,actual:st.dischargePOD_actual,missing:BASE.missingMilestones.dischargePOD,incurred:BASE.stageIncurred.dischargePOD},
          {label:"Gate Out POD",sub:"Left Port",icon:Truck,color:T.purple,actual:st.gateOutPOD_actual,missing:BASE.missingMilestones.gateOutPOD,incurred:BASE.stageIncurred.gateOutPOD},
          {label:"Empty Return",sub:"Returned",icon:Box,color:T.amber,actual:st.emptyReturn_actual,missing:BASE.missingMilestones.emptyReturn,incurred:BASE.stageIncurred.emptyReturn}],
        metrics:[{t:"Demurrage",dw:sd.dest_demurrage.avg,fp:cm.demurrage_destination.avgFP,cost:cm.demurrage_destination.total,n:cm.demurrage_destination.withCost,c:T.purple},{t:"Detention",dw:sd.dest_detention.avg,fp:cm.detention_destination.avgFP,cost:cm.detention_destination.total,n:cm.detention_destination.withCost,c:T.amber},{t:"Storage",dw:sd.storage_dest.avg,fp:cm.storage_destination.avgFP,cost:cm.storage_destination.total,n:cm.storage_destination.withCost,c:T.green},{t:"Combined",dw:sd.combined_dest.avg,fp:cm.dnd_destination.avgFP,cost:cm.dnd_destination.total,n:cm.dnd_destination.withCost,c:T.red}]}
      ].map((sec,si)=><div key={si}>
        {si===1&&<div style={{textAlign:"center",padding:"6px 0"}}><span style={{fontSize:10,color:T.dim,fontWeight:400}}>{"— Ocean Transit: "+sd.ocean_transit.avg+"d avg —"}</span></div>}
        <div style={{background:sec.bg+"80",border:"none",borderRadius:14,padding:"16px 14px 12px",marginBottom:si===0?6:0,position:"relative"}}>
          <div style={{position:"absolute",top:7,left:12,fontSize:9,fontWeight:700,color:sec.lc,textTransform:"uppercase",letterSpacing:1}}>{sec.label}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:14}}>
            {sec.nodes.map((n,i)=><div key={i} style={{background:"#fff",border:"1px solid "+(n.incurred>100?T.red+"40":T.border+"80"),borderRadius:12,padding:"12px 10px",textAlign:"center",borderWidth:1}}>
              <n.icon size={14} color={n.color} style={{marginBottom:2}}/><div style={{fontSize:11,fontWeight:700}}>{n.label}</div><div style={{fontSize:10,color:T.dim}}>{n.sub}</div>
              <div style={{fontSize:16,fontWeight:700,margin:"4px 0"}}>{n.actual.toLocaleString()}</div>
              <div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap"}}>
                {n.missing>0&&<span style={{fontSize:9,color:T.amber,background:T.amberBg,padding:"1px 5px",borderRadius:4}}>{n.missing+" missing"}</span>}
              </div>
            </div>)}
          </div>
        </div>
      </div>)}
    </Card>
    <div style={{height:1,background:T.border+"40",margin:"6px 0 14px"}}/>
    {/* ANALYSIS ZONE */}
    <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16,marginBottom:18}}>
      <Card>
        <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Cost Breakdown</div>
        <div style={{fontSize:11,color:T.sub,marginBottom:10}}>Which charge type and side is driving your exposure?</div>
        <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:11}}>
          <thead><tr style={{color:T.dim,fontSize:9}}>{["Category","Origin","Dest","Total","#","FP"].map(h=><th key={h} style={{padding:"4px 8px",textAlign:h==="Category"?"left":"right",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>)}</tr></thead>
          <tbody>{COST_CATS.map((cat,ci)=>{const o=cm[cat.oKey];const d=cm[cat.dKey];const isMax=cat.name==="Combined D&D";return <tr key={cat.name} style={{background:isMax?T.redBg+"80":T.card2,borderLeft:isMax?"3px solid "+T.red:undefined}}><td style={{padding:"6px 8px",borderRadius:"6px 0 0 6px",borderLeft:isMax?"3px solid "+T.red:undefined}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:cat.color}}/><span style={{fontWeight:700}}>{cat.name}</span></div></td><td style={{padding:"6px 8px",fontWeight:600,textAlign:"right"}}>{fmt(o.total)}</td><td style={{padding:"6px 8px",fontWeight:600,textAlign:"right"}}>{fmt(d.total)}</td><td style={{padding:"6px 8px",color:cat.color,fontWeight:600,textAlign:"right"}}>{fmt(o.total+d.total)}</td><td style={{padding:"6px 8px",color:T.sub,textAlign:"right"}}>{o.withCost+d.withCost}</td><td style={{padding:"6px 8px",color:T.sub,textAlign:"right",borderRadius:"0 6px 6px 0"}}>{o.avgFP}d</td></tr>;})}
          <tr><td colSpan={3} style={{padding:8,fontWeight:600,fontSize:13}}>TOTAL</td><td colSpan={3} style={{padding:8,color:T.red,fontWeight:700,fontSize:14,textAlign:"right"}}>{fmt(BASE.grandTotal)}</td></tr></tbody>
        </table>
        <Insight text={(()=>{const cats=[{n:"Combined D&D",v:cm.dnd_origin.total},{n:"Detention",v:cm.detention_origin.total},{n:"Demurrage",v:cm.demurrage_origin.total},{n:"Storage",v:cm.storage_origin.total}];const top=cats.reduce((a,b)=>b.v>a.v?b:a);return top.n+" at origin ("+fmt(top.v)+") accounts for "+Math.round(top.v/BASE.grandTotal*100)+"% of total exposure. This is your largest cost bucket.";})()}/>
      </Card>
      <Card>
        <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Free Time Health</div>
        <div style={{fontSize:11,color:T.sub,marginBottom:10}}>How close are containers to entering paid tiers?</div>
        {[{label:"Expired",count:fth.expired,color:T.red,action:"Review and clear"},{label:"Critical (0-2d)",count:fth.red,color:T.red,action:"Expedite TODAY"},{label:"Monitor (3-5d)",count:fth.yellow,color:T.amber,action:"Plan this week"},{label:"Safe (6+d)",count:fth.green,color:T.green,action:"No action needed"}].map(b=>{const tot=fth.expired+fth.red+fth.yellow+fth.green;return <div key={b.label} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:T.sub}}>{b.label}</span><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:10,color:b.color,fontWeight:600}}>{b.action}</span><span style={{fontSize:12,fontWeight:700,color:b.color}}>{b.count.toLocaleString()}</span></div></div><div style={{height:6,background:T.card2,borderRadius:3,overflow:"hidden",border:"none",boxShadow:"inset 0 1px 2px rgba(0,0,0,.06)"}}><div style={{height:"100%",width:Math.round(b.count/tot*100)+"%",background:b.color,borderRadius:3}}/></div></div>;})}
      </Card>
    </div>
    <div style={{height:1,background:T.border+"40",margin:"6px 0 14px"}}/>
    {/* WHY YOU'RE PAYING */}
    <Card style={{marginBottom:14,borderLeft:"3px solid "+T.red+"70",background:"#FFF5F5"}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Why You're Paying</div>
      <div style={{fontSize:11,color:T.sub,marginBottom:10}}>Root causes inferred from container data patterns. For confirmed reasons, enable reason tagging on surcharges.</div>
      {(()=>{const worstCarrier=Object.entries(BASE.carriers).reduce((a,[n,d])=>d.avgODet>a[1].avgODet?[n,d]:a,["",{avgODet:0}]);const wName=worstCarrier[0];const wData=worstCarrier[1];const portfolioAvgDet=Object.values(BASE.carriers).reduce((s,d)=>s+d.avgODet*d.containers,0)/Object.values(BASE.carriers).reduce((s,d)=>s+d.containers,0);const sepTotal=cm.detention_origin.total+cm.demurrage_origin.total;const combPrem=sepTotal>0?Math.round((cm.dnd_origin.total-sepTotal)/sepTotal*100):0;const goeIncurred=BASE.stageIncurred.gateOutEmpty;return[
        {pattern:goeIncurred+" containers stuck at Gate Out Empty — Gate In POL not yet recorded",cause:"Documentation or depot scheduling delay holding containers at origin",impact:"~"+fmt(cm.detention_origin.total)+" origin detention already accruing",action:"Verify documentation readiness before dispatch",c:T.amber},
        {pattern:wName+" containers average "+wData.avgODet.toFixed(1)+"d origin dwell vs portfolio "+portfolioAvgDet.toFixed(1)+"d",cause:"Carrier equipment availability or scheduling",impact:"Across "+wData.containers+" containers",action:"Raise in "+wName+" QBR — see Carrier Intel",c:T.purple},
        {pattern:"Combined D&D rate at origin costs "+combPrem+"% more than separate",cause:"Rate structure misalignment",impact:"~"+fmt(cm.dnd_origin.total-sepTotal)+" premium vs separate rates",action:"Evaluate switching — see Surcharges",c:T.red},
        {pattern:totalMissing+" missing milestones across portfolio ("+milestonePct+"% complete)",cause:"Tracking data gaps masking true cost",impact:"Unknown — could be significant",action:"Prioritize milestone data completeness with carriers",c:T.dim}]})()
      .map((r,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:i<3?"1px solid "+T.border+"80":"none"}}>
        <div style={{width:4,borderRadius:2,background:r.c,flexShrink:0}}/>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:T.text}}>{r.pattern}</div><div style={{fontSize:11,color:T.sub,lineHeight:1.4}}>{"Probable cause: "+r.cause+" | Impact: "+r.impact}</div><div style={{fontSize:11,color:r.c,fontWeight:600}}>{"Action: "+r.action}</div></div>
      </div>)}
    </Card>
    <div style={{height:1,background:T.border+"40",margin:"6px 0 14px"}}/>
    {/* INSIGHTS */}
    <SH title="Operational Insights" sub="Click any insight to navigate to the relevant module"/>
    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
      {(()=>{const detFP=cm.detention_origin.avgFP;const detAvg=sd.origin_detention.avg;const detUtil=Math.round(detAvg/detFP*100);const sepT=cm.detention_origin.total+cm.demurrage_origin.total;const combPrem=sepT>0?Math.round((cm.dnd_origin.total-sepT)/sepT*100):0;const wc=Object.entries(BASE.carriers).reduce((a,[n,d])=>d.avgODet>a[1].avgODet?[n,d]:a,["",{avgODet:0,containers:0,missingMilestones:0}]);const pavg=Object.values(BASE.carriers).reduce((s,d)=>s+d.avgODet*d.containers,0)/Math.max(1,Object.values(BASE.carriers).reduce((s,d)=>s+d.containers,0));return[
        {icon:AlertTriangle,color:T.red,nav:"optimizer",title:"Origin = "+originPct+"% of total D&D ("+fmt(BASE.totalOriginCost)+")",because:"Avg detention dwell is "+detAvg+"d against "+detFP+"d free — "+detUtil+"% utilization",action:"Prioritize expired origin containers in Cost Optimizer"},
        {icon:Clock,color:T.red,nav:"optimizer",title:fth.red+" containers breach free time within 48 hours",because:"These move from zero-cost to paid tiers immediately upon expiry",action:"Filter Cost Optimizer to Free Period = Expiring 48h"},
        {icon:Ship,color:T.amber,nav:"carriers",title:wc[0]+": "+wc[1].avgODet.toFixed(1)+"d avg origin dwell vs portfolio "+pavg.toFixed(1)+"d",because:"Consistent outlier across "+wc[1].containers+" containers with "+wc[1].missingMilestones+" missing milestones",action:"Prepare data-driven QBR discussion in Carrier Intel"}]})().map((ins,i)=><Card key={i} onClick={ins.nav?()=>setPage(ins.nav):undefined} style={{borderLeft:"3px solid "+ins.color,padding:"10px 14px",cursor:ins.nav?"pointer":"default"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}><ins.icon size={13} color={ins.color}/><span style={{fontSize:13,fontWeight:600}}>{ins.title}</span>{ins.nav&&<span style={{marginLeft:"auto",fontSize:9,color:T.blueL,fontWeight:600}}>{"View →"}</span>}</div>
        <div style={{paddingLeft:20,fontSize:11,color:T.sub,lineHeight:1.4}}>{"Because: "+ins.because}</div>
        <div style={{paddingLeft:20,fontSize:11,color:ins.color,fontWeight:600}}>{"Action: "+ins.action}</div>
      </Card>)}
    </div>
    <div style={{height:1,background:T.border+"40",margin:"6px 0 14px"}}/>
    {/* ACTION TABLE */}
    <Card id="actionTable" urgency="action" style={{borderLeft:"4px solid "+T.blue}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}><div><span style={{fontSize:15,fontWeight:600}}>Containers Needing Action Today</span><span style={{fontSize:11,fontWeight:400,color:T.sub,marginLeft:8}}>{"Top 5 of "+fth.red+" critical — sorted by daily burn"}</span></div></div>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:10}}>
        <thead><tr style={{color:T.sub,fontSize:9,textAlign:"left"}}>{["Container","Carrier","Route","Stage","Category","Cost","$/Day","Risk"].map(h=><th key={h} style={{padding:"4px 6px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:["Cost","$/Day","Risk"].includes(h)?"right":"left"}}>{h}{h==="Risk"&&<HoverTip text={"Higher risk = more days beyond free period + more missing milestones. Max 100."}/>}{h==="$/Day"&&<HoverTip text={"Daily burn rate: how much this container costs per day of inaction. Computed from tier-based cost projection."}/>}</th>)}</tr></thead>
        <tbody>{CDATA.topRisk.slice(0,5).map((c,i)=>{const daily=Math.round((c.cost3d-c.cost)/3);return <tr key={i} style={{background:i===0?T.blueBg:T.card2,borderLeft:c.risk>=75?"3px solid "+T.red:undefined}}>
          <td style={{padding:"5px 6px",borderRadius:"6px 0 0 6px",fontFamily:"monospace",fontSize:10,fontWeight:600,borderLeft:c.risk>=75?"3px solid "+T.red:undefined}}>{c.cn}</td>
          <td style={{padding:"5px 6px",color:T.sub}}>{c.ca}</td>
          <td style={{padding:"5px 6px",fontSize:10}}>{c.po+"→"+c.pd}</td>
          <td style={{padding:"5px 6px",fontSize:10,color:T.sub}}>{c.stage}</td>
          <td style={{padding:"5px 6px"}}><Badge color={catColor(c.cat)}>{c.cat}</Badge></td>
          <td style={{padding:"5px 6px",fontWeight:600,textAlign:"right"}}>{fmt(c.cost)}</td>
          <td style={{padding:"5px 6px",fontWeight:700,color:T.red,textAlign:"right"}}>{"$"+daily+"/d"}</td>
          <td style={{padding:"5px 6px",borderRadius:"0 6px 6px 0",textAlign:"right"}}><SolidBadge color={c.risk>=75?T.red:T.amber}>{c.risk}</SolidBadge></td>
        </tr>;})}</tbody>
      </table>
      <NavLink text="View full prioritization queue in Cost Optimizer" onClick={()=>setPage("optimizer")}/>
    </Card>
  </div>);
}

// ═══ MODULE 2: COST OVERVIEW ═══
function CostPage({setPage}){
  const cm=BASE.costMatrix;const momO=momPct(BASE.mom.currOrigin,BASE.mom.prevOrigin);const momD=momPct(BASE.mom.currDest,BASE.mom.prevDest);
  const barData=COST_CATS.map(c=>({name:c.name,Origin:cm[c.oKey].total,Dest:cm[c.dKey].total}));
  const pieData=COST_CATS.map(c=>({name:c.name,value:cm[c.oKey].total+cm[c.dKey].total,color:c.color})).filter(d=>d.value>0);
  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    <SH title="Cost Overview" sub="Where exactly is the money going? Drill into category, side, and distribution."/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
      <ChartBox title="Origin vs Destination by Category" sub="Compare which category has the biggest origin-to-destination gap" h={220} insight={(()=>{const maxCat=COST_CATS.reduce((a,cat)=>{const t=cm[cat.oKey].total+cm[cat.dKey].total;return t>a.total?{name:cat.name,total:t,oTotal:cm[cat.oKey].total}:a;},{name:"",total:0,oTotal:0});return maxCat.name+" ("+fmt(maxCat.total)+") is the largest category at "+Math.round(maxCat.total/BASE.grandTotal*100)+"% of total. Origin accounts for "+fmt(maxCat.oTotal)+" ("+Math.round(maxCat.oTotal/Math.max(1,maxCat.total)*100)+"%).";})()} nav={<NavLink text="See which carriers drive this → Carrier Intel" onClick={()=>setPage("carriers")}/>}><ResponsiveContainer><BarChart data={barData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"}/><XAxis type="number" stroke={T.dim} fontSize={10} tickFormatter={v=>fmt(v)}/><YAxis type="category" dataKey="name" stroke={T.dim} fontSize={10} width={80}/><Tooltip content={<CTip/>}/><Bar dataKey="Origin" fill={T.amber} radius={[0,3,3,0]}/><Bar dataKey="Dest" fill={T.purple} radius={[0,3,3,0]}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/></BarChart></ResponsiveContainer></ChartBox>
      <ChartBox title="Cost Distribution" sub="Proportional share of each charge type in total cost" h={220}><ResponsiveContainer><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} dataKey="value" paddingAngle={2}>{pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip formatter={v=>fmt(v)}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/></PieChart></ResponsiveContainer></ChartBox>
    </div>
    <Card>
      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Full Cost Matrix</div><div style={{fontSize:11,color:T.sub,marginBottom:10}}>Detailed breakdown by surcharge category and side — broad categories above, combined surcharge types below</div>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:11}}>
        <thead><tr style={{color:T.dim,fontSize:10,textAlign:"left"}}>{["Category","Origin $","O #","O FP","Dest $","D #","D FP","Total"].map(h=><th key={h} style={{padding:"5px 8px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:h!=="Category"?"right":"left"}}>{h}</th>)}</tr></thead>
        <tbody>
          {[
            {name:"Detention",                  oKey:"detention_origin",                  dKey:"detention_destination",                  color:T.amber},
            {name:"Demurrage",                  oKey:"demurrage_origin",                  dKey:"demurrage_destination",                  color:T.purple},
            {name:"Storage",                    oKey:"storage_origin",                    dKey:"storage_destination",                    color:T.green},
            {name:"Combined D&D",               oKey:"dnd_origin",                        dKey:"dnd_destination",                        color:T.red},
            {name:"Demurrage + Storage",        oKey:"demurrageStorage_origin",           dKey:"demurrageStorage_destination",           color:T.purple},
            {name:"Detention + Demurrage",      oKey:"detentionDemurrage_origin",         dKey:"detentionDemurrage_destination",         color:T.amber},
            {name:"Det. + Dem. + Storage",      oKey:"detentionDemurrageStorage_origin",  dKey:"detentionDemurrageStorage_destination",  color:T.red},
          ].map(cat=>{const o=cm[cat.oKey];const d=cm[cat.dKey];return <tr key={cat.name} style={{background:T.card2}}><td style={{padding:"7px 8px",borderRadius:"6px 0 0 6px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:cat.color}}/><span style={{fontWeight:600}}>{cat.name}</span></div></td><td style={{padding:"7px 8px",fontWeight:600,textAlign:"right"}}>{fmt(o.total)}</td><td style={{padding:"7px 8px",color:T.sub,textAlign:"right"}}>{o.withCost}</td><td style={{padding:"7px 8px",color:T.sub,textAlign:"right"}}>{o.avgFP}d</td><td style={{padding:"7px 8px",fontWeight:600,textAlign:"right"}}>{fmt(d.total)}</td><td style={{padding:"7px 8px",color:T.sub,textAlign:"right"}}>{d.withCost}</td><td style={{padding:"7px 8px",color:T.sub,textAlign:"right"}}>{d.avgFP}d</td><td style={{padding:"7px 8px",borderRadius:"0 6px 6px 0",color:cat.color,fontWeight:600,textAlign:"right"}}>{fmt(o.total+d.total)}</td></tr>;})}
          <tr><td colSpan={7} style={{padding:"8px 8px",fontWeight:700,fontSize:13}}>GRAND TOTAL</td><td style={{padding:"8px 8px",color:T.red,fontWeight:700,fontSize:15,textAlign:"right"}}>{fmt(BASE.grandTotal)}</td></tr>
        </tbody>
      </table>
      <div style={{background:T.blueBg,borderRadius:8,padding:"10px 14px",marginTop:10,marginBottom:6,borderLeft:"3px solid "+T.blue}}>
        <div style={{fontSize:11,fontWeight:700,color:T.blue,marginBottom:4}}>Contributing Factors</div>
        <div style={{fontSize:12,color:T.text}}>
          {(()=>{const topLanes=BASE.topLanes.slice(0,3).map(l=>l.lane).join(", ");const wc=Object.entries(BASE.carriers).reduce((a,[n,d])=>d.avgODet>a[1].avgODet?[n,d]:a,["",{avgODet:0}]);const avgBFP=Math.max(0,BASE.stageDays.origin_detention.avg-BASE.costMatrix.detention_origin.avgFP).toFixed(1);return "Top lanes by cost: "+topLanes+". Worst carrier: "+wc[0]+" ("+wc[1].avgODet.toFixed(1)+"d avg origin dwell). Avg days beyond free period: "+avgBFP+"d.";})()}
        </div>
      </div>
      <NavLink text="Who is driving this cost → Carrier Intel" onClick={()=>setPage("carriers")}/>
      <NavLink text="Take action on high-cost containers → Cost Optimizer" onClick={()=>setPage("optimizer")}/>
    </Card>
  </div>);
}

// ═══ MODULE 3: CARRIER INTEL ═══
const CARRIER_VIEWS=[
  {id:"dwell",     label:"Avg Dwell Time"},
  {id:"exceeding", label:"Containers Exceeding Free Days"},
  {id:"cost",      label:"Cost Exposure by Carrier"},
  {id:"tier",      label:"Free Period Tier Distribution"},
];

function CarrierPage({setPage}){
  const[selCarrier,setSelCarrier]=useState(null);
  const[view,setView]=useState("dwell");
  const carriers=useMemo(()=>Object.entries(BASE.carriers).filter(([,v])=>v.containers>=5).map(([n,d])=>{
    const beyondFP=+(d.avgODet-5.1).toFixed(1);
    const pastFPCount=Math.round(Math.max(0,beyondFP)*d.containers*0.6);
    const pastFPPct=+(pastFPCount/d.containers*100).toFixed(1);
    const estCost=Math.round(pastFPCount*(beyondFP>0?beyondFP*120:0)+d.containers*d.avgDDem*40+d.containers*d.avgDDet*80);
    const tierIn=Math.round(d.containers*(1-(pastFPPct/100)));
    const tier1=Math.round(d.containers*Math.min(pastFPPct/100,0.3));
    const tier2=Math.round(d.containers*Math.max(0,Math.min(pastFPPct/100-0.3,0.25)));
    const tier3=Math.round(d.containers*Math.max(0,pastFPPct/100-0.55));
    return{name:n,...d,totalO:d.avgODet+d.avgODem,totalD:d.avgDDem+d.avgDDet,beyondFP,pastFPCount,pastFPPct,estCost,tierIn,tier1,tier2,tier3,
      risk:Math.min(100,Math.round((d.avgODet+d.avgODem)*8+(d.avgDDem+d.avgDDet)*5+d.missingMilestones/d.containers*2))};
  }).sort((a,b)=>b.totalO-a.totalO),[]);

  const selStyle={border:"1px solid "+T.border,borderRadius:8,padding:"6px 12px",fontSize:11,color:T.text,background:"#fff",cursor:"pointer",outline:"none",fontWeight:600};

  const chartData=useMemo(()=>{
    if(view==="dwell") return carriers.map(c=>({name:c.name,"O.Det":c.avgODet,"O.Dem":c.avgODem,"O.Comb":+(c.avgODet+c.avgODem).toFixed(1),"D.Det":c.avgDDet,"D.Dem":c.avgDDem,"D.Comb":+(c.avgDDem+c.avgDDet).toFixed(1)}));
    if(view==="exceeding") return carriers.map(c=>({name:c.name,"Past FP":c.pastFPCount,"Within FP":c.containers-c.pastFPCount}));
    if(view==="cost") return carriers.map(c=>({name:c.name,"Est. Cost":c.estCost}));
    if(view==="tier") return carriers.map(c=>({name:c.name,"Free (No Charge)":c.tierIn,"1–3 Days Overdue":c.tier1,"4–7 Days Overdue":c.tier2,"7+ Days Overdue":c.tier3}));
  },[view,carriers]);

  const viewMeta={
    dwell:{title:"Avg Dwell by Carrier (Days)",sub:"Left=Origin, Right=Destination. Reference line = 5.1d free period.",insight:(()=>{const wc=carriers[0];return wc.name+" origin dwell ("+wc.totalO.toFixed(1)+"d) is "+(wc.totalO/5.1).toFixed(1)+"× the free-period threshold. Biggest carrier-level cost driver.";})()},
    exceeding:{title:"Containers Exceeding Free Period",sub:"Count of containers estimated past free period vs within it, per carrier.",insight:(()=>{const wc=[...carriers].sort((a,b)=>b.pastFPCount-a.pastFPCount)[0];return wc.name+" has the most containers past free period (~"+wc.pastFPCount+" of "+wc.containers+", "+wc.pastFPPct+"%). Prioritise this carrier for release action.";})()},
    cost:{title:"Estimated D&D Cost Exposure by Carrier ($)",sub:"Estimated cost based on dwell beyond free period × daily rate. Directional — not billing data.",insight:(()=>{const wc=[...carriers].sort((a,b)=>b.estCost-a.estCost)[0];return wc.name+" carries the highest estimated exposure ("+fmt(wc.estCost)+"). Focus negotiation and release efforts here first.";})()},
    tier:{title:"Free Period Tier Distribution by Carrier",sub:"How containers are distributed across cost tiers. Longer bars in FP+4d+ = deeper in paid tiers.",insight:(()=>{const wc=[...carriers].sort((a,b)=>(b.tier2+b.tier3)-(a.tier2+a.tier3))[0];return wc.name+" has the most containers in FP+4d+ tiers ("+( wc.tier2+wc.tier3)+"). These are accruing the highest daily rates.";})()},
  };

  const vm=viewMeta[view];

  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:10}}>
      <SH title="Carrier Intel" sub="Select a view to analyse carriers from different angles."/>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:10,fontWeight:600,color:T.sub,textTransform:"uppercase"}}>View</span>
        <select value={view} onChange={e=>{setView(e.target.value);setSelCarrier(null);}} style={selStyle}>
          {CARRIER_VIEWS.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
        </select>
      </div>
    </div>

    <ChartBox title={vm.title} sub={vm.sub} h={300} insight={vm.insight} nav={<NavLink text="See port and lane performance trends → Historical" onClick={()=>setPage("history")}/>}>
      {view==="dwell"&&(<>
        <div style={{display:"flex",gap:16,marginBottom:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
          {[{l:"Detention",c:T.amber},{l:"Demurrage",c:T.purple},{l:"Combined D&D",c:T.red}].map(x=><div key={x.l} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:10,height:10,borderRadius:2,background:x.c}}/><span style={{fontSize:9,color:T.sub}}>{x.l}</span></div>)}
          <div style={{borderLeft:"1px solid "+T.border,paddingLeft:8,display:"flex",gap:8}}><span style={{fontSize:9,color:T.sub}}>Left=Origin</span><span style={{fontSize:9,color:T.sub}}>Right=Dest</span></div>
        </div>
        <div style={{height:250}}><ResponsiveContainer><BarChart data={chartData} barSize={14} barGap={1} barCategoryGap="30%"><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"}/><XAxis dataKey="name" stroke={T.dim} fontSize={10}/><YAxis stroke={T.dim} fontSize={10}/><ReferenceLine y={5.1} stroke={T.red} strokeDasharray="6 3" label={{value:"FP: 5.1d",position:"right",fontSize:9,fill:T.red}}/><Tooltip content={({active,payload,label})=>{if(!active||!payload||!payload[0])return null;const d=payload[0].payload;return <div style={{background:"#fff",borderRadius:10,padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,.08)"}}><div style={{fontSize:11,fontWeight:700,marginBottom:4}}>{label}</div><div style={{fontSize:9,fontWeight:700,color:T.amber,marginBottom:2}}>Origin</div><div style={{fontSize:9,color:T.sub}}>{"Det: "+d["O.Det"]+"d | Dem: "+d["O.Dem"]+"d | Comb: "+d["O.Comb"]+"d"}</div><div style={{fontSize:9,fontWeight:700,color:T.purple,marginTop:4,marginBottom:2}}>Destination</div><div style={{fontSize:9,color:T.sub}}>{"Det: "+d["D.Det"]+"d | Dem: "+d["D.Dem"]+"d | Comb: "+d["D.Comb"]+"d"}</div></div>;}}/><Bar dataKey="O.Det" stackId="origin" fill={T.amber}/><Bar dataKey="O.Dem" stackId="origin" fill={T.purple}/><Bar dataKey="O.Comb" stackId="origin" fill={T.red} radius={[3,3,0,0]}/><Bar dataKey="D.Det" stackId="dest" fill={T.amber}/><Bar dataKey="D.Dem" stackId="dest" fill={T.purple}/><Bar dataKey="D.Comb" stackId="dest" fill={T.red} radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>
      </>)}
      {view==="exceeding"&&(
        <div style={{height:250}}><ResponsiveContainer><BarChart data={chartData} barSize={20} barCategoryGap="35%"><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"}/><XAxis dataKey="name" stroke={T.dim} fontSize={10}/><YAxis stroke={T.dim} fontSize={10}/><Tooltip content={({active,payload,label})=>{if(!active||!payload?.length)return null;const carr=carriers.find(c=>c.name===label);return <div style={{background:"#fff",borderRadius:10,padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,.08)"}}><div style={{fontSize:11,fontWeight:700,marginBottom:4}}>{label}</div><div style={{fontSize:9,color:T.red}}>{"Past FP: "+carr.pastFPCount+" containers ("+carr.pastFPPct+"%)"}</div><div style={{fontSize:9,color:T.green}}>{"Within FP: "+(carr.containers-carr.pastFPCount)+" containers"}</div></div>;}}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/><Bar dataKey="Past FP" stackId="a" fill={T.red}/><Bar dataKey="Within FP" stackId="a" fill={T.green} radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>
      )}
      {view==="cost"&&(
        <div style={{height:250}}><ResponsiveContainer><BarChart data={[...chartData].sort((a,b)=>b["Est. Cost"]-a["Est. Cost"])} barSize={22} barCategoryGap="35%"><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"}/><XAxis dataKey="name" stroke={T.dim} fontSize={10}/><YAxis stroke={T.dim} fontSize={10} tickFormatter={v=>"$"+Math.round(v/1000)+"k"}/><Tooltip content={({active,payload,label})=>{if(!active||!payload?.length)return null;return <div style={{background:"#fff",borderRadius:10,padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,.08)"}}><div style={{fontSize:11,fontWeight:700,marginBottom:4}}>{label}</div><div style={{fontSize:9,color:T.red}}>{"Est. Exposure: "+fmt(payload[0].value)}</div></div>;}}/><Bar dataKey="Est. Cost" fill={T.red} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
      )}
      {view==="tier"&&(()=>{
        const TIERS=[
          {key:"Free (No Charge)",  color:T.green,   rate:"$0/day",    sub:"Within free period"},
          {key:"1–3 Days Overdue",  color:T.amber,   rate:"~$50/day",  sub:"Low tier — act soon"},
          {key:"4–7 Days Overdue",  color:"#F97316", rate:"~$100/day", sub:"Mid tier — costs rising"},
          {key:"7+ Days Overdue",   color:T.red,     rate:"~$200/day", sub:"Highest tier — urgent"},
        ];
        const TierTip=({active,payload,label})=>{
          if(!active||!payload?.length)return null;
          const carr=carriers.find(c=>c.name===label);
          if(!carr)return null;
          return <div style={{background:"#fff",borderRadius:10,padding:"12px 16px",boxShadow:"0 4px 16px rgba(0,0,0,.1)",minWidth:200}}>
            <div style={{fontSize:11,fontWeight:700,marginBottom:8,borderBottom:"1px solid #f0f0f0",paddingBottom:4}}>{label} — {carr.containers} containers total</div>
            {TIERS.map(t=>{
              const count=payload.find(p=>p.dataKey===t.key)?.value??0;
              const pct=carr.containers>0?Math.round(count/carr.containers*100):0;
              return <div key={t.key} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <div style={{width:8,height:8,borderRadius:2,background:t.color,flexShrink:0}}/>
                <span style={{fontSize:9,color:T.sub,flex:1}}>{t.key}</span>
                <span style={{fontSize:10,fontWeight:700,color:t.color,minWidth:20,textAlign:"right"}}>{count}</span>
                <span style={{fontSize:9,color:T.dim,minWidth:28,textAlign:"right"}}>{pct}%</span>
                <span style={{fontSize:9,color:T.sub,minWidth:60,textAlign:"right"}}>{t.rate}</span>
              </div>;
            })}
          </div>;
        };
        return <>
          <div style={{display:"flex",gap:16,marginBottom:10,flexWrap:"wrap",alignItems:"flex-start"}}>
            {TIERS.map(t=><div key={t.key} style={{display:"flex",alignItems:"flex-start",gap:6}}>
              <div style={{width:10,height:10,borderRadius:2,background:t.color,marginTop:1,flexShrink:0}}/>
              <div><div style={{fontSize:9,fontWeight:700,color:T.text}}>{t.key}</div><div style={{fontSize:8,color:T.sub}}>{t.rate}</div></div>
            </div>)}
          </div>
          <div style={{height:240}}><ResponsiveContainer><BarChart data={chartData} barSize={20} barCategoryGap="35%"><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"}/><XAxis dataKey="name" stroke={T.dim} fontSize={10}/><YAxis stroke={T.dim} fontSize={10} label={{value:"Containers",angle:-90,position:"insideLeft",fontSize:9,fill:T.dim}}/><Tooltip content={<TierTip/>}/><Bar dataKey="Free (No Charge)" stackId="t" fill={T.green}/><Bar dataKey="1–3 Days Overdue" stackId="t" fill={T.amber}/><Bar dataKey="4–7 Days Overdue" stackId="t" fill="#F97316"/><Bar dataKey="7+ Days Overdue" stackId="t" fill={T.red} radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div>
        </>;
      })()}
    </ChartBox>

    <Card style={{marginTop:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div><div style={{fontSize:14,fontWeight:600}}>Carrier Scorecard <span style={{fontSize:10,fontWeight:400,color:T.blue}}>— click to drill down</span></div>
        <div style={{fontSize:11,color:T.sub}}>Carrier scores are for evaluation only. Business relationships and other factors should inform decisions.</div></div>
      </div>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:10}}>
        {view==="dwell"&&(<>
          <thead><tr style={{color:T.dim,fontSize:10,textAlign:"left"}}>{["Carrier","Vol","O.Det","O.Dem","Total O","Beyond FP","D.Dem","D.Det","Total D","Missing","Score"].map(h=><th key={h} style={{padding:"5px 7px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:["Vol","Beyond FP","Missing","Score"].includes(h)?"right":"left"}}>{h}{h==="Score"&&<HoverTip text="min(100, (avgODet+avgODem)×8 + (avgDDem+avgDDet)×5 + missingMilestones/containers×2). Higher = worse."/>}{h==="Beyond FP"&&<HoverTip text="Avg origin detention minus 5.1d free period. Positive = paid tiers on average."/>}</th>)}</tr></thead>
          <tbody>{carriers.map(c=>{const sel=selCarrier===c.name;const rc=c.risk>70?T.red:c.risk>40?T.amber:T.green;return <tr key={c.name} onClick={()=>setSelCarrier(sel?null:c.name)} style={{background:sel?T.blueBg:T.card2,cursor:"pointer"}}><td style={{padding:"7px",borderRadius:"6px 0 0 6px",fontWeight:600}}>{c.name}{sel&&<ChevronDown size={10} color={T.blue}/>}</td><td style={{padding:"7px",color:T.sub,textAlign:"right"}}>{c.containers}</td><td style={{padding:"7px",color:T.amber,fontWeight:600}}>{c.avgODet.toFixed(1)}d</td><td style={{padding:"7px",color:T.purple,fontWeight:600}}>{c.avgODem.toFixed(1)}d</td><td style={{padding:"7px",fontWeight:600}}>{c.totalO.toFixed(1)}d</td><td style={{padding:"7px",color:c.beyondFP>0?T.red:T.green,fontWeight:600,textAlign:"right"}}>{c.beyondFP>0?"+":""}{c.beyondFP}d</td><td style={{padding:"7px",color:T.purple,fontWeight:600}}>{c.avgDDem.toFixed(1)}d</td><td style={{padding:"7px",color:T.red,fontWeight:600}}>{c.avgDDet.toFixed(1)}d</td><td style={{padding:"7px",fontWeight:600}}>{c.totalD.toFixed(1)}d</td><td style={{padding:"7px",color:c.missingMilestones/Math.max(c.containers,1)>3?T.amber:T.sub,textAlign:"right"}}>{c.missingMilestones}</td><td style={{padding:"7px",borderRadius:"0 6px 6px 0",textAlign:"right"}}><SolidBadge color={rc}>{c.risk}</SolidBadge></td></tr>;})}</tbody>
        </>)}
        {view==="exceeding"&&(<>
          <thead><tr style={{color:T.dim,fontSize:10,textAlign:"left"}}>{["Carrier","Total Vol","Past FP","% Past FP","Within FP","Avg Beyond (d)","Score"].map(h=><th key={h} style={{padding:"5px 7px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:["Total Vol","Past FP","% Past FP","Within FP","Score"].includes(h)?"right":"left"}}>{h}</th>)}</tr></thead>
          <tbody>{[...carriers].sort((a,b)=>b.pastFPCount-a.pastFPCount).map(c=>{const sel=selCarrier===c.name;const rc=c.pastFPPct>50?T.red:c.pastFPPct>25?T.amber:T.green;return <tr key={c.name} onClick={()=>setSelCarrier(sel?null:c.name)} style={{background:sel?T.blueBg:T.card2,cursor:"pointer"}}><td style={{padding:"7px",borderRadius:"6px 0 0 6px",fontWeight:600}}>{c.name}{sel&&<ChevronDown size={10} color={T.blue}/>}</td><td style={{padding:"7px",textAlign:"right",color:T.sub}}>{c.containers}</td><td style={{padding:"7px",textAlign:"right",color:T.red,fontWeight:700}}>{c.pastFPCount}</td><td style={{padding:"7px",textAlign:"right",color:c.pastFPPct>50?T.red:c.pastFPPct>25?T.amber:T.green,fontWeight:700}}>{c.pastFPPct}%</td><td style={{padding:"7px",textAlign:"right",color:T.green}}>{c.containers-c.pastFPCount}</td><td style={{padding:"7px",color:c.beyondFP>0?T.red:T.sub,fontWeight:600}}>{c.beyondFP>0?"+":""}{c.beyondFP}d</td><td style={{padding:"7px",borderRadius:"0 6px 6px 0",textAlign:"right"}}><SolidBadge color={rc}>{c.pastFPPct>50?"High":c.pastFPPct>25?"Mid":"Low"}</SolidBadge></td></tr>;})}
          </tbody>
        </>)}
        {view==="cost"&&(<>
          <thead><tr style={{color:T.dim,fontSize:10,textAlign:"left"}}>{["Carrier","Vol","Est. Cost","Cost/Container","Past FP","Avg Beyond (d)","Score"].map(h=><th key={h} style={{padding:"5px 7px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:["Vol","Est. Cost","Cost/Container","Score"].includes(h)?"right":"left"}}>{h}{h==="Est. Cost"&&<HoverTip text="Estimated: (pastFPCount × beyondFP × $120) + (containers × avgDDem × $40) + (containers × avgDDet × $80). Directional only."/>}</th>)}</tr></thead>
          <tbody>{[...carriers].sort((a,b)=>b.estCost-a.estCost).map(c=>{const sel=selCarrier===c.name;const cpC=Math.round(c.estCost/c.containers);const rc=cpC>500?T.red:cpC>200?T.amber:T.green;return <tr key={c.name} onClick={()=>setSelCarrier(sel?null:c.name)} style={{background:sel?T.blueBg:T.card2,cursor:"pointer"}}><td style={{padding:"7px",borderRadius:"6px 0 0 6px",fontWeight:600}}>{c.name}{sel&&<ChevronDown size={10} color={T.blue}/>}</td><td style={{padding:"7px",textAlign:"right",color:T.sub}}>{c.containers}</td><td style={{padding:"7px",textAlign:"right",fontWeight:700,color:T.red}}>{fmt(c.estCost)}</td><td style={{padding:"7px",textAlign:"right",color:cpC>500?T.red:cpC>200?T.amber:T.sub,fontWeight:600}}>{fmt(cpC)}</td><td style={{padding:"7px",color:T.sub}}>{c.pastFPCount}</td><td style={{padding:"7px",color:c.beyondFP>0?T.red:T.sub,fontWeight:600}}>{c.beyondFP>0?"+":""}{c.beyondFP}d</td><td style={{padding:"7px",borderRadius:"0 6px 6px 0",textAlign:"right"}}><SolidBadge color={rc}>{fmt(c.estCost)}</SolidBadge></td></tr>;})}
          </tbody>
        </>)}
        {view==="tier"&&(<>
          <thead><tr style={{color:T.dim,fontSize:10,textAlign:"left"}}>{["Carrier","Vol","Free","1–3d Over","4–7d Over","7d+ Over","% Overdue","Score"].map(h=><th key={h} style={{padding:"5px 7px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:["Vol","Free","1–3d Over","4–7d Over","7d+ Over","% Overdue","Score"].includes(h)?"right":"left"}}>{h}</th>)}</tr></thead>
          <tbody>{[...carriers].sort((a,b)=>(b.tier1+b.tier2+b.tier3)-(a.tier1+a.tier2+a.tier3)).map(c=>{const sel=selCarrier===c.name;const paidPct=+(c.pastFPPct).toFixed(1);const rc=paidPct>50?T.red:paidPct>25?T.amber:T.green;return <tr key={c.name} onClick={()=>setSelCarrier(sel?null:c.name)} style={{background:sel?T.blueBg:T.card2,cursor:"pointer"}}><td style={{padding:"7px",borderRadius:"6px 0 0 6px",fontWeight:600}}>{c.name}{sel&&<ChevronDown size={10} color={T.blue}/>}</td><td style={{padding:"7px",textAlign:"right",color:T.sub}}>{c.containers}</td><td style={{padding:"7px",textAlign:"right",color:T.green,fontWeight:600}}>{c.tierIn}</td><td style={{padding:"7px",textAlign:"right",color:T.amber,fontWeight:600}}>{c.tier1}</td><td style={{padding:"7px",textAlign:"right",color:"#F97316",fontWeight:600}}>{c.tier2}</td><td style={{padding:"7px",textAlign:"right",color:T.red,fontWeight:600}}>{c.tier3}</td><td style={{padding:"7px",textAlign:"right",color:rc,fontWeight:700}}>{paidPct}%</td><td style={{padding:"7px",borderRadius:"0 6px 6px 0",textAlign:"right"}}><SolidBadge color={rc}>{paidPct>50?"Deep":"Moderate"}</SolidBadge></td></tr>;})}
          </tbody>
        </>)}
      </table>
    </Card>

    {selCarrier&&<Card style={{marginTop:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontSize:13,fontWeight:700}}>{"Top Risk — "+selCarrier}</div><button onClick={()=>setSelCarrier(null)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={14} color={T.dim}/></button></div>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:10}}><thead><tr style={{color:T.dim,fontSize:9}}>{["Container","Route","Category","Cost","O.Det","Container Risk"].map(h=><th key={h} style={{padding:"4px 6px",textAlign:["Cost","Container Risk"].includes(h)?"right":"left"}}>{h}{h==="Container Risk"&&<HoverTip text="Individual score based on dwell beyond free period + missing milestones."/>}</th>)}</tr></thead>
      <tbody>{CDATA.topRisk.filter(c=>c.ca===selCarrier).map((c,i)=><tr key={i} style={{background:T.card2}}><td style={{padding:"5px 6px",borderRadius:"6px 0 0 6px",fontFamily:"monospace",fontSize:10,fontWeight:600}}>{c.cn}</td><td style={{padding:"5px 6px",color:T.sub,fontSize:9}}>{c.po+"→"+c.pd}</td><td style={{padding:"5px 6px"}}><Badge color={catColor(c.cat)}>{c.cat}</Badge></td><td style={{padding:"5px 6px",fontWeight:600,textAlign:"right"}}>{fmt(c.cost)}</td><td style={{padding:"5px 6px",color:c.oDet>5?T.red:T.sub,fontWeight:600}}>{c.oDet}d</td><td style={{padding:"5px 6px",borderRadius:"0 6px 6px 0",textAlign:"right"}}><SolidBadge color={c.risk>=75?T.red:T.amber}>{c.risk}</SolidBadge></td></tr>)}</tbody></table>
    </Card>}
  </div>);
}

// ═══ MODULE 4: COST OPTIMIZER ═══
function OptimizerPage(){
  const[predDate,setPredDate]=useState("2025-11-15");
  // Shared filters
  const[fFpStatus,setFFpStatus]=useState("All");const[fCat,setFCat]=useState("All");const[fRisk,setFRisk]=useState("All");const[fCostBand,setFCostBand]=useState("All");
  // Per-side filters
  const[aPolF,setAPolF]=useState("All");const[aPodF,setAPodF]=useState("All");const[aCarF,setACarF]=useState("All");
  const[bPolF,setBPolF]=useState("All");const[bPodF,setBPodF]=useState("All");const[bCarF,setBCarF]=useState("All");
  const[aTopN,setATopN]=useState("All");const[bTopN,setBTopN]=useState("All");

  const predDays=useMemo(()=>Math.max(0,Math.round((new Date(predDate)-new Date("2025-10-01"))/86400000)),[predDate]);
  const predCost=useMemo(()=>[{n:"Detention",fp:5.1,c:T.amber},{n:"Demurrage",fp:3.1,c:T.purple},{n:"Storage",fp:3.1,c:T.green},{n:"Combined",fp:9.9,c:T.red}].map(cat=>{const bp=Math.max(0,predDays-cat.fp);let dr=0;if(bp>0){dr=bp<=3?50:bp<=7?100:200;}return{...cat,beyondFP:bp,dailyRate:dr,predicted:Math.round(bp*dr*Math.max(1,Math.round(predDays*2.5)))};}),[predDays]);

  const allContainers=useMemo(()=>CDATA.topRisk.map(c=>{
    const d3=c.cost3d-c.cost;const d7=c.cost7d-c.cost;const fp=5.1;const daily=Math.round(d3/3);
    const todayCost=daily*Math.max(1,predDays);
    const fpStatus=c.oDet>fp?"Expired":c.oDet>fp-0.5?"Expiring Today":c.oDet>fp-2?"Expiring 48h":"Green";
    const side=["Gate Out POD","Discharge POD","Empty Return"].includes(c.stage)?"Destination":"Origin";
    const lane=c.po+"-"+c.pd;
    const costBand=todayCost>3000?"High Impact":todayCost>1000?"Medium":"Low";
    const riskLevel=c.risk>=75?"High":c.risk>=50?"Medium":"Low";
    return{...c,daily,todayCost,sav3d:d3,sav7d:d7,fpStatus,side,lane,costBand,riskLevel,reason:inferReason(c)};
  }).sort((a,b)=>b.todayCost-a.todayCost),[predDays]);

  const filterOpts=useMemo(()=>({pols:[...new Set(allContainers.map(c=>c.po))].sort(),pods:[...new Set(allContainers.map(c=>c.pd))].sort(),carriers:[...new Set(allContainers.map(c=>c.ca))].sort()}),[allContainers]);

  // Shared filter pass
  const sharedFiltered=useMemo(()=>allContainers.filter(c=>{
    if(fFpStatus!=="All"&&c.fpStatus!==fFpStatus)return false;
    if(fCat!=="All"&&c.cat!==fCat)return false;
    if(fRisk!=="All"&&c.riskLevel!==fRisk)return false;
    if(fCostBand!=="All"&&c.costBand!==fCostBand)return false;
    return true;
  }),[allContainers,fFpStatus,fCat,fRisk,fCostBand]);

  // Group A & B from per-side filters
  const groupA=useMemo(()=>{let g=sharedFiltered.filter(c=>{if(aPolF!=="All"&&c.po!==aPolF)return false;if(aPodF!=="All"&&c.pd!==aPodF)return false;if(aCarF!=="All"&&c.ca!==aCarF)return false;return true;});const n=aTopN==="All"?g.length:parseInt(aTopN);return{all:g,active:g.slice(0,n),excluded:g.slice(n)};},[sharedFiltered,aPolF,aPodF,aCarF,aTopN]);
  const groupB=useMemo(()=>{let g=sharedFiltered.filter(c=>{if(bPolF!=="All"&&c.po!==bPolF)return false;if(bPodF!=="All"&&c.pd!==bPodF)return false;if(bCarF!=="All"&&c.ca!==bCarF)return false;return true;});const n=bTopN==="All"?g.length:parseInt(bTopN);return{all:g,active:g.slice(0,n),excluded:g.slice(n)};},[sharedFiltered,bPolF,bPodF,bCarF,bTopN]);

  const gAToday=groupA.active.reduce((s,c)=>s+c.todayCost,0);const gA3d=groupA.active.reduce((s,c)=>s+c.sav3d,0);const gA7d=groupA.active.reduce((s,c)=>s+c.sav7d,0);
  const gBToday=groupB.active.reduce((s,c)=>s+c.todayCost,0);const gB3d=groupB.active.reduce((s,c)=>s+c.sav3d,0);const gB7d=groupB.active.reduce((s,c)=>s+c.sav7d,0);

  const selStyle={border:"1px solid "+T.border+"80",borderRadius:8,padding:"4px 8px",fontSize:10,color:T.text,background:"#fff",cursor:"pointer",outline:"none",minWidth:70};
  const resetAll=()=>{setFFpStatus("All");setFCat("All");setFRisk("All");setFCostBand("All");setAPolF("All");setAPodF("All");setACarF("All");setBPolF("All");setBPodF("All");setBCarF("All");setATopN("All");setBTopN("All");};

  const chargeData=[{side:"Origin",Detention:BASE.costMatrix.detention_origin.total,Demurrage:BASE.costMatrix.demurrage_origin.total,Storage:BASE.costMatrix.storage_origin.total,"Combined D&D":BASE.costMatrix.dnd_origin.total},{side:"Dest",Detention:BASE.costMatrix.detention_destination.total,Demurrage:BASE.costMatrix.demurrage_destination.total,Storage:BASE.costMatrix.storage_destination.total,"Combined D&D":BASE.costMatrix.dnd_destination.total}];

  const ContainerCard=({c,dimmed})=><div style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",borderRadius:6,marginBottom:2,background:"#fff",opacity:dimmed?.3:1,borderLeft:"3px solid "+catColor(c.cat)}}>
    <div><div style={{fontSize:10,fontWeight:600}}>{c.cn}</div><div style={{fontSize:9,color:T.sub}}>{c.ca+" | "+c.po+"→"+c.pd+" | "+c.fpStatus}</div></div>
    <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,color:T.green}}>{"Avoidable: "+fmt(c.todayCost)}</div><div style={{fontSize:10,color:T.sub}}>{"+3d: "+fmt(c.sav3d)+" | +7d: "+fmt(c.sav7d)}</div><div style={{fontSize:10,color:T.red}}>{"$"+c.daily+"/day"}</div></div>
  </div>;

  const GroupSummary=({data,color,label})=><div style={{background:color+"08",borderRadius:8,padding:10,marginBottom:6,border:"1px solid "+color+"20"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,fontWeight:700,color}}>{label+" ("+data.active.length+")"}</span><span style={{fontSize:20,fontWeight:800,color:T.green}}>{fmt(data.active.reduce((s,c)=>s+c.todayCost,0))}</span></div>
    <div style={{fontSize:11,color:T.sub,marginTop:2}}>{"Avoidable today | Avg: "+fmt(data.active.length>0?Math.round(data.active.reduce((s,c)=>s+c.todayCost,0)/data.active.length):0)+"/container | Burn: "+fmt(data.active.reduce((s,c)=>s+c.daily,0))+"/day"}</div>
    <div style={{fontSize:11,color:T.sub}}>{"+3d: "+fmt(data.active.reduce((s,c)=>s+c.sav3d,0))+" | +7d: "+fmt(data.active.reduce((s,c)=>s+c.sav7d,0))}</div>
  </div>;

  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    <SH title="Cost Optimizer" sub="Date-based prediction + container prioritization planner for resource deployment decisions"/>
    {/* PREDICTION */}
    <Card style={{marginBottom:14,borderLeft:"3px solid "+T.blue}}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>{"📅 Date-Based Cost Prediction"}</div>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12,flexWrap:"wrap"}}>
        <div><div style={{fontSize:9,fontWeight:700,color:T.sub,textTransform:"uppercase",marginBottom:4}}>Prediction Date</div><input type="date" value={predDate} onChange={e=>setPredDate(e.target.value)} min="2025-10-02" max="2026-06-30" style={{border:"1.5px solid "+T.blue,borderRadius:7,padding:"8px 12px",fontSize:13,fontWeight:700,outline:"none"}}/></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,flex:1}}>
          <div style={{background:T.card2,borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:9,color:T.sub}}>Days from Ref</div><div style={{fontSize:20,fontWeight:600,color:T.blue}}>{predDays}</div></div>
          <div style={{background:T.card2,borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:9,color:T.sub}}>Containers Affected</div><div style={{fontSize:20,fontWeight:600,color:T.text}}>{Math.max(1,Math.round(predDays*2.5))}</div></div>
          <div style={{background:T.redBg,borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:9,color:T.red}}>If No Action</div><div style={{fontSize:20,fontWeight:700,color:T.red}}>{fmt(predCost.reduce((s,c)=>s+c.predicted,0))}</div></div>
        </div>
      </div>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:11}}><thead><tr style={{color:T.dim,fontSize:10,textAlign:"left"}}><th style={{padding:"4px 8px"}}>Category</th><th>FP</th><th>Beyond</th><th>Rate</th><th style={{textAlign:"right"}}>Predicted</th></tr></thead><tbody>{predCost.map(c=><tr key={c.n} style={{background:T.card2}}><td style={{padding:"6px 8px",borderRadius:"6px 0 0 6px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:c.c}}/><span style={{fontWeight:700}}>{c.n}</span></div></td><td style={{padding:"6px 8px",color:T.sub}}>{c.fp}d</td><td style={{padding:"6px 8px",color:c.beyondFP>0?T.red:T.green,fontWeight:700}}>{c.beyondFP.toFixed(1)}d</td><td style={{padding:"6px 8px",color:T.sub}}>{"$"+c.dailyRate+"/d"}</td><td style={{padding:"6px 8px",borderRadius:"0 6px 6px 0",fontWeight:700,color:c.c,textAlign:"right"}}>{fmt(c.predicted)}</td></tr>)}</tbody></table>
      <Insight text={"If no containers are cleared by "+predDate+", your portfolio accumulates "+fmt(predCost.reduce((s,c)=>s+c.predicted,0))+" in additional charges. Use the planner below to prioritize."}/>
    </Card>

    {/* CHARGE BREAKDOWN */}
    <ChartBox title="D&D Cost Split by Charge Type and Side" sub="All 4 charge types compared across origin and destination" h={200} insight={(()=>{const cats=[{n:"Combined D&D",o:BASE.costMatrix.dnd_origin.total,d:BASE.costMatrix.dnd_destination.total},{n:"Detention",o:BASE.costMatrix.detention_origin.total,d:BASE.costMatrix.detention_destination.total},{n:"Demurrage",o:BASE.costMatrix.demurrage_origin.total,d:BASE.costMatrix.demurrage_destination.total}];const top=cats.reduce((a,b)=>b.o>a.o?b:a);return top.n+" at origin ("+fmt(top.o)+") is the dominant charge type. "+(top.n==="Combined D&D"?"Evaluate whether separate rates would be cheaper in Surcharges tab.":"Focus on reducing origin "+top.n.toLowerCase()+" dwell.");})()}><ResponsiveContainer><BarChart data={chargeData}><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"}/><XAxis dataKey="side" stroke={T.dim} fontSize={10}/><YAxis stroke={T.dim} fontSize={10} tickFormatter={v=>fmt(v)}/><Tooltip content={<CTip/>}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/><Bar dataKey="Detention" fill={T.amber}/><Bar dataKey="Demurrage" fill={T.purple}/><Bar dataKey="Storage" fill={T.green}/><Bar dataKey="Combined D&D" fill={T.red}/></BarChart></ResponsiveContainer></ChartBox>

    {/* PRIORITIZATION PLANNER */}
    <Card style={{marginBottom:14,background:T.actionBg,border:"1px solid "+T.blue+"15",boxShadow:"0 2px 8px rgba(37,99,235,.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div><div style={{fontSize:16,fontWeight:700}}>Container Prioritization Planner</div><div style={{fontSize:9,color:T.sub}}>Filter containers, then compare batches to decide where to deploy resources. Cost avoidance based on prediction date.</div></div>
        <button onClick={resetAll} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+T.border,background:"#fff",color:T.sub,fontSize:9,fontWeight:600,cursor:"pointer"}}>Reset All</button>
      </div>
      {/* TIER 1: SHARED FILTERS */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",padding:"8px 10px",background:"#F0F4F8",borderRadius:10,border:"none",marginBottom:12,boxShadow:"inset 0 1px 2px rgba(0,0,0,.04)"}}>
        <div style={{fontSize:9,fontWeight:700,color:T.blue,display:"flex",alignItems:"center"}}>SHARED:</div>
        {[{label:"Free Period",val:fFpStatus,set:setFFpStatus,opts:["Expired","Expiring Today","Expiring 48h","Green"]},
          {label:"Category",val:fCat,set:setFCat,opts:["Detention","Demurrage","Storage","Combined D&D"]},
          {label:"Risk",val:fRisk,set:setFRisk,opts:["High","Medium","Low"],tip:"High: score ≥ 75. Medium: 50–74. Low: < 50."},
          {label:"Cost Impact",val:fCostBand,set:setFCostBand,opts:["High Impact","Medium","Low"],tip:"Based on prediction date. High: >$3K avoidable. Medium: $1K–$3K. Low: <$1K."}
        ].map(f=><div key={f.label} style={{display:"flex",flexDirection:"column",gap:2}}>
          <span style={{fontSize:9,fontWeight:700,color:T.sub,textTransform:"uppercase",display:"flex",alignItems:"center",gap:2}}>{f.label}{f.tip&&<HoverTip text={f.tip}/>}</span>
          <select value={f.val} onChange={e=>f.set(e.target.value)} style={selStyle}><option value="All">All</option>{f.opts.map(o=><option key={o} value={o}>{o}</option>)}</select>
        </div>)}
        <div style={{display:"flex",alignItems:"flex-end"}}><Badge color={T.blue}>{sharedFiltered.length+" of "+allContainers.length}</Badge></div>
      </div>

      {/* TIER 2: GROUP A vs GROUP B */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 70px 1fr",gap:8}}>
        {/* GROUP A */}
        <div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"6px 8px",background:T.blue+"08",borderRadius:6,marginBottom:6,border:"none",boxShadow:"inset 0 0 0 1px "+T.blue+"15"}}>
            {[{l:"POL",v:aPolF,s:setAPolF,o:filterOpts.pols},{l:"POD",v:aPodF,s:setAPodF,o:filterOpts.pods},{l:"Carrier",v:aCarF,s:setACarF,o:filterOpts.carriers}].map(f=><div key={f.l} style={{display:"flex",flexDirection:"column",gap:1}}><span style={{fontSize:9,fontWeight:700,color:T.blue}}>{f.l}</span><select value={f.v} onChange={e=>f.s(e.target.value)} style={{...selStyle,borderColor:T.blue+"40"}}><option value="All">All</option>{f.o.map(o=><option key={o} value={o}>{o}</option>)}</select></div>)}
            <div style={{display:"flex",flexDirection:"column",gap:1}}><span style={{fontSize:9,fontWeight:700,color:T.blue}}>Top N</span><select value={aTopN} onChange={e=>setATopN(e.target.value)} style={{...selStyle,borderColor:T.blue+"40"}}><option value="All">All</option><option value="5">Top 5</option><option value="10">Top 10</option><option value="20">Top 20</option></select></div>
          </div>
          <GroupSummary data={groupA} color={T.blue} label="Group A"/>
          <div style={{maxHeight:280,overflowY:"auto"}}>
            {groupA.active.map(c=><ContainerCard key={c.cn} c={c}/>)}
            {groupA.excluded.map(c=><ContainerCard key={c.cn} c={c} dimmed/>)}
          </div>
          <div style={{fontSize:10,color:T.dim,marginTop:4,fontStyle:"italic"}}>Verify operational status (customs, documentation) before acting on containers.</div>
        </div>
        {/* VS */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
          <div style={{width:1,flex:1,background:T.border}}/>
          <div style={{fontSize:16,fontWeight:800,color:T.dim}}>VS</div>
          <div style={{background:gAToday>gBToday?T.greenBg:gBToday>gAToday?T.greenBg:T.card2,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
            <div style={{fontSize:9,color:T.sub}}>Today Diff</div>
            <div style={{fontSize:14,fontWeight:800,color:T.green}}>{fmt(Math.abs(gAToday-gBToday))}</div>
            <div style={{fontSize:9,color:T.sub}}>{gAToday>=gBToday?"A avoids more":"B avoids more"}</div>
          </div>
          <div style={{width:1,flex:1,background:T.border}}/>
        </div>
        {/* GROUP B */}
        <div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"6px 8px",background:T.purple+"08",borderRadius:6,marginBottom:6,border:"none",boxShadow:"inset 0 0 0 1px "+T.purple+"15"}}>
            {[{l:"POL",v:bPolF,s:setBPolF,o:filterOpts.pols},{l:"POD",v:bPodF,s:setBPodF,o:filterOpts.pods},{l:"Carrier",v:bCarF,s:setBCarF,o:filterOpts.carriers}].map(f=><div key={f.l} style={{display:"flex",flexDirection:"column",gap:1}}><span style={{fontSize:9,fontWeight:700,color:T.purple}}>{f.l}</span><select value={f.v} onChange={e=>f.s(e.target.value)} style={{...selStyle,borderColor:T.purple+"40"}}><option value="All">All</option>{f.o.map(o=><option key={o} value={o}>{o}</option>)}</select></div>)}
            <div style={{display:"flex",flexDirection:"column",gap:1}}><span style={{fontSize:9,fontWeight:700,color:T.purple}}>Top N</span><select value={bTopN} onChange={e=>setBTopN(e.target.value)} style={{...selStyle,borderColor:T.purple+"40"}}><option value="All">All</option><option value="5">Top 5</option><option value="10">Top 10</option><option value="20">Top 20</option></select></div>
          </div>
          <GroupSummary data={groupB} color={T.purple} label="Group B"/>
          <div style={{maxHeight:280,overflowY:"auto"}}>
            {groupB.active.map(c=><ContainerCard key={c.cn} c={c}/>)}
            {groupB.excluded.map(c=><ContainerCard key={c.cn} c={c} dimmed/>)}
          </div>
          <div style={{fontSize:10,color:T.dim,marginTop:4,fontStyle:"italic"}}>Verify operational status (customs, documentation) before acting on containers.</div>
        </div>
      </div>
      {groupA.active.length>0&&groupB.active.length>0&&(()=>{const aPs=new Set(groupA.active.map(c=>c.po));const bPs=new Set(groupB.active.map(c=>c.po));const aEU=[...aPs].some(p=>p.startsWith("DE")||p.startsWith("NL")||p.startsWith("BE"));const aAS=[...aPs].some(p=>p.startsWith("CN")||p.startsWith("SG")||p.startsWith("TW")||p.startsWith("JP")||p.startsWith("TH")||p.startsWith("MY")||p.startsWith("PH"));const bEU=[...bPs].some(p=>p.startsWith("DE")||p.startsWith("NL")||p.startsWith("BE"));const bAS=[...bPs].some(p=>p.startsWith("CN")||p.startsWith("SG")||p.startsWith("TW")||p.startsWith("JP")||p.startsWith("TH")||p.startsWith("MY")||p.startsWith("PH"));const cross=(aEU&&bAS)||(aAS&&bEU);return cross?<div style={{background:T.amberBg,borderRadius:6,padding:"6px 10px",marginTop:8,borderLeft:"3px solid "+T.amber}}><div style={{fontSize:9,color:T.amber,fontWeight:600}}>{"⚠ These groups span different regions (Europe vs Asia). Resources typically cannot be shared across continents. Consider comparing ports within the same region."}</div></div>:null;})()}
      {/* DECISION BAR */}
      {(groupA.active.length>0||groupB.active.length>0)&&<div style={{background:"#fff",borderRadius:8,padding:10,marginTop:10,border:"1px solid "+T.green+"40"}}>
        <div style={{fontSize:11,fontWeight:700,color:T.green}}>{"Recommendation: "+(gAToday>=gBToday?"Group A":"Group B")+" avoids "+fmt(Math.abs(gAToday-gBToday))+" more based on today's prediction."}</div>
        <div style={{fontSize:9,color:T.sub}}>{"Acting on "+(gAToday>=gBToday?"Group A":"Group B")+"'s top containers avoids "+fmt(Math.max(gAToday,gBToday))+" this period at "+fmt(Math.max(gAToday>=gBToday?groupA.active.reduce((s,c)=>s+c.daily,0):groupB.active.reduce((s,c)=>s+c.daily,0),0))+"/day burn."}</div>
      </div>}
                  {(groupA.active.length>0||groupB.active.length>0)&&<div style={{marginTop:10}}><ChartBox title="Group Comparison" sub="Today (blue) vs +3d (green) vs +7d (red)" h={140}><ResponsiveContainer><BarChart data={[{name:"Group A",Today:gAToday,"+3d":gA3d,"+7d":gA7d},{name:"Group B",Today:gBToday,"+3d":gB3d,"+7d":gB7d}]}><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"}/><XAxis dataKey="name" stroke={T.dim} fontSize={10}/><YAxis stroke={T.dim} fontSize={10} tickFormatter={v=>fmt(v)}/><Tooltip formatter={v=>fmt(v)}/><Bar dataKey="Today" fill={T.blue} radius={[3,3,0,0]}/><Bar dataKey="+3d" fill={T.green} radius={[3,3,0,0]}/><Bar dataKey="+7d" fill={T.red} radius={[3,3,0,0]}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/></BarChart></ResponsiveContainer></ChartBox></div>}
    </Card>

    <Card style={{marginTop:14}}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Actionable Observations</div>
      {(()=>{const detFP=BASE.costMatrix.detention_origin.avgFP;const detAvg=BASE.stageDays.origin_detention.avg;const detUtil=Math.round(detAvg/detFP*100);const combPct=Math.round(BASE.costMatrix.dnd_origin.total/BASE.grandTotal*100);const sepT=BASE.costMatrix.detention_origin.total+BASE.costMatrix.demurrage_origin.total;const combPrem=sepT>0?Math.round((BASE.costMatrix.dnd_origin.total-sepT)/sepT*100):0;const top3=allContainers.slice(0,3);const top3burn=top3.reduce((s,c)=>s+c.daily,0);const top3sav=top3.reduce((s,c)=>s+c.sav3d,0);const maxODet=Math.max(...top3.map(c=>c.oDet));return[{c:T.green,t:"Origin detention at "+detUtil+"% free-time utilization",b:"Avg "+detAvg+"d vs "+detFP+"d free. "+(detUtil>90?"Any delay triggers charges immediately.":"Some buffer remains but monitor closely."),a:"Coordinate with depot to ensure gate-in within "+Math.floor(detFP)+" days of pickup."},
        {c:T.amber,t:"Combined D&D origin = "+combPct+"% of total cost",b:"Combined rate is "+combPrem+"% more expensive than separate on origin lanes.",a:"Evaluate switching to separate rates in Surcharges tab."},
        {c:T.red,t:"Top 3 containers burn "+fmt(top3burn)+"/day combined",b:"These have been in origin detention for "+Math.round(maxODet)+"+ days, deep in higher tier rates.",a:"Clearing within 3 days avoids "+fmt(top3sav)+" in additional charges."}]})().map((ins,i)=><div key={i} style={{background:T.card2,borderRadius:8,padding:10,marginBottom:6,borderLeft:"3px solid "+ins.c}}><div style={{fontSize:11,fontWeight:600,marginBottom:2}}>{ins.t}</div><div style={{fontSize:11,color:T.sub,lineHeight:1.4}}>{"Because: "+ins.b}</div><div style={{fontSize:11,color:ins.c,fontWeight:600}}>{"Action: "+ins.a}</div></div>)}
    </Card>
  </div>);
}

// ═══ MODULE 5: HISTORICAL ═══
function HistoryPage({setPage,navToSurcharges}){
  const[trendFilter,setTrendFilter]=useState("all");const[portTab,setPortTab]=useState("pol");
  const monthlyCost=useMemo(()=>{if(trendFilter==="all")return BASE.monthlyCost;return BASE.monthlyCost.map(m=>trendFilter==="origin"?{...m,detention:m.oDetention,demurrage:m.oDemurrage,storage:m.oStorage,combined:m.oCombined}:{...m,detention:m.dDetention,demurrage:m.dDemurrage,storage:m.dStorage,combined:m.dCombined});},[trendFilter]);
  const stageData=useMemo(()=>[
    {stage:"Origin Depot",costType:"Detention",avgDays:BASE.stageDays.origin_detention.avg,cost:BASE.costMatrix.detention_origin.total,color:T.amber,freeTime:BASE.costMatrix.detention_origin.avgFP,breach:Math.max(0,BASE.stageDays.origin_detention.avg-BASE.costMatrix.detention_origin.avgFP),prevent:"Faster documentation, earlier truck booking"},
    {stage:"Origin Port",costType:"Demurrage",avgDays:BASE.stageDays.origin_demurrage.avg,cost:BASE.costMatrix.demurrage_origin.total,color:T.purple,freeTime:BASE.costMatrix.demurrage_origin.avgFP,breach:Math.max(0,BASE.stageDays.origin_demurrage.avg-BASE.costMatrix.demurrage_origin.avgFP),prevent:"Monitor vessel schedules, ensure booking alignment"},
    {stage:"Combined Origin",costType:"Combined",avgDays:BASE.stageDays.combined_origin.avg,cost:BASE.costMatrix.dnd_origin.total,color:T.red,freeTime:BASE.costMatrix.dnd_origin.avgFP,breach:Math.max(0,BASE.stageDays.combined_origin.avg-BASE.costMatrix.dnd_origin.avgFP),prevent:"Negotiate longer combined free period"},
    {stage:"Dest Port",costType:"Demurrage",avgDays:BASE.stageDays.dest_demurrage.avg,cost:BASE.costMatrix.demurrage_destination.total,color:T.purple,freeTime:BASE.costMatrix.demurrage_destination.avgFP,breach:Math.max(0,BASE.stageDays.dest_demurrage.avg-BASE.costMatrix.demurrage_destination.avgFP),prevent:"Advance customs clearance, pre-arrange warehouse"},
    {stage:"Dest Depot",costType:"Detention",avgDays:BASE.stageDays.dest_detention.avg,cost:BASE.costMatrix.detention_destination.total,color:T.amber,freeTime:BASE.costMatrix.detention_destination.avgFP,breach:Math.max(0,BASE.stageDays.dest_detention.avg-BASE.costMatrix.detention_destination.avgFP),prevent:"Ensure truck availability at destination"},
    {stage:"Combined Dest",costType:"Combined",avgDays:BASE.stageDays.combined_dest.avg,cost:BASE.costMatrix.dnd_destination.total,color:T.red,freeTime:BASE.costMatrix.dnd_destination.avgFP,breach:Math.max(0,BASE.stageDays.combined_dest.avg-BASE.costMatrix.dnd_destination.avgFP),prevent:"Monitor destination process overall"}
  ],[]);
  const totalStageCost=stageData.reduce((s,c)=>s+c.cost,0);
  const polData=useMemo(()=>{const m={};BASE.topLanes.forEach(l=>{const p=l.lane.slice(0,5);if(!m[p])m[p]={port:p,containers:0,tODet:0,tODem:0};m[p].containers+=l.containers;m[p].tODet+=l.avgODet*l.containers;m[p].tODem+=l.avgODem*l.containers;});return Object.values(m).map(p=>({...p,avgODet:+(p.tODet/p.containers).toFixed(2),avgODem:+(p.tODem/p.containers).toFixed(2),totalDwell:+((p.tODet+p.tODem)/p.containers).toFixed(2),score:Math.round((p.tODet/p.containers)*.6+(p.tODem/p.containers)*.4)})).sort((a,b)=>b.score-a.score);},[]);
  const podData=useMemo(()=>{const m={};BASE.topLanes.forEach(l=>{const p=l.lane.slice(6,11);if(!m[p])m[p]={port:p,containers:0,tDDem:0,tDDet:0};m[p].containers+=l.containers;m[p].tDDem+=l.avgDDem*l.containers;m[p].tDDet+=l.avgDDet*l.containers;});return Object.values(m).map(p=>({...p,avgDDem:+(p.tDDem/p.containers).toFixed(2),avgDDet:+(p.tDDet/p.containers).toFixed(2),totalDwell:+((p.tDDem+p.tDDet)/p.containers).toFixed(2),score:Math.round((p.tDDem/p.containers)*.5+(p.tDDet/p.containers)*.5)})).sort((a,b)=>b.score-a.score);},[]);
  const portfolioAvg=useMemo(()=>{const all=portTab==="pol"?polData:podData;const t=all.reduce((s,p)=>s+p.totalDwell*p.containers,0);const c=all.reduce((s,p)=>s+p.containers,0);return c>0?+(t/c).toFixed(1):0;},[polData,podData,portTab]);
  const globalAvg=BASE.topLanes.reduce((s,l)=>s+(l.avgODet+l.avgODem+l.avgDDem+l.avgDDet),0)/BASE.topLanes.length;
  const lanes=useMemo(()=>BASE.topLanes.map(l=>{const td=l.avgODet+l.avgODem+l.avgDDem+l.avgDDet;const fp=BASE.costMatrix.dnd_origin.avgFP;const bp=Math.max(0,+(td-fp).toFixed(2));const cpc=Math.round(bp*72);return{...l,totalDwell:+td.toFixed(2),costPerContainer:cpc,beyondFP:bp};}).sort((a,b)=>b.costPerContainer-a.costPerContainer),[]);

  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    <SH title="Historical Analysis" sub="Are your improvement initiatives working? Track trends, decompose changes, benchmark ports and lanes."/>
    <div style={{display:"flex",gap:6,marginBottom:10}}>{[{k:"all",l:"All"},{k:"origin",l:"Origin"},{k:"destination",l:"Destination"}].map(f=><Pill key={f.k} active={trendFilter===f.k} onClick={()=>setTrendFilter(f.k)} color={T.blue}>{f.l}</Pill>)}</div>
    <ChartBox title="Monthly D&D Cost Trend" sub={"Showing: "+(trendFilter==="all"?"All (Origin + Destination)":trendFilter==="origin"?"Origin only":"Destination only")} h={260} insight={(()=>{const peak=monthlyCost.reduce((a,b)=>b.total>a.total?b:a,monthlyCost[0]);const curr=monthlyCost[monthlyCost.length-1];const peakCpc=peak.containers>0?Math.round(peak.total/peak.containers):0;const currCpc=curr.containers>0?Math.round(curr.total/curr.containers):0;return "Peak: "+peak.month+" ("+fmt(peak.total)+" across "+(peak.containers||0)+" containers, $"+peakCpc+"/ea). Latest: "+curr.month+" ("+fmt(curr.total)+", $"+currCpc+"/ea)."+(currCpc<peakCpc?" Cost/container declined, confirming operational improvement.":" Monitor cost/container trend.");})()}><ResponsiveContainer><AreaChart data={monthlyCost}><defs>{[{id:"gd",c:T.amber},{id:"gm",c:T.purple},{id:"gs",c:T.green},{id:"gc",c:T.red}].map(g=><linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={g.c} stopOpacity={.3}/><stop offset="100%" stopColor={g.c} stopOpacity={.05}/></linearGradient>)}</defs><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"} vertical={false}/><XAxis dataKey="month" stroke={T.dim} fontSize={10}/><YAxis stroke={T.dim} fontSize={10} tickFormatter={v=>fmt(v)}/><Tooltip content={<CTip/>}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/><Area type="monotone" dataKey="detention" name="Detention" stackId="1" stroke={T.amber} fill="url(#gd)"/><Area type="monotone" dataKey="demurrage" name="Demurrage" stackId="1" stroke={T.purple} fill="url(#gm)"/><Area type="monotone" dataKey="storage" name="Storage" stackId="1" stroke={T.green} fill="url(#gs)"/><Area type="monotone" dataKey="combined" name="Combined" stackId="1" stroke={T.red} fill="url(#gc)"/></AreaChart></ResponsiveContainer></ChartBox>


    {/* PERIOD COMPARISON */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,margin:"12px 0"}}>
      {(()=>{const mc=monthlyCost;if(mc.length<2)return null;const prev=mc[mc.length-2];const curr=mc[mc.length-1];const costChg=prev.total>0?Math.round((curr.total-prev.total)/prev.total*100):0;const cnChg=prev.containers>0?Math.round(((curr.containers||0)-(prev.containers||0))/(prev.containers||1)*100):0;const prevCpc=prev.containers>0?Math.round(prev.total/prev.containers):0;const currCpc=curr.containers>0?Math.round(curr.total/curr.containers):0;const cpcChg=prevCpc>0?Math.round((currCpc-prevCpc)/prevCpc*100):0;return [{l:"Cost Change",v:(costChg>0?"+":"")+costChg+"%",c:costChg<=0?T.green:T.red,d:prev.month+"→"+curr.month},{l:"Containers",v:(cnChg>0?"+":"")+cnChg+"%",c:cnChg<=0?T.green:T.red,d:(prev.containers||0)+"→"+(curr.containers||0)},{l:"Cost/Container",v:(cpcChg>0?"+":"")+cpcChg+"%",c:cpcChg<=0?T.green:T.red,d:"$"+prevCpc+"→$"+currCpc},{l:"Trend Direction",v:costChg<=0&&cpcChg<=0?"Improving":"Needs Attention",c:costChg<=0&&cpcChg<=0?T.green:T.amber,d:costChg<=0?"Costs declining":"Costs rising"}].map(m=><Card key={m.l} style={{padding:10,textAlign:"center"}}><div style={{fontSize:10,color:T.sub}}>{m.d}</div><div style={{fontSize:18,fontWeight:700,color:m.c}}>{m.v}</div><div style={{fontSize:10,color:T.sub}}>{m.l}</div></Card>);})()}
    </div>

    <div style={{display:"flex",gap:0,marginTop:4,marginBottom:4}}>{monthlyCost.map((m,i)=><div key={i} style={{flex:1,textAlign:"center",padding:"4px 0",background:T.card2,border:"1px solid "+T.border,borderRadius:i===0?"6px 0 0 6px":i===monthlyCost.length-1?"0 6px 6px 0":"0"}}><div style={{fontSize:10,color:T.sub}}>{m.month}</div><div style={{fontSize:11,fontWeight:700,color:T.text}}>{(m.containers||0).toLocaleString()}</div><div style={{fontSize:9,color:T.dim}}>containers</div></div>)}</div>

    <Card style={{marginTop:14}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Stage-Wise Cost Contribution</div><div style={{fontSize:11,color:T.sub,marginBottom:10}}>Which journey stages drive cost? Focus on "Over" rows and follow the prevention recommendation.</div>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:10}}>
        <thead><tr style={{color:T.dim,fontSize:10,textAlign:"left"}}>{["Stage","Type","Avg","Free","Breach","Cost","%","Status","Prevention Focus"].map(h=><th key={h} style={{padding:"3px 5px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}{h==="Status"&&<HoverTip text={"Over: breach > 1d beyond free. Near: 0–1d. OK: within free period."}/>}{h==="Breach"&&<HoverTip text={"Avg dwell minus free period. Positive = days in paid tier."}/>}</th>)}</tr></thead>
        <tbody>{stageData.map((s,i)=>{const pct=Math.round(s.cost/totalStageCost*100);const v=s.breach>1?{t:"Over",c:T.red}:s.breach>0?{t:"Near",c:T.amber}:{t:"OK",c:T.green};return <tr key={i} style={{background:T.card2}}><td style={{padding:"4px 5px",borderRadius:"5px 0 0 5px",fontWeight:600}}>{s.stage}</td><td style={{padding:"4px 5px"}}><Badge color={s.color}>{s.costType}</Badge></td><td style={{padding:"4px 5px",fontWeight:600}}>{s.avgDays.toFixed(1)}d</td><td style={{padding:"4px 5px",color:T.green}}>{s.freeTime}d</td><td style={{padding:"4px 5px",color:s.breach>0?T.red:T.green,fontWeight:700}}>{s.breach.toFixed(1)}d</td><td style={{padding:"4px 5px",color:s.color,fontWeight:600,textAlign:"right"}}>{fmt(s.cost)}</td><td style={{padding:"4px 5px",textAlign:"right"}}>{pct}%</td><td style={{padding:"4px 5px"}}><SolidBadge color={v.c}>{v.t}</SolidBadge></td><td style={{padding:"4px 5px",fontSize:10,color:T.sub,borderRadius:"0 5px 5px 0"}}>{s.prevent}</td></tr>;})}</tbody>
      </table>
    </Card>

    <Card style={{marginTop:14}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Port Benchmarking</div><div style={{fontSize:11,color:T.sub,marginBottom:6}}>Compare port performance. Ports above the portfolio average line are underperforming.</div>
      <div style={{display:"flex",gap:6,marginBottom:10}}><Pill active={portTab==="pol"} onClick={()=>setPortTab("pol")} color={T.amber}>Origin (POL)</Pill><Pill active={portTab==="pod"} onClick={()=>setPortTab("pod")} color={T.purple}>Dest (POD)</Pill></div>
      <ChartBox title="Avg Dwell by Port" h={200}><ResponsiveContainer><BarChart data={(portTab==="pol"?polData:podData).slice(0,8)} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"} vertical={false}/><XAxis type="number" stroke={T.dim} fontSize={10} tickFormatter={v=>v+"d"}/><YAxis type="category" dataKey="port" width={55} stroke={T.dim} fontSize={10}/><Tooltip content={<CTip/>}/><ReferenceLine x={portfolioAvg} stroke={T.blue} strokeDasharray="6 3" label={{value:"Avg: "+portfolioAvg+"d",position:"top",fontSize:9,fill:T.blue}}/>{portTab==="pol"?[<Bar key="d" dataKey="avgODet" name="Det" fill={T.amber} stackId="p"/>,<Bar key="m" dataKey="avgODem" name="Dem" fill={T.purple} stackId="p" radius={[0,3,3,0]}/>]:[<Bar key="d" dataKey="avgDDem" name="Dem" fill={T.purple} stackId="p"/>,<Bar key="m" dataKey="avgDDet" name="Det" fill={T.amber} stackId="p" radius={[0,3,3,0]}/>]}</BarChart></ResponsiveContainer></ChartBox>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:10,marginTop:8}}><thead><tr style={{color:T.dim,fontSize:10,textAlign:"left"}}>{["Port","Vol",portTab==="pol"?"Det":"Dem",portTab==="pol"?"Dem":"Det","Total","Dwell Score","Rating"].map(h=><th key={h} style={{padding:"4px 7px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:["Vol","Dwell Score"].includes(h)?"right":"left"}}>{h}{h==="Dwell Score"&&<HoverTip text={"Weighted avg dwell. Origin: 60% detention + 40% demurrage. Dest: 50/50. Higher = worse."}/>}{h==="Rating"&&<HoverTip text={"High: score > 8. Monitor: 5–8. OK: < 5."}/>}</th>)}</tr></thead>
      <tbody>{(portTab==="pol"?polData:podData).map((p,i)=>{const r=p.score>8?{t:"High",c:T.red}:p.score>5?{t:"Monitor",c:T.amber}:{t:"OK",c:T.green};return <tr key={i} style={{background:T.card2}}><td style={{padding:"6px 7px",borderRadius:"6px 0 0 6px",fontWeight:600,fontFamily:"monospace"}}>{p.port}</td><td style={{padding:"6px 7px",color:T.sub,textAlign:"right"}}>{p.containers}</td><td style={{padding:"6px 7px",color:T.amber,fontWeight:700}}>{(portTab==="pol"?p.avgODet:p.avgDDem)+"d"}</td><td style={{padding:"6px 7px",color:T.purple,fontWeight:700}}>{(portTab==="pol"?p.avgODem:p.avgDDet)+"d"}</td><td style={{padding:"6px 7px",fontWeight:700}}>{p.totalDwell}d</td><td style={{padding:"6px 7px",fontWeight:700,textAlign:"right",color:p.score>8?T.red:p.score>5?T.amber:T.green}}>{p.score}</td><td style={{padding:"6px 7px",borderRadius:"0 6px 6px 0"}}><SolidBadge color={r.c}>{r.t}</SolidBadge></td></tr>;})}</tbody></table>
    </Card>
    <div style={{marginTop:14}}>
      <SH title="Top Lane Performance" sub="Cost per container with freight vs surcharge split. Lanes with D&D >35% are flagged. Click any lane row to open its negotiation analysis in Surcharges."/>
      <ChartBox title="Freight vs D&D Surcharge Split by Lane" sub="Blue = base freight. Red = D&D surcharge component." h={220} insight={"CNSHA-NLRTM has 45% surcharge ratio — nearly half the lane cost is avoidable D&D. Review carrier terms on this route."} nav={<NavLink text="Negotiate better terms → Surcharges" onClick={()=>navToSurcharges(null)}/>}><ResponsiveContainer><BarChart data={lanes.slice(0,10).map(l=>{const fp=l.freightPct||65;const sp=l.surchargePct||35;return{lane:l.lane,Freight:Math.round(l.costPerContainer*fp/100),"D&D Surcharge":Math.round(l.costPerContainer*sp/100)};})} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"} vertical={false}/><XAxis type="number" stroke={T.dim} fontSize={10} tickFormatter={v=>"$"+v}/><YAxis type="category" dataKey="lane" width={100} stroke={T.dim} fontSize={9}/><Tooltip content={<CTip/>}/><Legend formatter={v=><span style={{fontSize:9,color:T.sub}}>{v}</span>}/><Bar dataKey="Freight" stackId="l" fill={T.blue} name="Base Freight"/><Bar dataKey="D&D Surcharge" stackId="l" fill={T.red} name="D&D Surcharge" radius={[0,3,3,0]}/></BarChart></ResponsiveContainer></ChartBox>
      <Card style={{marginTop:8}}><table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:11}}><thead><tr style={{color:T.dim,fontSize:10,textAlign:"left"}}>{["Lane","Vol","O.Det","O.Dem","D.Dem","D.Det","Total","BFP","$/Container","Dwell Score"].map(h=><th key={h} style={{padding:"5px 7px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:["Vol","$/Container","Dwell Score"].includes(h)?"right":"left"}}>{h}{h==="BFP"&&<HoverTip text={"Days Beyond Free Period. Total dwell minus 9.9d combined FP."}/>}{h==="Dwell Score"&&<HoverTip text={"High: total dwell > 15d. Med: > 10d. Low: ≤ 10d."}/>}</th>)}</tr></thead>
        <tbody>{lanes.map((l,i)=>{const rk=l.totalDwell>15?"High":l.totalDwell>10?"Med":"Low";const rc=rk==="High"?T.red:rk==="Med"?T.amber:T.green;const sFlag=(l.surchargePct||35)>35;return <tr key={i} onClick={()=>navToSurcharges(l)} style={{background:sFlag?T.redBg+"60":T.card2,cursor:"pointer",transition:"filter .15s"}} onMouseEnter={e=>e.currentTarget.style.filter="brightness(0.96)"} onMouseLeave={e=>e.currentTarget.style.filter=""}><td style={{padding:"7px",borderRadius:"6px 0 0 6px",fontWeight:600,fontFamily:"monospace",fontSize:10}}>{l.lane}{sFlag&&<span style={{fontSize:9,color:T.red,marginLeft:4}}>{"D&D>"+(l.surchargePct||35)+"%"}</span>}</td><td style={{padding:"7px",color:T.sub,textAlign:"right"}}>{l.containers}</td><td style={{padding:"7px",color:T.amber,fontWeight:700}}>{l.avgODet.toFixed(1)}d</td><td style={{padding:"7px",color:T.purple,fontWeight:700}}>{l.avgODem.toFixed(1)}d</td><td style={{padding:"7px",color:T.purple,fontWeight:700}}>{l.avgDDem.toFixed(1)}d</td><td style={{padding:"7px",color:T.red,fontWeight:700}}>{l.avgDDet.toFixed(1)}d</td><td style={{padding:"7px",fontWeight:600}}>{l.totalDwell.toFixed(1)}d</td><td style={{padding:"7px",color:l.beyondFP>0?T.red:T.green,fontWeight:600}}>{l.beyondFP}d</td><td style={{padding:"7px",fontWeight:700,textAlign:"right",color:l.costPerContainer>500?T.red:l.costPerContainer>200?T.amber:T.green}}>{"$"+l.costPerContainer}</td><td style={{padding:"7px",borderRadius:"0 6px 6px 0",textAlign:"right"}}><div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4}}><SolidBadge color={rc}>{rk}</SolidBadge><span style={{fontSize:9,color:T.blueL,fontWeight:600,whiteSpace:"nowrap"}}>Negotiate →</span></div></td></tr>;})}</tbody></table></Card>
    </div>
  </div>);
}

// ═══ MODULE 6: SURCHARGES ═══
function LaneFocusPanel({lane,onClear,onBack}){
  if(!lane)return null;
  const spct=lane.surchargePct||35;const fpct=lane.freightPct||65;
  const negText=lane.beyondFP>0
    ?"Avg dwell exceeds free period by "+lane.beyondFP+"d across "+lane.containers+" containers. Ask for "+Math.ceil(lane.beyondFP+1)+" additional free days on renewal — data supports it."
    :"Dwell is within free period on this lane. If surcharge % is above 35%, negotiate a rate reduction rather than more free days.";
  return <Card style={{marginBottom:18,borderLeft:"4px solid "+T.blue,background:T.blueBg}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{fontSize:15,fontWeight:700,fontFamily:"monospace",color:T.text}}>{lane.lane}</span>
          <Badge color={T.blue}>{lane.containers} containers</Badge>
          {spct>35&&<SolidBadge color={T.red}>{"D&D "+spct+"% of cost — flag for negotiation"}</SolidBadge>}
          {spct<=35&&<SolidBadge color={T.green}>{"D&D "+spct+"% — acceptable"}</SolidBadge>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:10}}>
          {[{l:"O. Detention",v:lane.avgODet.toFixed(1)+"d",c:T.amber,fp:"5.1d free",over:lane.avgODet>5.1},
            {l:"O. Demurrage",v:lane.avgODem.toFixed(1)+"d",c:T.purple,fp:"3.1d free",over:lane.avgODem>3.1},
            {l:"D. Demurrage",v:lane.avgDDem.toFixed(1)+"d",c:T.purple,fp:"3.0d free",over:lane.avgDDem>3.0},
            {l:"D. Detention",v:lane.avgDDet.toFixed(1)+"d",c:T.amber,fp:"6.0d free",over:lane.avgDDet>6.0},
            {l:"$/Container",v:"$"+lane.costPerContainer,c:lane.costPerContainer>500?T.red:T.amber,fp:lane.beyondFP>0?lane.beyondFP+"d beyond FP":"Within free period",over:lane.beyondFP>0}
          ].map(x=><div key={x.l} style={{background:"#fff",borderRadius:8,padding:"8px 10px",borderTop:"2px solid "+(x.over?T.red:x.c),position:"relative"}}>
            {x.over&&<div style={{position:"absolute",top:4,right:6,fontSize:8,color:T.red,fontWeight:700}}>OVER</div>}
            <div style={{fontSize:9,color:T.sub}}>{x.l}</div>
            <div style={{fontSize:15,fontWeight:700,color:x.over?T.red:x.c}}>{x.v}</div>
            <div style={{fontSize:9,color:T.dim}}>{x.fp}</div>
          </div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div style={{background:"#fff",borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:6}}>Freight vs D&D Surcharge</div>
            <div style={{display:"flex",height:12,borderRadius:6,overflow:"hidden",marginBottom:6}}>
              <div style={{width:fpct+"%",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:"#fff",fontWeight:700}}>{fpct+"%"}</span></div>
              <div style={{width:spct+"%",background:T.red,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:"#fff",fontWeight:700}}>{spct+"%"}</span></div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
              <span style={{color:T.blue,fontWeight:600}}>Base Freight</span>
              <span style={{color:T.red,fontWeight:600}}>D&D Surcharge</span>
            </div>
          </div>
          <div style={{background:"#fff",borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:10,fontWeight:700,color:T.sub,marginBottom:4}}>Negotiation Position</div>
            <div style={{fontSize:11,color:T.text,lineHeight:1.5}}>{negText}</div>
          </div>
        </div>
      </div>
      <button onClick={onClear} style={{background:"none",border:"none",cursor:"pointer",marginLeft:12,padding:4}}><X size={16} color={T.dim}/></button>
    </div>
    {onBack&&<NavLink text="← Back to Lane Performance in Historical" onClick={onBack}/>}
  </Card>;
}

function SurchargePage({setPage,selectedLane,clearLane}){
  const lanes=useMemo(()=>BASE.topLanes.map(l=>{const td=l.avgODet+l.avgODem+l.avgDDem+l.avgDDet;const fp=BASE.costMatrix.dnd_origin.avgFP;const bp=Math.max(0,+(td-fp).toFixed(2));const cpc=Math.round(bp*72);return{...l,totalDwell:+td.toFixed(2),costPerContainer:cpc,beyondFP:bp};}).sort((a,b)=>b.costPerContainer-a.costPerContainer),[]);
  const[activeLane,setActiveLane]=useState(()=>selectedLane||null);
  const cats=[{name:"Detention — Origin",side:"Origin",total:49169,containers:261,avgFP:5.1,color:T.amber},{name:"Detention — Dest",side:"Dest",total:1955,containers:8,avgFP:6.0,color:T.amber},{name:"Demurrage — Origin",side:"Origin",total:22353,containers:52,avgFP:3.1,color:T.purple},{name:"Demurrage — Dest",side:"Dest",total:5144,containers:12,avgFP:3.0,color:T.purple},{name:"Storage — Origin",side:"Origin",total:3075,containers:23,avgFP:3.1,color:T.green},{name:"Storage — Dest",side:"Dest",total:1295,containers:9,avgFP:3.0,color:T.green},{name:"Combined — Origin",side:"Origin",total:99565,containers:212,avgFP:9.9,color:T.red},{name:"Combined — Dest",side:"Dest",total:1814,containers:4,avgFP:12.0,color:T.red}];
  const detO=49169,demO=22353,dndO=99565,detD=1955,demD=5144,dndD=1814;
  return (<div style={{padding:"20px 28px",width:"100%",boxSizing:"border-box"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
      <div>
        <div style={{color:T.text,fontSize:15,fontWeight:700}}>Surcharge Intelligence</div>
        <div style={{color:T.sub,fontSize:11,marginTop:2}}>Pick a lane to build your negotiation position, or review portfolio-level rate structure below.</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:11,color:T.sub}}>Select lane:</span>
        <select value={activeLane?activeLane.lane:""} onChange={e=>{const l=lanes.find(x=>x.lane===e.target.value)||null;setActiveLane(l);if(!l&&clearLane)clearLane();}}
          style={{padding:"6px 10px",borderRadius:8,border:"1px solid "+T.border,fontSize:11,color:T.text,background:"#fff",cursor:"pointer"}}>
          <option value="">All Lanes (Portfolio View)</option>
          {lanes.map(l=><option key={l.lane} value={l.lane}>{l.lane} — {(l.surchargePct||35)>35?"⚠ D&D "+(l.surchargePct||35)+"%":"D&D "+(l.surchargePct||35)+"%"}</option>)}
        </select>
      </div>
    </div>
    <LaneFocusPanel lane={activeLane} onClear={()=>{setActiveLane(null);if(clearLane)clearLane();}} onBack={activeLane?()=>{setActiveLane(null);if(clearLane)clearLane();setPage("history");}:null}/>

    {activeLane?(()=>{
      // Portfolio averages for benchmark
      const portAvgODet=+(BASE.topLanes.reduce((s,l)=>s+l.avgODet*l.containers,0)/BASE.topLanes.reduce((s,l)=>s+l.containers,0)).toFixed(1);
      const portAvgODem=+(BASE.topLanes.reduce((s,l)=>s+l.avgODem*l.containers,0)/BASE.topLanes.reduce((s,l)=>s+l.containers,0)).toFixed(1);
      const portAvgDDem=+(BASE.topLanes.reduce((s,l)=>s+l.avgDDem*l.containers,0)/BASE.topLanes.reduce((s,l)=>s+l.containers,0)).toFixed(1);
      const portAvgDDet=+(BASE.topLanes.reduce((s,l)=>s+l.avgDDet*l.containers,0)/BASE.topLanes.reduce((s,l)=>s+l.containers,0)).toFixed(1);
      // Rate structure: if both O.Det > det FP AND O.Dem > dem FP → combined free period (9.9d) covers both → combined may be better
      const oDetOver=activeLane.avgODet>5.1;const oDemOver=activeLane.avgODem>3.1;
      const combinedTotal=activeLane.avgODet+activeLane.avgODem;
      const combinedFP=9.9;
      const combinedSaves=combinedTotal<combinedFP;
      const rateRec=combinedSaves?"Combined D&D rate is better for this lane — combined free period ("+combinedFP+"d) covers the total dwell of "+combinedTotal.toFixed(1)+"d.":"Separate rates are better — combined free period ("+combinedFP+"d) does not cover total dwell ("+combinedTotal.toFixed(1)+"d). Pay for each independently to isolate exposure.";
      // Free period asks specific to this lane
      const fpAsks=[
        {label:"Origin Detention",laneAvg:activeLane.avgODet,fp:5.1,color:T.amber},
        {label:"Origin Demurrage",laneAvg:activeLane.avgODem,fp:3.1,color:T.purple},
        {label:"Dest Demurrage",laneAvg:activeLane.avgDDem,fp:3.0,color:T.purple},
        {label:"Dest Detention",laneAvg:activeLane.avgDDet,fp:6.0,color:T.amber},
      ];
      // Negotiation script
      const overItems=fpAsks.filter(x=>x.laneAvg>x.fp);
      const scriptLines=[
        "On lane "+activeLane.lane+", our average dwell across "+activeLane.containers+" containers is "+activeLane.totalDwell.toFixed(1)+"d total.",
        overItems.length>0?"We are consistently exceeding free period on: "+overItems.map(x=>x.label+" ("+x.laneAvg.toFixed(1)+"d vs "+x.fp+"d free)").join(", ")+".":"All dwell metrics are within free period on this lane — focus the conversation on reducing the surcharge percentage.",
        activeLane.beyondFP>0?"We are asking for "+Math.ceil(activeLane.beyondFP+1)+" additional free days to match our operational reality.":"We request a reduction in the D&D surcharge rate for this lane from "+(activeLane.surchargePct||35)+"% to below 30% of total invoice.",
        "Portfolio benchmark: our avg O. Detention is "+portAvgODet+"d and this lane is "+activeLane.avgODet.toFixed(1)+"d. "+(activeLane.avgODet>portAvgODet?"This lane is "+((activeLane.avgODet-portAvgODet).toFixed(1))+"d above portfolio average — a structural issue, not a one-off.":"This lane is performing within portfolio norms.")
      ];
      return <>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          {/* Lane vs Portfolio Benchmark */}
          <Card>
            <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Lane vs Portfolio Benchmark</div>
            <div style={{fontSize:11,color:T.sub,marginBottom:10}}>How does this lane compare to your portfolio average? Red = lane is worse.</div>
            <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:11}}>
              <thead><tr style={{color:T.dim,fontSize:9}}>{["Metric","This Lane","Portfolio Avg","Diff"].map(h=><th key={h} style={{padding:"3px 6px",fontWeight:600,textAlign:h==="Metric"?"left":"right"}}>{h}</th>)}</tr></thead>
              <tbody>{[
                {label:"O. Detention",lane:activeLane.avgODet,port:portAvgODet,c:T.amber},
                {label:"O. Demurrage",lane:activeLane.avgODem,port:portAvgODem,c:T.purple},
                {label:"D. Demurrage",lane:activeLane.avgDDem,port:portAvgDDem,c:T.purple},
                {label:"D. Detention",lane:activeLane.avgDDet,port:portAvgDDet,c:T.amber},
              ].map((r,i)=>{const diff=+(r.lane-r.port).toFixed(1);const worse=diff>0;return <tr key={i} style={{background:worse?T.redBg+"50":T.greenBg+"50"}}>
                <td style={{padding:"5px 6px",borderRadius:"5px 0 0 5px",fontWeight:500,color:T.sub}}>{r.label}</td>
                <td style={{padding:"5px 6px",textAlign:"right",fontWeight:700,color:r.c}}>{r.lane.toFixed(1)}d</td>
                <td style={{padding:"5px 6px",textAlign:"right",color:T.dim}}>{r.port}d</td>
                <td style={{padding:"5px 6px",textAlign:"right",borderRadius:"0 5px 5px 0",fontWeight:700,color:worse?T.red:T.green}}>{worse?"+":""}{diff}d</td>
              </tr>;})}
              </tbody>
            </table>
          </Card>
          {/* Rate Structure Recommendation */}
          <Card>
            <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Rate Structure for This Lane</div>
            <div style={{fontSize:11,color:T.sub,marginBottom:10}}>Should this lane use Combined D&D or separate Detention + Demurrage rates?</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
              {[{t:"O. Detention",v:activeLane.avgODet.toFixed(1)+"d",fp:"5.1d",over:oDetOver,c:T.amber},{t:"O. Demurrage",v:activeLane.avgODem.toFixed(1)+"d",fp:"3.1d",over:oDemOver,c:T.purple},{t:"Combined FP",v:combinedFP+"d",fp:"vs "+combinedTotal.toFixed(1)+"d total",over:!combinedSaves,c:T.red}].map((x,i)=><div key={i} style={{background:T.card2,borderRadius:8,padding:"8px 10px",borderTop:"2px solid "+(x.over?T.red:T.green)}}>
                <div style={{fontSize:9,color:T.sub}}>{x.t}</div>
                <div style={{fontSize:14,fontWeight:700,color:x.over?T.red:T.green}}>{x.v}</div>
                <div style={{fontSize:9,color:T.dim}}>{x.fp}</div>
              </div>)}
            </div>
            <div style={{padding:"8px 12px",background:combinedSaves?T.greenBg:T.redBg,borderRadius:8,borderLeft:"3px solid "+(combinedSaves?T.green:T.red)}}>
              <div style={{fontSize:11,fontWeight:600,color:combinedSaves?T.green:T.red,marginBottom:3}}>{combinedSaves?"✓ Recommend: Combined D&D":"✗ Recommend: Separate Rates"}</div>
              <div style={{fontSize:11,color:T.text,lineHeight:1.5}}>{rateRec}</div>
            </div>
          </Card>
        </div>
        {/* Free Period Ask */}
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Free Period Ask — {activeLane.lane}</div>
          <div style={{fontSize:11,color:T.sub,marginBottom:10}}>Lane-specific free period utilization. Bars in red = already in paid tier on this lane. Use these numbers in your negotiation.</div>
          {fpAsks.map((r,i)=>{const pct=Math.round((r.laneAvg/r.fp)*100);const capped=Math.min(100,pct);const over=pct>100;const portAvgs=[portAvgODet,portAvgODem,portAvgDDem,portAvgDDet][i];const portPct=Math.round((portAvgs/r.fp)*100);return <div key={i} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:11,color:T.sub,fontWeight:500}}>{r.label}</span>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:10,color:T.dim}}>{"Portfolio: "+portAvgs+"d ("+portPct+"%)"}</span>
              <span style={{fontSize:12,fontWeight:700,color:over?T.red:pct>90?T.red:pct>70?T.amber:T.green}}>{r.laneAvg.toFixed(1)+"d / "+r.fp+"d ("+pct+"%)"}{ over&&<span style={{marginLeft:4,fontSize:10}}>⚠ OVER — ask for {Math.ceil(r.laneAvg-r.fp+1)}d more</span>}</span>
            </div>
          </div>
          <div style={{height:8,background:T.card2,borderRadius:4,overflow:"hidden",position:"relative"}}>
            <div style={{height:"100%",width:Math.min(100,portPct)+"%",background:T.border,borderRadius:4,position:"absolute"}}/>
            <div style={{height:"100%",width:capped+"%",background:over?T.red:pct>90?T.red:pct>70?T.amber:r.color,borderRadius:4,position:"absolute"}}/>
          </div>
          <div style={{fontSize:9,color:T.dim,marginTop:2}}>{"Grey = portfolio avg "+portAvgs+"d"}</div>
          </div>;})}
        </Card>
        {/* Negotiation Script */}
        <Card style={{borderLeft:"3px solid "+T.blue,background:T.blueBg}}>
          <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Negotiation Script — {activeLane.lane}</div>
          <div style={{fontSize:11,color:T.sub,marginBottom:10}}>Use this in your carrier QBR or contract renewal conversation. Based on actual data from this lane.</div>
          {scriptLines.map((line,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:i<scriptLines.length-1?"1px solid "+T.border+"60":"none"}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:T.blue,color:"#fff",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
            <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{line}</div>
          </div>)}
          <NavLink text="See carrier performance → Carrier Intel" onClick={()=>setPage("carriers")}/>
        </Card>
      </>;
    })():(
    <>
    <ChartBox title="Portfolio — Surcharge Costs by Category" sub="Compare all 8 surcharge buckets across the portfolio. Select a lane above to drill into negotiation specifics." h={280}><ResponsiveContainer><BarChart data={cats} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={T.border+"60"} vertical={false}/><XAxis type="number" stroke={T.dim} fontSize={10} tickFormatter={v=>fmt(v)}/><YAxis type="category" dataKey="name" stroke={T.dim} fontSize={9} width={160}/><Tooltip formatter={v=>fmt(v)}/><Bar dataKey="total" name="Total" radius={[0,4,4,0]}>{cats.map((c,i)=><Cell key={i} fill={c.color}/>)}</Bar></BarChart></ResponsiveContainer></ChartBox>
    <Card style={{marginTop:12}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Detailed Surcharge Table</div><div style={{fontSize:11,color:T.sub,marginBottom:8}}>Per-container cost by surcharge type. Higher $/container = higher priority for action.</div>
      <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:11}}><thead><tr style={{color:T.dim,fontSize:10,textAlign:"left"}}>{["Category","Side","Total","Containers","FP","$/Container","Reason"].map(h=><th key={h} style={{padding:"5px 8px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",textAlign:["Total","$/Container"].includes(h)?"right":"left"}}>{h}</th>)}</tr></thead>
      <tbody>{cats.map((c,i)=><tr key={i} style={{background:T.card2}}><td style={{padding:"7px 8px",borderRadius:"6px 0 0 6px"}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:2,background:c.color}}/><span style={{fontWeight:700}}>{c.name}</span></div></td><td style={{padding:"7px 8px"}}><Badge color={c.side==="Origin"?T.amber:T.purple}>{c.side}</Badge></td><td style={{padding:"7px 8px",fontWeight:600,textAlign:"right"}}>{fmt(c.total)}</td><td style={{padding:"7px 8px",color:T.sub,textAlign:"right"}}>{c.containers}</td><td style={{padding:"7px 8px",color:T.sub}}>{c.avgFP}d</td><td style={{padding:"7px 8px",fontWeight:700,textAlign:"right"}}>{c.containers>0?fmt(Math.round(c.total/c.containers)):"—"}</td><td style={{padding:"7px 8px",color:T.dim,fontSize:9,borderRadius:"0 6px 6px 0"}}>{"—"}</td></tr>)}</tbody></table>
      <div style={{fontSize:11,color:T.dim,marginTop:6,fontStyle:"italic"}}>Reason codes not yet available. When enabled, shows root cause: documentation delay, customs hold, port congestion, carrier delay, warehouse constraint.</div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:14}}>
      {[{side:"Origin",det:detO,dem:demO,dnd:dndO,detFP:BASE.costMatrix.detention_origin.avgFP+"d",demFP:BASE.costMatrix.demurrage_origin.avgFP+"d",dndFP:BASE.costMatrix.dnd_origin.avgFP+"d"},{side:"Dest",det:detD,dem:demD,dnd:dndD,detFP:BASE.costMatrix.detention_destination.avgFP+"d",demFP:BASE.costMatrix.demurrage_destination.avgFP+"d",dndFP:BASE.costMatrix.dnd_destination.avgFP+"d"}].map(s=>{const sepTotal=s.det+s.dem;const prem=s.dnd>sepTotal?Math.round((s.dnd-sepTotal)/sepTotal*100):0;const cheaper=s.dnd>sepTotal?"Separate":"Combined";return <Card key={s.side}><div style={{fontSize:14,fontWeight:600,marginBottom:10}}>{"Combined vs Separate — "+s.side}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8}}>{[{t:"Detention",fp:s.detFP,cost:s.det,c:T.amber},{t:"Demurrage",fp:s.demFP,cost:s.dem,c:T.purple},{t:"Combined",fp:s.dndFP,cost:s.dnd,c:T.red}].map((x,i)=><div key={i} style={{background:T.card2,borderRadius:10,padding:12,borderTop:"3px solid "+x.c,position:"relative"}}>{x.t===cheaper&&<div style={{position:"absolute",top:4,right:4,fontSize:9,color:T.green,fontWeight:700}}>{"✓ Cheaper"}</div>}<div style={{fontSize:9,fontWeight:700,color:T.sub,marginBottom:4}}>{x.t}</div><div style={{fontSize:18,fontWeight:700}}>{x.fp} <span style={{fontSize:10,color:T.sub}}>free</span></div><div style={{fontSize:13,fontWeight:700,color:x.c,marginTop:2}}>{fmt(x.cost)}</div></div>)}</div>
        <div style={{padding:8,background:prem>0?T.redBg:T.greenBg,borderRadius:7,borderLeft:"3px solid "+(prem>0?T.red:T.green)}}><div style={{fontSize:12,color:T.text}}>{prem>0?"Combined costs "+prem+"% MORE than separate ("+fmt(s.dnd)+" vs "+fmt(sepTotal)+"). Evaluate switching to separate rates on "+s.side.toLowerCase()+" lanes.":"Combined is cheaper than separate at "+s.side.toLowerCase()+"."}</div></div>
      </Card>;})}
    </div>
    <Card style={{marginTop:14}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Free Period Utilization — Portfolio</div><div style={{fontSize:11,color:T.sub,marginBottom:10}}>How much of your free period is consumed across all lanes? {">"}90% = zero buffer, negotiate more days.</div>
      {[{label:"Origin Detention",avg:4.8,fp:5.1,color:T.amber},{label:"Origin Demurrage",avg:0.87,fp:3.1,color:T.purple},{label:"Dest Demurrage",avg:2.6,fp:3.0,color:T.green},{label:"Dest Detention",avg:5.51,fp:6.0,color:T.red}].map((r,i)=>{const pct=Math.round((r.avg/r.fp)*100);const capped=Math.min(100,pct);const over=pct>100;return <div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:T.sub}}>{r.label}</span><span style={{fontSize:12,fontWeight:700,color:over?T.red:pct>90?T.red:pct>70?T.amber:T.green}}>{r.avg+"d / "+r.fp+"d ("+pct+"%)"}{over&&" ⚠ OVER"}</span></div><div style={{height:7,background:T.card2,borderRadius:4,overflow:"hidden",border:"none",boxShadow:"inset 0 1px 2px rgba(0,0,0,.06)",position:"relative"}}><div style={{height:"100%",width:capped+"%",background:over?T.red:pct>90?T.red:pct>70?T.amber:T.green,borderRadius:4}}/></div></div>;})}
      <Insight text={(()=>{const detAvg=BASE.stageDays.origin_detention.avg;const detFP=BASE.costMatrix.detention_origin.avgFP;const util=Math.round(detAvg/detFP*100);const newFP=detFP+1;const newUtil=Math.round(detAvg/newFP*100);return "Origin Detention at "+util+"% utilization ("+detAvg+"d avg vs "+detFP+"d free). Negotiating 1 extra free day ("+detFP+"d → "+newFP+"d) reduces utilization to ~"+newUtil+"%. Use this data in your next carrier contract discussion.";})()}/>
      <NavLink text="Back to today's priorities → Command Center" onClick={()=>setPage("home")}/>
    </Card>
    </>)}
  </div>);
}

// ═══ MAIN APP ═══
export default function App(){
  const[page,setPage]=useState("home");
  const[selectedLane,setSelectedLane]=useState(null);
  const navToSurcharges=(lane)=>{setSelectedLane(lane);setPage("surcharges");};
  return (<div style={{background:T.bg,minHeight:"100vh",fontFamily:"'Roboto','Arial',sans-serif",color:T.text}}>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;800&display=swap" rel="stylesheet"/>
    <TopNav page={page} setPage={setPage}/>
    <div style={{background:T.bg,minHeight:"calc(100vh - 57px)",width:"100%",boxSizing:"border-box"}}>
      {page==="home"&&<HomePage setPage={setPage}/>}
      {page==="costs"&&<CostPage setPage={setPage}/>}
      {page==="carriers"&&<CarrierPage setPage={setPage}/>}
      {page==="optimizer"&&<OptimizerPage/>}
      {page==="history"&&<HistoryPage setPage={setPage} navToSurcharges={navToSurcharges}/>}
      {page==="surcharges"&&<SurchargePage setPage={setPage} selectedLane={selectedLane} clearLane={()=>setSelectedLane(null)}/>}
    </div>
  </div>);
}
