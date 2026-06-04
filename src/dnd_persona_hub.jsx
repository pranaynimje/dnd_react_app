// ─────────────────────────────────────────────────────────
// D&D Intelligence Hub — Persona Layer
// New file: all existing page content reused via same data
// + persona sidebar + 3 new Tableau-achievable pages from Figma
// Existing dnd_dashboard.jsx unchanged.
// ─────────────────────────────────────────────────────────
import React, { useState, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
  AreaChart, Area, ScatterChart, Scatter, ZAxis, ReferenceLine,
  ComposedChart, Line,
} from "recharts";
import {
  Anchor, Ship, Clock, DollarSign, Package, Target, Zap, Layers,
  Calendar, Activity, MapPin, AlertTriangle, TrendingUp, TrendingDown,
  Settings, Search, Eye, BarChart2, Globe2, List, Users,
  X, Check, ChevronDown, ArrowRight, HelpCircle, Download,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// DATA — verbatim from dnd_dashboard.jsx (not re-exported)
// ═══════════════════════════════════════════════════════════
const BASE={
  summary:{totalContainers:2671,completed:341,inProgress:2186,cancelled:39},
  stages:{gateOutEmpty_actual:1768,gateInPOL_actual:1778,loadPOL_actual:1653,dischargePOD_actual:800,gateOutPOD_actual:653,emptyReturn_actual:352,total:2670},
  freeTimeHealth:{red:35,yellow:24,green:205,expired:3780},
  costMatrix:{detention_origin:{total:49169,withCost:261,avgFP:5.1},detention_destination:{total:1955,withCost:8,avgFP:6.0},demurrage_origin:{total:22353,withCost:52,avgFP:3.1},demurrage_destination:{total:5144,withCost:12,avgFP:3.0},storage_origin:{total:3075,withCost:23,avgFP:3.1},storage_destination:{total:1295,withCost:9,avgFP:3.0},dnd_origin:{total:99565,withCost:212,avgFP:9.9},dnd_destination:{total:1814,withCost:4,avgFP:12.0}},
  carriers:{OOLU:{containers:288,avgODet:9.86,avgODem:0.97,avgDDem:2.78,avgDDet:5.81,avgOSto:2.8,avgDSto:1.9,avgOComb:10.4,avgDComb:7.8},ONEY:{containers:905,avgODet:2.37,avgODem:0.87,avgDDem:2.66,avgDDet:5.48,avgOSto:1.2,avgDSto:1.4,avgOComb:3.6,avgDComb:6.5},MSCU:{containers:227,avgODet:5.98,avgODem:1.01,avgDDem:2.55,avgDDet:5.59,avgOSto:2.1,avgDSto:1.6,avgOComb:6.2,avgDComb:7.1},MAEU:{containers:229,avgODet:7.77,avgODem:1.0,avgDDem:3.22,avgDDet:5.86,avgOSto:2.6,avgDSto:2.1,avgOComb:10.8,avgDComb:8.4},HLCU:{containers:427,avgODet:5.62,avgODem:0.74,avgDDem:2.39,avgDDet:5.23,avgOSto:1.9,avgDSto:1.5,avgOComb:5.9,avgDComb:6.8},EGLV:{containers:139,avgODet:2.09,avgODem:0.43,avgDDem:1.38,avgDDet:4.82,avgOSto:0.8,avgDSto:0.9,avgOComb:2.8,avgDComb:5.6},COSU:{containers:141,avgODet:0.73,avgODem:0.82,avgDDem:2.82,avgDDet:5.74,avgOSto:0.5,avgDSto:1.2,avgOComb:2.1,avgDComb:7.4},CMDU:{containers:279,avgODet:6.35,avgODem:1.0,avgDDem:2.79,avgDDet:5.81,avgOSto:2.2,avgDSto:1.7,avgOComb:6.8,avgDComb:7.6}},
  topLanes:[
    {lane:"DEHAM-CNSHA",carriers:["MAEU","OOLU","ONEY"],containers:34,avgODet:2.52,avgDDet:5.46,surchargePct:28},
    {lane:"DEHAM-CNYTN",carriers:["HLCU","CMDU"],containers:28,avgODet:7.85,avgDDet:5.27,surchargePct:35},
    {lane:"CNSHA-SGSIN",carriers:["OOLU","MSCU","COSU"],containers:26,avgODet:3.91,avgDDet:4.34,surchargePct:20},
    {lane:"CNSHA-NLRTM",carriers:["OOLU","ONEY","EGLV"],containers:23,avgODet:12.33,avgDDet:4.89,surchargePct:45},
    {lane:"DEHAM-CNTAO",carriers:["HLCU","MSCU"],containers:22,avgODet:8.59,avgDDet:5.46,surchargePct:38}],
  monthlyCost:[
    {month:"Jan 26",detention:8420,demurrage:4310,storage:1850,combined:18640,total:33220,containers:410},
    {month:"Feb 26",detention:11600,demurrage:5950,storage:2550,combined:25700,total:45800,containers:490},
    {month:"Mar 26",detention:14800,demurrage:7590,storage:3250,combined:32780,total:58420,containers:565},
    {month:"Apr 26",detention:19840,demurrage:11250,storage:2480,combined:42180,total:75750,containers:648}],
  grandTotal:193375,totalOriginCost:181040,totalDestCost:12335,
};
const CDATA={topRisk:[
  {cn:"HLCU_021020",ca:"HLCU",po:"DEWVN",pd:"CNTAO",oDet:11.1,risk:80,cat:"Detention",cost:726,cost3d:1476,stage:"Gate In POL"},
  {cn:"COSU_120720",ca:"COSU",po:"DEBRV",pd:"PHMNN",oDet:51.2,risk:80,cat:"Combined D&D",cost:2737,cost3d:4237,stage:"Load POL"},
  {cn:"OOLU_131020",ca:"OOLU",po:"CNSHA",pd:"BEZEE",oDet:9.9,risk:77,cat:"Demurrage",cost:687,cost3d:1707,stage:"Gate In POL"},
  {cn:"ONEY_150920",ca:"ONEY",po:"DEHAM",pd:"ILASH",oDet:99.0,risk:77,cat:"Detention",cost:5117,cost3d:6887,stage:"Ocean Transit"},
  {cn:"HLCU_221020",ca:"HLCU",po:"DEBRV",pd:"USORF",oDet:10.0,risk:77,cat:"Detention",cost:631,cost3d:1381,stage:"Gate In POL"},
  {cn:"MAEU_170620",ca:"MAEU",po:"DEBRV",pd:"USEWR",oDet:83.8,risk:76,cat:"Combined D&D",cost:4374,cost3d:5994,stage:"Ocean Transit"},
  {cn:"MAEU_150620",ca:"MAEU",po:"DEBRV",pd:"DZALG",oDet:79.7,risk:75,cat:"Combined D&D",cost:4187,cost3d:5807,stage:"Discharge POD"},
  {cn:"CMDU_191020",ca:"CMDU",po:"DEWVN",pd:"DZORN",oDet:10.5,risk:75,cat:"Storage",cost:709,cost3d:1729,stage:"Gate In POL"},
  {cn:"MSCU_080620",ca:"MSCU",po:"DEHAM",pd:"BHBAH",oDet:46.8,risk:74,cat:"Detention",cost:2438,cost3d:3788,stage:"Ocean Transit"},
  {cn:"ONEY_021120",ca:"ONEY",po:"DEBRV",pd:"CNJMN",oDet:9.8,risk:74,cat:"Demurrage",cost:624,cost3d:1374,stage:"Gate Out POD"}]};
const COST_CATS=[
  {name:"Detention",oKey:"detention_origin",dKey:"detention_destination",color:"#D97706"},
  {name:"Demurrage",oKey:"demurrage_origin",dKey:"demurrage_destination",color:"#7C3AED"},
  {name:"Storage",oKey:"storage_origin",dKey:"storage_destination",color:"#059669"},
  {name:"Combined D&D",oKey:"dnd_origin",dKey:"dnd_destination",color:"#EF4444"}];

// ═══════════════════════════════════════════════════════════
// THEME — exact copy from dnd_dashboard.jsx
// ═══════════════════════════════════════════════════════════
const T={bg:"#F8F9FC",page:"#ffffff",card:"#ffffff",card2:"#F8F9FC",border:"#E8ECF1",text:"#1A1D26",sub:"#5E6578",dim:"#98A1B3",amber:"#C27815",amberBg:"#FFF8EE",purple:"#6D5ACE",purpleBg:"#F5F3FF",green:"#0D9668",greenBg:"#EEFBF4",red:"#DC3545",redBg:"#FFF0F1",blue:"#2563EB",blueL:"#4F8FEE",blueBg:"#EEF4FF",cyan:"#0E7F96",actionBg:"#F5F8FF",warmBg:"#FFFCF0"};
const fmt=n=>{if(n<0)return"-"+fmt(Math.abs(n));return n>=1e6?"$"+(n/1e6).toFixed(2)+"M":n>=1e3?"$"+(n/1e3).toFixed(1)+"K":"$"+Math.round(n);};
const momPct=(c,p)=>{const v=p>0?Math.round((c-p)/p*100):0;return{v,color:v>0?T.red:v<0?T.green:T.sub,arrow:v>0?"↑":v<0?"↓":"→"};};
const catColor=c=>c==="Detention"?T.amber:c==="Demurrage"?T.purple:c==="Storage"?T.green:T.red;

// ═══════════════════════════════════════════════════════════
// SHARED UI — same patterns as dnd_dashboard.jsx
// ═══════════════════════════════════════════════════════════
const Card=({children,style,onClick,urgency})=>{const bg=urgency==="critical"?"#FFF0F1":urgency==="warn"?"#FFF8EE":T.card;const bTop=urgency==="critical"?T.red:urgency==="warn"?T.amber:null;return <div onClick={onClick} style={{background:bg,border:bTop?"none":"1px solid "+T.border+"80",borderRadius:14,padding:20,cursor:onClick?"pointer":"default",boxShadow:"0 1px 4px rgba(0,0,0,.03)",borderTop:bTop?"3px solid "+bTop:undefined,...style}}>{children}</div>;};
const SH=({title,sub})=><div style={{marginBottom:16}}><div style={{color:T.text,fontSize:15,fontWeight:700}}>{title}</div>{sub&&<div style={{color:T.sub,fontSize:11,marginTop:2}}>{sub}</div>}</div>;
const Insight=({text})=><div style={{background:T.blueBg,borderRadius:10,padding:"12px 16px",marginTop:10,borderLeft:"3px solid "+T.blue+"90"}}><div style={{fontSize:12,fontWeight:500,color:"#1E40AF",lineHeight:1.5}}>{text}</div></div>;
const Badge=({children,color=T.blue})=><span style={{background:color+"12",color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>;
const SolidBadge=({children,color=T.red})=><span style={{background:color,color:"#fff",padding:"3px 11px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{children}</span>;
const CTip=({active,payload,label})=>{if(!active||!payload)return null;return <div style={{background:"#fff",borderRadius:10,padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,.08)"}}><div style={{fontSize:11,fontWeight:700,marginBottom:4}}>{label}</div>{payload.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.sub}}><div style={{width:6,height:6,borderRadius:"50%",background:p.color}}/>{p.name}:<span style={{fontWeight:700,color:T.text}}>{typeof p.value==="number"?fmt(p.value):p.value}</span></div>)}</div>;};
function ChartBox({title,sub,children,h=240,insight}){return <Card style={{padding:20}}>{title&&<div style={{color:T.text,fontSize:13,fontWeight:600}}>{title}</div>}{sub&&<div style={{color:T.sub,fontSize:11,marginBottom:8}}>{sub}</div>}<div style={{height:h}}>{children}</div>{insight&&<Insight text={insight}/>}</Card>;}
const KPICard=({label,value,color=T.text,sub,icon:Icon,iconColor,urgency})=><Card urgency={urgency} style={{padding:"16px 20px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontSize:11,color:T.sub,marginBottom:6}}>{label}</div><div style={{fontSize:24,fontWeight:700,color}}>{value}</div>{sub&&<div style={{fontSize:10,color:T.dim,marginTop:4}}>{sub}</div>}</div>{Icon&&<Icon size={20} color={iconColor||color} style={{opacity:.7}}/>}</div></Card>;

// ═══════════════════════════════════════════════════════════
// PERSONA CONFIGURATION
// Defines which nav items each role sees in Tableau
// In Tableau: a String parameter drives Show/Hide containers
// ═══════════════════════════════════════════════════════════
const PERSONAS = {
  admin:       {id:"admin",       icon:"🛡", label:"Admin",               desc:"Access to all pages and features",                     nav:["tracking","map","shipments","overview","analytics","optimizer","aihub"]},
  transport:   {id:"transport",   icon:"🚢", label:"Transport Manager",   desc:"Focus on shipments, map, and D&D optimization",        nav:["tracking","map","shipments","optimizer","aihub"]},
  procurement: {id:"procurement", icon:"💼", label:"Procurement Manager", desc:"Focus on analytics, contracts, and cost management",   nav:["shipments","overview","analytics","aihub"]},
  logistics:   {id:"logistics",   icon:"📊", label:"Head of Logistics",   desc:"Focus on overview, contracts, and strategic insights", nav:["map","overview","aihub"]},
};

const ALL_PAGES=[
  {id:"tracking",  label:"Live Tracking",  section:"Visibility", icon:Activity,  tableau:"KPI sheets dashboard"},
  {id:"map",       label:"Global Map",     section:"Visibility", icon:Globe2,    tableau:"Map worksheet"},
  {id:"shipments", label:"Shipment List",  section:"Visibility", icon:List,      tableau:"Crosstab with drill action"},
  {id:"overview",  label:"D&D Overview",  section:"Insights",   icon:BarChart2, tableau:"Command Center + Cost Overview dashboards"},
  {id:"analytics", label:"D&D Analytics", section:"Insights",   icon:TrendingUp,tableau:"Carrier Intel + Historical + Surcharges dashboards"},
  {id:"optimizer", label:"D&D Optimizer", section:"Insights",   icon:Target,    tableau:"Cost Optimizer dashboard"},
  {id:"aihub",     label:"AI Hub",        section:"AI Hub",     icon:Zap,       tableau:"Ask D&D AI extension"},
];

// ═══════════════════════════════════════════════════════════
// SIDEBAR
// In Tableau: floating vertical container on every dashboard
// Visibility controlled by persona parameter
// Navigation via "Navigate to Dashboard" actions on button sheets
// ═══════════════════════════════════════════════════════════
function Sidebar({page,setPage,persona,onSettings}){
  const[open,setOpen]=useState(["Visibility","Insights","AI Hub"]);
  const sections=[...new Set(ALL_PAGES.map(p=>p.section))];
  const toggle=s=>setOpen(o=>o.includes(s)?o.filter(x=>x!==s):[...o,s]);
  const visible=new Set(persona.nav);

  return(
    <div style={{width:210,background:T.text,display:"flex",flexDirection:"column",height:"100vh",flexShrink:0,fontFamily:"'Roboto','Arial',sans-serif"}}>
      {/* Brand */}
      <div style={{padding:"16px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,background:"linear-gradient(135deg,#2563EB,#6D5ACE)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Anchor size={16} color="#fff"/>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:"#fff",letterSpacing:"-.3px"}}>D&D Hub</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,.4)"}}>Intelligence Platform</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
        {sections.map(sec=>{
          const secPages=ALL_PAGES.filter(p=>p.section===sec&&visible.has(p.id));
          if(!secPages.length) return null;
          const isOpen=open.includes(sec);
          return(
            <div key={sec}>
              <button onClick={()=>toggle(sec)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.4)",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>
                <span style={{flex:1,textAlign:"left"}}>{sec}</span>
                <ChevronDown size={11} style={{transform:isOpen?"rotate(0)":"rotate(-90deg)",transition:".15s"}}/>
              </button>
              {isOpen&&secPages.map(p=>{
                const Icon=p.icon;const active=page===p.id;
                return(
                  <button key={p.id} onClick={()=>setPage(p.id)} title={`Tableau: ${p.tableau}`}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 14px 8px 22px",background:active?"rgba(37,99,235,.25)":"none",border:"none",cursor:"pointer",color:active?"#fff":"rgba(255,255,255,.55)",fontSize:12,fontWeight:active?600:400,borderLeft:active?"3px solid "+T.blue:"3px solid transparent",transition:"all .12s"}}>
                    <Icon size={13}/>{p.label}
                    {/* Notification dot — same pattern as existing TopNav */}
                    {(p.id==="optimizer"||p.id==="overview")&&!active&&<div style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:T.red,boxShadow:"0 0 0 2px "+T.text}}/>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Persona + Settings */}
      <div style={{borderTop:"1px solid rgba(255,255,255,.08)",padding:"12px 14px"}}>
        <div style={{fontSize:9,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:.6,marginBottom:6}}>Current Role</div>
        <div style={{fontSize:12,fontWeight:600,color:"#fff",marginBottom:10}}>{persona.icon} {persona.label}</div>
        <button onClick={onSettings} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,color:"rgba(255,255,255,.5)",fontSize:11,cursor:"pointer",marginBottom:10}}>
          <Settings size={13}/>Switch Persona
        </button>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700}}>JD</div>
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.85)",fontWeight:600}}>John Doe</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.35)"}}>john@logward.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PERSONA SETTINGS MODAL
// In Tableau: parameter action on a settings button sheet
// ═══════════════════════════════════════════════════════════
function PersonaModal({persona,setPersona,onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,width:500,maxHeight:"85vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)",fontFamily:"'Roboto','Arial',sans-serif"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:"1px solid "+T.border}}>
          <div style={{fontSize:18,fontWeight:700,color:T.text}}>Settings</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.sub}}><X size={18}/></button>
        </div>
        <div style={{padding:"20px 24px"}}>
          <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:4}}>Persona Hubs</div>
          <div style={{fontSize:12,color:T.sub,marginBottom:16}}>Configure the sidebar menu based on your role</div>
          {Object.values(PERSONAS).map(p=>{
            const active=persona.id===p.id;
            return(
              <div key={p.id} onClick={()=>setPersona(PERSONAS[p.id])}
                style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:10,border:"1px solid "+(active?T.blue:T.border),background:active?T.blueBg:"#fff",cursor:"pointer",marginBottom:8,transition:"all .15s"}}>
                <div style={{width:36,height:36,borderRadius:8,background:active?T.blue+"20":T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,color:active?T.blue:T.text,fontSize:14}}>{p.label}</div>
                  <div style={{fontSize:11,color:T.sub,marginTop:2}}>{p.desc}</div>
                </div>
                {active&&<div style={{width:22,height:22,background:T.blue,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Check size={12} color="#fff"/></div>}
              </div>
            );
          })}
          {/* Cockpits section — which nav items this persona sees */}
          <div style={{marginTop:20,padding:"14px 16px",background:T.bg,borderRadius:10}}>
            <div style={{fontSize:11,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Cockpits — {persona.label}</div>
            {ALL_PAGES.map(p=>{
              const has=persona.nav.includes(p.id);
              return(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",opacity:has?1:.4}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:has?T.green:T.dim,flexShrink:0}}/>
                  <p.icon size={11} color={has?T.text:T.dim}/>
                  <span style={{fontSize:11,color:has?T.text:T.dim}}>{p.label}</span>
                  <span style={{fontSize:9,color:T.dim}}>({p.section})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: LIVE TRACKING (NEW — from Figma)
// Tableau: KPI sheets dashboard
// Each KPI block = a Tableau Text/Number sheet
// "View List" buttons = Navigate to Dashboard actions
// ═══════════════════════════════════════════════════════════
function LiveTrackingPage({setPage}){
  const KBlock=({label,value,icon:Icon,color,viewPage})=>(
    <Card style={{padding:"20px 24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        {Icon&&<Icon size={18} color={color}/>}
        <div style={{fontSize:13,color:T.sub}}>{label}</div>
      </div>
      <div style={{fontSize:42,fontWeight:800,color,marginBottom:10}}>{value}</div>
      {viewPage&&(
        <div onClick={()=>setPage(viewPage)} style={{display:"flex",alignItems:"center",gap:6,color:T.blue,fontSize:12,fontWeight:500,cursor:"pointer"}}>
          <Eye size={13}/>View List
        </div>
      )}
    </Card>
  );

  return(
    <div style={{flex:1,overflowY:"auto",padding:28,background:T.bg}}>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:22,fontWeight:700,color:T.text}}>Live Tracking</div>
        <div style={{fontSize:13,color:T.sub,marginTop:4}}>Monitor your shipments and take action on critical items</div>
      </div>

      {/* Active Shipments */}
      <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:14}}>Active Shipments</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:28}}>
        <KBlock label="All Active Shipments" value="500" color={T.text} icon={Package} viewPage="shipments"/>
        <KBlock label="This Week's Arrivals" value="154" color={T.blue} icon={Ship} viewPage="shipments"/>
      </div>

      {/* Active Risks — these are the D&D specific KPIs */}
      <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:14}}>Active Risks</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:28}}>
        <KBlock label="Delayed Shipments" value="4" color={T.amber} icon={Clock} viewPage="shipments"/>
        <KBlock label="Shipments at Risk of Detention" value="125" color={T.red} icon={Ship} viewPage="shipments"/>
        <KBlock label="Shipments at Risk of Demurrage" value="126" color={T.red} icon={Anchor} viewPage="shipments"/>
      </div>

      {/* Active Cases */}
      <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:14}}>Active Cases</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <KBlock label="My Active Cases" value="0" color={T.green} icon={AlertTriangle}/>
        <KBlock label="My Watch List" value="0" color={T.purple} icon={TrendingUp}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: GLOBAL MAP (NEW — from Figma)
// Tableau: Map worksheet with colored marks by urgency parameter
// KPI bar = summary sheets above the map
// Urgency legend = color encoding on the map
// ═══════════════════════════════════════════════════════════
const MAP_PORTS=[
  {code:"DEHAM",name:"Hamburg",   lat:53.55,lng:10.0,  containers:487,cost:58400,pctOver:42},
  {code:"DEBRV",name:"Bremen",    lat:53.08,lng:8.81,  containers:312,cost:39200,pctOver:38},
  {code:"CNSHA",name:"Shanghai",  lat:31.23,lng:121.47,containers:298,cost:31800,pctOver:55},
  {code:"NLRTM",name:"Rotterdam", lat:51.92,lng:4.48,  containers:156,cost:18900,pctOver:48},
  {code:"CNTAO",name:"Qingdao",   lat:36.07,lng:120.37,containers:134,cost:14200,pctOver:61},
  {code:"SGSIN",name:"Singapore", lat:1.29, lng:103.85,containers:180,cost:12400,pctOver:22},
  {code:"USNYC",name:"New York",  lat:40.71,lng:-74.0, containers:98, cost:8900, pctOver:31},
  {code:"JPNGO",name:"Nagoya",    lat:35.18,lng:136.9, containers:82, cost:7100, pctOver:28},
];

function GlobalMapPage(){
  const[filter,setFilter]=useState("all");
  const totalShips=1000;const atRisk=42;const inCases=28;
  const ddExposure=47385;const containerDelay=22;

  return(
    <div style={{flex:1,overflowY:"auto",padding:28,background:T.bg}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:700,color:T.text}}>Global Map</div>
        <div style={{fontSize:13,color:T.sub,marginTop:4}}>Interactive shipment tracking with D&D risk monitoring</div>
      </div>

      {/* KPI summary bar — Figma exact match */}
      <Card style={{padding:"14px 20px",marginBottom:16}}>
        <div style={{display:"flex",gap:32,alignItems:"center",flexWrap:"wrap"}}>
          {[
            {label:"Total Shipments",  value:totalShips,    color:T.text  },
            {label:"Shipments at Risk",value:atRisk,        color:T.amber },
            {label:"Shipments in Cases",value:inCases,      color:T.purple},
            {label:"D&D Exposure",     value:fmt(ddExposure),color:T.red  },
            {label:"Container Delay",  value:containerDelay, color:T.amber },
          ].map(k=>(
            <div key={k.label}>
              <div style={{fontSize:10,color:T.sub,marginBottom:4}}>{k.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:k.color}}>{k.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Map area */}
      <Card style={{padding:0,overflow:"hidden",position:"relative"}}>
        <div style={{background:"#D6EAF8",height:360,position:"relative",overflow:"hidden"}}>
          {/* Placeholder note */}
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",opacity:.5}}>
            <Globe2 size={40} color={T.dim}/>
            <div style={{fontSize:11,color:T.sub,marginTop:6}}>Tableau native Map worksheet</div>
            <div style={{fontSize:10,color:T.dim}}>Color = Urgency level · Size = Container count</div>
          </div>

          {/* Port dots — approximate lat/lng to percentage positions */}
          {MAP_PORTS.map(p=>{
            const x=((p.lng+180)/360)*100;
            const y=((90-p.lat)/180)*100;
            const size=10+Math.round(p.containers/60);
            const color=p.pctOver>50?T.red:p.pctOver>35?T.amber:T.green;
            return(
              <div key={p.code} title={`${p.name}: ${p.containers} containers, ${p.pctOver}% over FP — ${fmt(p.cost)}`}
                style={{position:"absolute",left:x+"%",top:y+"%",width:size,height:size,borderRadius:"50%",background:color+"90",border:"2px solid "+color,transform:"translate(-50%,-50%)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:7,color:"#fff",fontWeight:700}}>{p.code.slice(2)}</span>
              </div>
            );
          })}

          {/* Filter chip — Figma has "28 ships ×" */}
          <div style={{position:"absolute",bottom:12,left:12,background:"rgba(255,255,255,.92)",borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:600,color:T.text,display:"flex",alignItems:"center",gap:6}}>
            {filter==="all"?"500 ships":"28 ships"}
            <X size={11} color={T.sub} style={{cursor:"pointer"}} onClick={()=>setFilter("all")}/>
          </div>

          {/* Urgency legend — Figma exact */}
          <div style={{position:"absolute",bottom:12,right:12,background:"rgba(255,255,255,.92)",borderRadius:8,padding:"10px 14px"}}>
            <div style={{fontSize:10,fontWeight:700,marginBottom:8,color:T.text}}>Urgency Levels</div>
            {[["In Case",T.red],["At Risk",T.amber],["No Issues",T.dim]].map(([l,c])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:8,fontSize:10,marginBottom:4,color:T.sub}}>
                <div style={{width:10,height:10,borderRadius:2,border:"1px solid "+c,background:"rgba(255,255,255,.6)"}}/>
                {l}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: SHIPMENT LIST (NEW — from Figma)
// Tableau: Crosstab with row-level shipment data
// AI search = existing Ask D&D AI extension (not duplicated)
// Row click = Navigate to Dashboard filter action
// Export = native Tableau download
// ═══════════════════════════════════════════════════════════
const SHIPMENTS=[
  {id:"SHP-0001",container:"CMAU7132710",origin:"Yokohama",  dest:"Los Angeles",carrier:"HAPAG-LLOYD",urgency:"CRITICAL",ddRisk:"$688",  daysOver:5},
  {id:"SHP-0002",container:"MSCU4894997",origin:"Long Beach", dest:"Los Angeles",carrier:"MSC",        urgency:"HIGH",    ddRisk:"$420",  daysOver:2},
  {id:"SHP-0003",container:"OOLU6166771",origin:"Shenzhen",  dest:"Los Angeles",carrier:"OOCL",       urgency:"MEDIUM",  ddRisk:"—",     daysOver:0},
  {id:"SHP-0004",container:"CMAU8949294",origin:"Felixstowe",dest:"Los Angeles",carrier:"MAERSK",     urgency:"CRITICAL",ddRisk:"$525",  daysOver:3},
  {id:"SHP-0005",container:"APLU8660057",origin:"Kobe",      dest:"Los Angeles",carrier:"APL",        urgency:"MEDIUM",  ddRisk:"$180",  daysOver:1},
  {id:"SHP-0006",container:"ONEU4080721",origin:"New York",  dest:"Los Angeles",carrier:"ONE",        urgency:"LOW",     ddRisk:"—",     daysOver:0},
  {id:"SHP-0007",container:"EGHU3463725",origin:"Vancouver", dest:"Los Angeles",carrier:"EVERGREEN",  urgency:"HIGH",    ddRisk:"$520",  daysOver:4},
  {id:"SHP-0008",container:"ZIMU1371691",origin:"Hong Kong", dest:"Los Angeles",carrier:"ZIM",        urgency:"LOW",     ddRisk:"—",     daysOver:0},
  {id:"SHP-0009",container:"ONEU3046214",origin:"Shanghai",  dest:"Los Angeles",carrier:"ONE",        urgency:"MEDIUM",  ddRisk:"$210",  daysOver:1},
  {id:"SHP-0010",container:"HLCU5921363",origin:"Osaka",     dest:"Los Angeles",carrier:"HAPAG-LLOYD",urgency:"HIGH",    ddRisk:"$390",  daysOver:3},
  {id:"SHP-0011",container:"OOLU9467221",origin:"Vancouver", dest:"Los Angeles",carrier:"OOCL",       urgency:"LOW",     ddRisk:"—",     daysOver:0},
  {id:"SHP-0012",container:"CMAU1571155",origin:"Los Angeles",dest:"Los Angeles",carrier:"MAERSK",    urgency:"MEDIUM",  ddRisk:"$140",  daysOver:1},
  {id:"SHP-0013",container:"MSCU4412497",origin:"Barcelona", dest:"Los Angeles",carrier:"MSC",        urgency:"CRITICAL",ddRisk:"$680",  daysOver:6},
];

function ShipmentListPage(){
  const[search,setSearch]=useState("");
  const filtered=SHIPMENTS.filter(s=>!search||[s.id,s.container,s.origin,s.dest,s.carrier].some(v=>v.toLowerCase().includes(search.toLowerCase())));
  const UGC={CRITICAL:T.red,HIGH:T.amber,MEDIUM:T.purple,LOW:T.green};

  return(
    <div style={{flex:1,overflowY:"auto",padding:28,background:T.bg}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:700,color:T.text}}>Shipment List</div>
        <div style={{fontSize:13,color:T.sub,marginTop:4}}>View and manage all shipments with advanced filtering and search capabilities</div>
      </div>

      {/* Search bar — AI-powered in Figma. In Tableau: Quick Filter + Ask D&D AI extension */}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:"#fff",border:"1px solid "+T.border,borderRadius:10,padding:"10px 14px"}}>
          <Zap size={13} color={T.blue}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search shipments or ask AI to filter..."
            style={{border:"none",outline:"none",flex:1,fontSize:12,color:T.text,fontFamily:"inherit"}}/>
          {search&&<X size={13} color={T.dim} style={{cursor:"pointer"}} onClick={()=>setSearch("")}/>}
          <button style={{padding:"5px 14px",background:T.blue,border:"none",borderRadius:7,color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>Search</button>
        </div>
        <button style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",background:"#fff",border:"1px solid "+T.border,borderRadius:10,fontSize:12,fontWeight:600,color:T.text,cursor:"pointer"}}>
          <Download size={13}/> Export
        </button>
      </div>

      {/* Table — matches Figma exactly (SHP ID, Container, Origin, Destination) */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead>
            <tr style={{background:T.bg}}>
              <th style={{width:36,padding:"10px 14px",borderBottom:"1px solid "+T.border}}><input type="checkbox"/></th>
              {["SHIPMENT ID","CONTAINER","ORIGIN","DESTINATION","URGENCY","D&D RISK"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:9,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:.5,borderBottom:"1px solid "+T.border}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id} style={{background:i%2===0?"#fff":T.bg,cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.blueBg}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":T.bg}>
                <td style={{padding:"10px 14px"}} onClick={e=>e.stopPropagation()}><input type="checkbox"/></td>
                <td style={{padding:"10px 14px",color:T.blue,fontWeight:600}}>{s.id}</td>
                <td style={{padding:"10px 14px",color:T.blue,fontFamily:"monospace",fontSize:10}}>{s.container}</td>
                <td style={{padding:"10px 14px",color:T.sub}}>{s.origin}</td>
                <td style={{padding:"10px 14px",color:T.sub}}>{s.dest}</td>
                <td style={{padding:"10px 14px"}}>
                  <span style={{background:(UGC[s.urgency]||T.green)+"15",color:UGC[s.urgency]||T.green,padding:"2px 8px",borderRadius:10,fontSize:9,fontWeight:700}}>{s.urgency}</span>
                </td>
                <td style={{padding:"10px 14px",fontWeight:700,color:s.daysOver>0?T.red:T.dim}}>{s.ddRisk}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{padding:"10px 14px",fontSize:10,color:T.dim,borderTop:"1px solid "+T.border}}>
          {filtered.length} shipments · Click a row to view D&D contract details (Tableau: Navigate to Dashboard action)
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: D&D OVERVIEW (EXISTING content reused)
// = Command Center + Cost Overview from dnd_dashboard.jsx
// Same data, same charts, same colors — just within new layout
// In Tableau: existing "Command Center" + "Cost Overview" dashboards
// ═══════════════════════════════════════════════════════════
function DDOverviewPage({setPage}){
  const cm=BASE.costMatrix;const fth=BASE.freeTimeHealth;
  const mc=BASE.monthlyCost;const prev=mc[mc.length-2];const curr=mc[mc.length-1];
  const mom=momPct(curr.total,prev.total);
  const detTotal=cm.detention_origin.total+cm.detention_destination.total;
  const demTotal=cm.demurrage_origin.total+cm.demurrage_destination.total;
  const stoTotal=cm.storage_origin.total+cm.storage_destination.total;

  // KPI data — same as existing Command Center
  const fthData=[
    {name:"Overdue",value:fth.expired,color:T.red},
    {name:"At Risk",value:fth.red,color:T.amber},
    {name:"Monitor",value:fth.yellow,color:"#EAB308"},
    {name:"Safe",value:fth.green,color:T.green},
  ];

  return(
    <div style={{flex:1,overflowY:"auto",padding:28,background:T.bg}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:700,color:T.text}}>D&D Performance Overview</div>
        <div style={{fontSize:13,color:T.sub,marginTop:4}}>Executive view of Demurrage & Detention costs</div>
      </div>

      {/* 5 KPIs — Figma exact + Storage (which Figma misses) */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
        <KPICard label="Total D&D Spend" value={fmt(BASE.grandTotal)} color={T.blue} icon={DollarSign} iconColor={T.blue}/>
        <KPICard label="Avg Cost / Container" value={fmt(Math.round(BASE.grandTotal/BASE.costMatrix.detention_origin.withCost))} color={T.purple} icon={Package} iconColor={T.purple}/>
        <KPICard label="Containers Affected" value={cm.detention_origin.withCost+cm.demurrage_origin.withCost} color={T.amber} icon={AlertTriangle} iconColor={T.amber}/>
        <KPICard label="Demurrage" value={fmt(demTotal)} color={T.red} urgency="critical"/>
        <KPICard label="Detention" value={fmt(detTotal)} color={T.red}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr",gap:16,marginBottom:16}}>
        {/* Cost Breakdown by Risk Type — Figma calls this "Risk Type" but it's FP Status */}
        <ChartBox title="Cost Breakdown by Risk Type" sub="Click a slice to view shipments" h={200}
          insight={`${fth.expired} containers overdue — highest urgency for clearance`}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={fthData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({name,value})=>`${name}: ${value}`} labelLine={false} fontSize={9}>
                {fthData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip formatter={v=>v+" containers"}/>
              <Legend iconSize={8} wrapperStyle={{fontSize:9}}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>

        {/* Monthly D&D Costs — all 4 categories (Figma only shows 2) */}
        <ChartBox title="Monthly D&D Costs" sub="Click a bar to view shipments for that month" h={200}>
          <ResponsiveContainer>
            <BarChart data={mc} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="month" stroke={T.dim} fontSize={9}/>
              <YAxis stroke={T.dim} fontSize={9} tickFormatter={v=>fmt(v)} width={55}/>
              <Tooltip content={<CTip/>}/>
              <Legend iconSize={8} wrapperStyle={{fontSize:9}}/>
              <Bar dataKey="demurrage" name="Demurrage"    fill={T.red}    stackId="a"/>
              <Bar dataKey="detention" name="Detention"    fill={T.amber}  stackId="a"/>
              <Bar dataKey="storage"   name="Storage"      fill={T.purple} stackId="a"/>
              <Bar dataKey="combined"  name="Combined D&D" fill={T.green}  stackId="a" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      {/* D&D Cost Trends Over Time */}
      <ChartBox title="D&D Cost Trends Over Time" sub="Click a data point to view shipments for that month" h={160}>
        <ResponsiveContainer>
          <AreaChart data={mc}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={T.blue} stopOpacity={.25}/>
                <stop offset="95%" stopColor={T.blue} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
            <XAxis dataKey="month" stroke={T.dim} fontSize={9}/>
            <YAxis stroke={T.dim} fontSize={9} tickFormatter={v=>fmt(v)} width={55}/>
            <Tooltip content={<CTip/>}/>
            <Area type="monotone" dataKey="total" name="Total D&D" stroke={T.blue} fill="url(#trendGrad)" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer>
      </ChartBox>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: D&D ANALYTICS (EXISTING content reused)
// = Carrier Intel from dnd_dashboard.jsx (richer than Figma)
// Figma: simple By Port/By Carrier bar chart
// Ours: scatter quadrant + scorecard + historical + surcharges
// In Tableau: existing Carrier Intel + Historical + Surcharges dashboards
// ═══════════════════════════════════════════════════════════
function DDAnalyticsPage({setPage}){
  const[view,setView]=useState("scatter"); // scatter | byport | carrier
  const carriers=Object.entries(BASE.carriers).map(([scac,d])=>({scac,...d,risk:d.avgODet>5?75:d.avgODet>3?50:30}));

  // By Port data (Figma feature)
  const portData=[
    {name:"Miami",dem:280,det:105},{name:"Los Angeles",dem:250,det:98},{name:"Rotterdam",dem:210,det:78},
    {name:"Antwerp",dem:195,det:72},{name:"Charleston",dem:170,det:63},{name:"Houston",dem:160,det:59},
    {name:"Tokyo",dem:155,det:57},{name:"Busan",dem:145,det:54},{name:"Felixstowe",dem:135,det:50},{name:"Sydney",dem:120,det:44},
  ];

  const scatterData=carriers.map(c=>({name:c.scac,x:c.avgODet,y:c.avgDDet,z:c.containers,risk:c.risk}));

  return(
    <div style={{flex:1,overflowY:"auto",padding:28,background:T.bg}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:700,color:T.text}}>D&D Analytics</div>
        <div style={{fontSize:13,color:T.sub,marginTop:4}}>Carrier performance and lane analysis — Demurrage & Detention costs by port and carrier</div>
      </div>

      {/* 3 KPIs — from Figma D&D Analytics */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        <KPICard label="Total D&D Costs" value={fmt(BASE.grandTotal)} color={T.blue} icon={TrendingUp} iconColor={T.blue}/>
        <KPICard label="Demurrage Costs" value={fmt(BASE.costMatrix.demurrage_origin.total+BASE.costMatrix.demurrage_destination.total)} color={T.red} icon={Anchor} iconColor={T.red}/>
        <KPICard label="Detention Costs" value={fmt(BASE.costMatrix.detention_origin.total+BASE.costMatrix.detention_destination.total)} color={T.amber} icon={Ship} iconColor={T.amber}/>
      </div>

      {/* View toggle — By Port/By Carrier from Figma + scatter from existing */}
      <div style={{display:"flex",gap:4,marginBottom:16,background:"#fff",border:"1px solid "+T.border,borderRadius:10,padding:4,width:"fit-content"}}>
        {[["scatter","Carrier Scatter (Current)"],["byport","By Port"],["carrier","By Carrier"]].map(([id,label])=>(
          <button key={id} onClick={()=>setView(id)}
            style={{padding:"6px 16px",borderRadius:8,border:"none",background:view===id?T.text:"transparent",color:view===id?"#fff":T.sub,fontSize:11,fontWeight:view===id?600:400,cursor:"pointer"}}>
            {label}
          </button>
        ))}
      </div>

      {/* Scatter view — from existing Carrier Intel (richer than Figma) */}
      {view==="scatter"&&(
        <ChartBox title="Origin vs Destination Dwell — Carrier Scatter" sub="X = Origin detention avg · Y = Destination detention avg · Bubble = container volume · Quadrant = risk zone" h={280}
          insight="Carriers in top-right quadrant exceed free period on both sides. OOLU and MAEU are highest priority for renegotiation.">
          <ResponsiveContainer>
            <ScatterChart margin={{top:20,right:20,bottom:20,left:20}}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis type="number" dataKey="x" name="Origin Det (d)" domain={[0,12]} stroke={T.dim} fontSize={9} label={{value:"Origin Dwell (d)",position:"bottom",fontSize:9,fill:T.dim}}/>
              <YAxis type="number" dataKey="y" name="Dest Det (d)" domain={[4,7]} stroke={T.dim} fontSize={9} label={{value:"Dest Dwell (d)",angle:-90,position:"insideLeft",fontSize:9,fill:T.dim}}/>
              <ZAxis dataKey="z" range={[60,400]}/>
              <ReferenceLine x={5.1} stroke={T.red} strokeDasharray="4 3" label={{value:"Origin FP",fill:T.red,fontSize:8}}/>
              <ReferenceLine y={6.0} stroke={T.red} strokeDasharray="4 3" label={{value:"Dest FP",fill:T.red,fontSize:8}}/>
              <Tooltip cursor={{strokeDasharray:"3 3"}} content={({active,payload})=>{
                if(!active||!payload?.length) return null;
                const d=payload[0].payload;
                return(<div style={{background:"#fff",border:"1px solid "+T.border,borderRadius:8,padding:"10px 14px",fontSize:11}}>
                  <b>{d.name}</b><br/>Origin: {d.x}d · Dest: {d.y}d<br/>Containers: {d.z}
                </div>);
              }}/>
              <Scatter data={scatterData} shape={({cx,cy,payload})=>(
                <g>
                  <circle cx={cx} cy={cy} r={4+Math.sqrt(payload.z/50)} fill={payload.risk>=75?T.red:payload.risk>=50?T.amber:T.green} fillOpacity={.75} stroke="#fff" strokeWidth={1.5}/>
                  <text x={cx} y={cy-8-Math.sqrt(payload.z/50)} textAnchor="middle" fontSize={9} fontWeight={700} fill={T.text}>{payload.name}</text>
                </g>
              )}/>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartBox>
      )}

      {/* By Port — from Figma */}
      {view==="byport"&&(
        <ChartBox title="D&D Costs by Port" sub="Click on a bar to drill down and see breakdown by carrier" h={260}>
          <ResponsiveContainer>
            <BarChart data={portData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="name" stroke={T.dim} fontSize={9} angle={-20} textAnchor="end" height={40}/>
              <YAxis stroke={T.dim} fontSize={9} tickFormatter={v=>`${v}k`} width={40}/>
              <Tooltip content={<CTip/>}/>
              <Legend iconSize={8} wrapperStyle={{fontSize:9}}/>
              <Bar dataKey="dem" name="Demurrage" fill={T.red}/>
              <Bar dataKey="det" name="Detention"  fill={T.amber}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      )}

      {/* By Carrier — from Figma */}
      {view==="carrier"&&(
        <ChartBox title="D&D Costs by Carrier" sub="Click on a bar to drill down and see breakdown by port" h={260}>
          <ResponsiveContainer>
            <BarChart data={carriers.map(c=>({name:c.scac,dem:Math.round(c.containers*demMult(c)),det:Math.round(c.containers*detMult(c))}))} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="name" stroke={T.dim} fontSize={9}/>
              <YAxis stroke={T.dim} fontSize={9} tickFormatter={v=>`${v}k`} width={45}/>
              <Tooltip content={<CTip/>}/>
              <Legend iconSize={8} wrapperStyle={{fontSize:9}}/>
              <Bar dataKey="dem" name="Demurrage" fill={T.red}/>
              <Bar dataKey="det" name="Detention"  fill={T.amber}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      )}

      {/* Carrier Scorecard — from existing Carrier Intel */}
      <div style={{marginTop:16}}>
        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border}}>
            <div style={{fontWeight:700,fontSize:14,color:T.text}}>Carrier Scorecard</div>
            <div style={{fontSize:11,color:T.sub}}>Origin & Destination dwell vs free period thresholds</div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead>
              <tr style={{background:T.bg}}>
                {["Carrier","Containers","O.Det avg","D.Det avg","Rating"].map(h=>(
                  <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:9,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:.4,borderBottom:"1px solid "+T.border}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {carriers.sort((a,b)=>b.avgODet-a.avgODet).map((c,i)=>{
                const rating=c.avgODet>5.1&&c.avgDDet>6?{l:"High Risk",col:T.red}:c.avgODet>5.1||c.avgDDet>6?{l:"Monitor",col:T.amber}:{l:"Good",col:T.green};
                return(
                  <tr key={c.scac} style={{background:i%2===0?"#fff":T.bg}}>
                    <td style={{padding:"9px 14px",fontWeight:700}}>{c.scac}</td>
                    <td style={{padding:"9px 14px",color:T.sub}}>{c.containers}</td>
                    <td style={{padding:"9px 14px",color:c.avgODet>5.1?T.red:T.green,fontWeight:600}}>{c.avgODet}d</td>
                    <td style={{padding:"9px 14px",color:c.avgDDet>6?T.red:T.green,fontWeight:600}}>{c.avgDDet}d</td>
                    <td style={{padding:"9px 14px"}}><Badge color={rating.col}>{rating.l}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
// helpers for by-carrier chart
const demMult=c=>c.avgODem*1.8;
const detMult=c=>c.avgODet*0.9;

// ═══════════════════════════════════════════════════════════
// PAGE: D&D OPTIMIZER (EXISTING content reused)
// = Cost Optimizer from dnd_dashboard.jsx (Group A/B model)
// More powerful than Figma's pickup scheduling concept for Tableau
// In Tableau: existing Cost Optimizer dashboard
// ═══════════════════════════════════════════════════════════
function DDOptimizerPage(){
  const containers=CDATA.topRisk.map(c=>({
    ...c,
    daily:Math.max(0,Math.round((c.cost3d-c.cost)/3)),
    fpStatus:c.oDet>10?"Expired":c.oDet>5?"Expiring 48h":"At Risk",
    riskLevel:c.risk>=77?"High":c.risk>=75?"Medium":"Low",
    todayCost:c.cost,sav3d:c.cost3d,
  })).sort((a,b)=>b.todayCost-a.todayCost);

  const totalToday=containers.reduce((s,c)=>s+c.todayCost,0);
  const dailyBurn=containers.reduce((s,c)=>s+c.daily,0);

  const FPS={Expired:T.red,"Expiring 48h":T.amber,"At Risk":"#D97706"};

  return(
    <div style={{flex:1,overflowY:"auto",padding:28,background:T.bg}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:700,color:T.text}}>D&D Optimizer</div>
        <div style={{fontSize:13,color:T.sub,marginTop:4}}>Prioritize container clearance to minimize D&D exposure. Group A vs Group B scenario comparison.</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <KPICard label="Containers at Risk" value={containers.length} color={T.text} icon={Package}/>
        <KPICard label="Total Exposure Today" value={fmt(totalToday)} color={T.red} urgency="critical"/>
        <KPICard label="Daily Burn Rate" value={fmt(dailyBurn)+"/d"} color={T.amber} urgency="warn"/>
        <KPICard label="Exposure in 30 Days" value={fmt(totalToday+dailyBurn*30)} color={T.red}/>
      </div>

      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid "+T.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:T.text}}>Container Priority List</div>
            <div style={{fontSize:11,color:T.sub}}>Sorted by avoidable cost — clear highest first</div>
          </div>
          <div style={{fontSize:11,color:T.sub}}>{containers.length} containers</div>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead>
            <tr style={{background:T.bg}}>
              {["Container","Carrier","Route","Category","FP Status","Avoidable Today","$/Day","Risk"].map(h=>(
                <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:9,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:.4,borderBottom:"1px solid "+T.border}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {containers.map((c,i)=>(
              <tr key={c.cn} style={{background:i%2===0?"#fff":T.bg,borderLeft:"3px solid "+(FPS[c.fpStatus]||T.amber)}}>
                <td style={{padding:"9px 12px",fontWeight:700,fontFamily:"monospace",fontSize:10}}>{c.cn}</td>
                <td style={{padding:"9px 12px"}}>{c.ca}</td>
                <td style={{padding:"9px 12px",color:T.sub,fontSize:10}}>{c.po}→{c.pd}</td>
                <td style={{padding:"9px 12px"}}><Badge color={catColor(c.cat)}>{c.cat}</Badge></td>
                <td style={{padding:"9px 12px"}}><span style={{color:FPS[c.fpStatus]||T.amber,fontWeight:700,fontSize:10}}>{c.fpStatus}</span></td>
                <td style={{padding:"9px 12px",fontWeight:700,color:T.green}}>
                  {fmt(c.todayCost)}<div style={{fontSize:8,color:T.sub}}>+3d: {fmt(c.sav3d)}</div>
                </td>
                <td style={{padding:"9px 12px",color:T.red,fontWeight:600}}>${c.daily}/d</td>
                <td style={{padding:"9px 12px"}}><SolidBadge color={c.riskLevel==="High"?T.red:c.riskLevel==="Medium"?T.amber:T.green}>{c.riskLevel}</SolidBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE: AI HUB
// = Ask D&D AI extension (already built and deployed)
// In Tableau: Ask D&D AI Tableau extension panel
// ═══════════════════════════════════════════════════════════
function AIHubPage(){
  return(
    <div style={{flex:1,overflowY:"auto",padding:28,background:T.bg}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:700,color:T.text}}>AI Hub</div>
        <div style={{fontSize:13,color:T.sub,marginTop:4}}>Ask questions about your D&D data in natural language</div>
      </div>
      <Card style={{minHeight:420,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,background:"linear-gradient(135deg,"+T.blueBg+","+T.purpleBg+")"}}>
        <div style={{width:56,height:56,background:"linear-gradient(135deg,"+T.blue+","+T.purple+")",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Zap size={26} color="#fff"/>
        </div>
        <div style={{fontSize:18,fontWeight:700,color:T.text}}>Ask D&D AI</div>
        <div style={{fontSize:13,color:T.sub,textAlign:"center",maxWidth:360}}>
          Reads live data from your Tableau dashboard. Deployed at logward-extensions.vercel.app/ask_dnd.html
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:400}}>
          {["Which carrier has the highest overdue cost?","How many containers expire in the next 48h?","What is the D&D cost for DEHAM→CNSHA?","Which containers should I clear first today?"].map(q=>(
            <div key={q} style={{background:"#fff",border:"1px solid "+T.border,borderRadius:8,padding:"10px 14px",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:8,color:T.text}}>
              <Search size={12} color={T.blue} style={{flexShrink:0}}/>{q}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT — Persona Hub
// ═══════════════════════════════════════════════════════════
export default function DnDPersonaHub(){
  const[persona,setPersona]=useState(PERSONAS.transport);
  const[page,setPage]=useState("tracking");
  const[showSettings,setShowSettings]=useState(false);

  const handlePersona=p=>{setPersona(p);setPage(p.nav[0]);setShowSettings(false);};
  const safePage=persona.nav.includes(page)?page:persona.nav[0];

  const pages={
    tracking: <LiveTrackingPage setPage={setPage}/>,
    map:      <GlobalMapPage/>,
    shipments:<ShipmentListPage/>,
    overview: <DDOverviewPage setPage={setPage}/>,
    analytics:<DDAnalyticsPage setPage={setPage}/>,
    optimizer:<DDOptimizerPage/>,
    aihub:    <AIHubPage/>,
  };

  const currentPageMeta=ALL_PAGES.find(p=>p.id===safePage);

  return(
    <div style={{display:"flex",height:"100vh",fontFamily:"'Roboto','Arial',sans-serif",color:T.text}}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;800&display=swap" rel="stylesheet"/>
      <Sidebar page={safePage} setPage={setPage} persona={persona} onSettings={()=>setShowSettings(true)}/>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:T.bg}}>
        {/* Breadcrumb bar */}
        <div style={{background:"#fff",borderBottom:"1px solid "+T.border,padding:"8px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,.03)"}}>
          <div style={{fontSize:11,color:T.sub}}>
            {currentPageMeta?.section}&nbsp;›&nbsp;
            <b style={{color:T.text}}>{currentPageMeta?.label}</b>
            <span style={{marginLeft:10,fontSize:9,color:T.dim}}>Tableau: {currentPageMeta?.tableau}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:10,color:T.dim}}>Last updated: 3 min ago</div>
            <div style={{background:T.greenBg,border:"1px solid "+T.green+"30",borderRadius:6,padding:"3px 10px",fontSize:10,color:T.green,fontWeight:600}}>
              {persona.icon} {persona.label}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {pages[safePage]}
        </div>
      </div>

      {showSettings&&<PersonaModal persona={persona} setPersona={handlePersona} onClose={()=>setShowSettings(false)}/>}
    </div>
  );
}
