import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// ── THEME ─────────────────────────────────────────────────────────────────────
const T={bg:'#F4F5F7',white:'#FFFFFF',border:'#E5E7EB',text:'#111827',sub:'#6B7280',dim:'#9CA3AF',
  blue:'#2563EB',blueBg:'#EFF6FF',blueMid:'#BFDBFE',red:'#EF4444',
  shadow:'0 1px 3px rgba(0,0,0,.06)',shadowMd:'0 4px 16px rgba(0,0,0,.10)'};

// ── SHAPE OPTIONS ─────────────────────────────────────────────────────────────
const SHAPES=[
  {id:'none',label:'None',g:''},
  {id:'circle',label:'● Circle',g:'●'},{id:'circle-o',label:'○ Circle-o',g:'○'},
  {id:'square',label:'■ Square',g:'■'},{id:'square-o',label:'□ Square-o',g:'□'},
  {id:'tri-up',label:'▲ Triangle ▲',g:'▲'},{id:'tri-dn',label:'▼ Triangle ▼',g:'▼'},
  {id:'diamond',label:'◆ Diamond',g:'◆'},{id:'diamond-o',label:'◇ Diamond-o',g:'◇'},
  {id:'star',label:'★ Star',g:'★'},{id:'star-o',label:'☆ Star-o',g:'☆'},
  {id:'check',label:'✓ Check',g:'✓'},{id:'cross',label:'✕ Cross',g:'✕'},
  {id:'plus',label:'+ Plus',g:'+'},{id:'warn',label:'⚠ Warning',g:'⚠'},
  {id:'info',label:'ℹ Info',g:'ℹ'},{id:'arrow-r',label:'→ Arrow →',g:'→'},
  {id:'dot',label:'• Dot',g:'•'},
];
const G2ID=Object.fromEntries(SHAPES.map(s=>[s.g,s.id]));

// ── TABLEAU PALETTES ──────────────────────────────────────────────────────────
const PALETTES={
  'Tableau 10':['#4E79A7','#F28E2B','#E15759','#76B7B2','#59A14F','#EDC948','#B07AA1','#FF9DA7','#9C755F','#BAB0AC'],
  'Tableau 20':['#4E79A7','#A0CBE8','#F28E2B','#FFBE7D','#59A14F','#8CD17D','#B6992D','#F1CE63','#499894','#86BCB6','#E15759','#FF9D9A','#79706E','#BAB0AC','#D37295','#FABFD2','#B07AA1','#D4A6C8','#9D7660','#D7B5A6'],
  'Color Blind':['#1170AA','#FC7D0B','#A3ACB9','#57606C','#5FA2CE','#C85200','#7B848F','#A3CCE9','#E08B55','#D0CCC5'],
  'Traffic Light':['#ED1C24','#FF7F00','#FFFF00','#00A14B','#0072BC','#92278F'],
  'Status':['#2ECC71','#F39C12','#E74C3C','#3498DB','#9B59B6','#95A5A6'],
  'Blue-Teal':['#1A1A6E','#2B4BA3','#3E7AC7','#5DA9E9','#7DC4F5','#A5D8FA','#08546A','#0E8FA3','#1DBFCC','#40D6E0'],
  'Orange-Gold':['#7B2D00','#C03B00','#E25C00','#F28B1E','#F5A623','#F7C244','#FAD978','#FDE9A6','#B07A32','#D4A44C'],
  'Purple-Gray':['#1A0030','#3B0064','#6200A0','#9B2FBE','#C55FDB','#D98EEA','#E8B5F4','#F3D5F9','#6B6B80','#A9A9B8'],
  'Green-Gold':['#2D4A1E','#4A7A2E','#6CAF40','#95D15A','#B8E380','#D3F0A6','#1E5C2D','#2D8C44','#3DB85E','#74D494'],
  'Hue Circle':['#1F77B4','#FF7F0E','#2CA02C','#D62728','#9467BD','#8C564B','#E377C2','#7F7F7F','#BCBD22','#17BECF'],
};
const PAL_NAMES=Object.keys(PALETTES);

// ── FONT FAMILIES ─────────────────────────────────────────────────────────────
const FONTS=["Arial,Helvetica,sans-serif","'Inter','Segoe UI',sans-serif","'Roboto',Arial,sans-serif",
  "'Open Sans',sans-serif","Georgia,'Times New Roman',serif","'Courier New',Courier,monospace","system-ui,sans-serif"];

// ── CONDITIONAL RULE OPERATORS ────────────────────────────────────────────────
const OPERATORS=[
  {id:'equals',label:'= Equals'},{id:'not_equals',label:'≠ Not equals'},
  {id:'contains',label:'Contains'},{id:'starts_with',label:'Starts with'},
  {id:'gt',label:'> Greater than'},{id:'lt',label:'< Less than'},
  {id:'gte',label:'≥ ≥ Greater or equal'},{id:'lte',label:'≤ ≤ Less or equal'},
  {id:'is_empty',label:'Is empty'},{id:'is_not_empty',label:'Is not empty'},
];

// ── FORMAT TYPES ──────────────────────────────────────────────────────────────
const FMT_TYPES=[
  {id:'text',label:'Text'},{id:'badge',label:'Badge'},
  {id:'link',label:'Link'},{id:'number',label:'Number'},
  {id:'currency',label:'Currency'},{id:'duration',label:'Duration'},
  {id:'percent',label:'Percentage'},{id:'date',label:'Date'},
];

// ── STORAGE ───────────────────────────────────────────────────────────────────
const SK='te_cfg_v2';
function loadCfg(){try{return JSON.parse(localStorage.getItem(SK)||'{}')}catch{return{}}}
function saveCfg(c){localStorage.setItem(SK,JSON.stringify(c))}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function isLight(hex){
  if(!hex||hex.length<7)return true;
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return(r*299+g*587+b*114)/1000>128;
}
function autoLabel(field){
  return field.replace(/^(transportUnit\.|surchargeSnapshot\.|pod\.|pol\.|cf\.|gl\.)/,'')
    .replace(/([a-z])([A-Z])/g,'$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g,'$1 $2')
    .replace(/_/g,' ').trim().toUpperCase();
}
function doExport(cols,rows){
  const e=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const csv=[cols.map(c=>e(c.label)).join(','),...rows.map(r=>cols.map(c=>e(r[c.field])).join(','))].join('\n');
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='export_'+new Date().toISOString().slice(0,10)+'.csv';a.click();
}
function evalRule(rule,row){
  const rv=String(row[rule.field]||'');const tv=rule.value||'';
  switch(rule.op){
    case 'equals':return rv.toLowerCase()===tv.toLowerCase();
    case 'not_equals':return rv.toLowerCase()!==tv.toLowerCase();
    case 'contains':return rv.toLowerCase().includes(tv.toLowerCase());
    case 'starts_with':return rv.toLowerCase().startsWith(tv.toLowerCase());
    case 'gt':return parseFloat(rv)>parseFloat(tv);
    case 'lt':return parseFloat(rv)<parseFloat(tv);
    case 'gte':return parseFloat(rv)>=parseFloat(tv);
    case 'lte':return parseFloat(rv)<=parseFloat(tv);
    case 'is_empty':return!rv||rv==='Null'||rv==='null';
    case 'is_not_empty':return!!(rv&&rv!=='Null'&&rv!=='null');
    default:return false;
  }
}

// ── CELL VALUE ────────────────────────────────────────────────────────────────
function CellValue({value,fieldName,colorRules,columnFormats,condRules,row,gs}){
  const raw=value==null||value===''||value==='Null'||value==='null'?null:String(value);
  const fontSize=Math.max(11,gs?.fontSize||13);
  const fontFamily=(gs?.fontFamily||T.text);
  if(raw===null)return<span style={{color:T.dim,fontSize}}>—</span>;
  const fmt=columnFormats?.[fieldName]||{type:'text'};
  const cr=colorRules?.[fieldName]?.[raw];
  // Cell-level conditional rules override
  const matchedCellRule=condRules?.find(r=>r.scope==='cell'&&r.targetField===fieldName&&evalRule(r,row));

  if(fmt.type==='badge'||cr){
    let bg='#F3F4F6',fg='#374151',icon='';
    if(cr){bg=cr.bg||bg;fg=cr.fg||(isLight(bg)?'#1F2937':'#FFFFFF');}
    icon=colorRules?.[fieldName]?._shape||cr?.icon||'';
    if(matchedCellRule){bg=matchedCellRule.style?.bg||bg;fg=matchedCellRule.style?.fg||fg;if(matchedCellRule.style?.shape)icon=matchedCellRule.style.shape;}
    return(
      <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',
        borderRadius:16,background:bg,color:fg,fontSize:Math.max(10,fontSize-2),
        fontFamily,fontWeight:600,letterSpacing:'0.3px',whiteSpace:'nowrap',lineHeight:1.3}}>
        {icon&&<span style={{fontSize:9,lineHeight:1}}>{icon}</span>}{raw}
      </span>
    );
  }
  let extraStyle={};
  if(matchedCellRule?.style){extraStyle={background:matchedCellRule.style.bg||undefined,color:matchedCellRule.style.fg||undefined,fontWeight:matchedCellRule.style.bold?700:undefined,padding:'2px 6px',borderRadius:6};}
  if(fmt.type==='currency'){
    const n=parseFloat(raw.replace(/[^0-9.-]/g,''));
    if(isNaN(n))return<span style={{fontSize,fontFamily,...extraStyle}}>{raw}</span>;
    const sym=fmt.symbol||'$',dec=fmt.decimals??1;
    const f=n>=1000?sym+(n/1000).toFixed(dec)+'K':sym+n.toFixed(dec).replace(/\.0$/,'');
    return<span style={{fontWeight:600,fontSize,fontFamily,...extraStyle}}>{f}</span>;
  }
  if(fmt.type==='number'){
    const n=parseFloat(raw.replace(/[^0-9.-]/g,''));
    if(isNaN(n))return<span style={{fontSize,fontFamily,...extraStyle}}>{raw}</span>;
    const dec=fmt.decimals??0;
    return<span style={{fontSize,fontFamily,...extraStyle}}>{n.toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec})}</span>;
  }
  if(fmt.type==='duration'){
    const n=parseFloat(raw.replace(/[^0-9.-]/g,''));
    if(isNaN(n)||n===0)return<span style={{color:T.dim,fontSize}}>—</span>;
    const unit=fmt.unit||'d',cp=fmt.colorPositive||'#DC2626',cn=fmt.colorNegative||'#059669';
    return<span style={{color:n>0?cp:cn,fontWeight:700,fontSize,fontFamily,...extraStyle}}>{n>0?'+':''}{Math.abs(n)}{unit}</span>;
  }
  if(fmt.type==='percent'){
    const n=parseFloat(raw.replace(/[^0-9.-]/g,''));
    if(isNaN(n))return<span style={{fontSize,fontFamily,...extraStyle}}>{raw}</span>;
    return<span style={{fontSize,fontFamily,...extraStyle}}>{n.toFixed(fmt.decimals??1)}%</span>;
  }
  if(fmt.type==='link')return<span style={{color:T.blue,fontWeight:500,fontSize,fontFamily,cursor:'pointer',...extraStyle}}>{raw}</span>;
  return<span style={{fontSize,fontFamily,...extraStyle}}>{raw}</span>;
}

// ── ERROR BOUNDARY ────────────────────────────────────────────────────────────
class EB extends React.Component{
  state={err:null};
  static getDerivedStateFromError(e){return{err:e};}
  render(){
    if(this.state.err)return(
      <div style={{padding:24,fontFamily:'monospace',fontSize:12,color:T.red,background:'#FEF2F2',minHeight:'100vh',whiteSpace:'pre-wrap'}}>
        {'Extension error:\n'+this.state.err?.message+'\n\n'+this.state.err?.stack}
      </div>
    );
    return this.props.children;
  }
}

// ── PREFERENCES.TPS IMPORTER ─────────────────────────────────────────────────
function TpsImporter({onImport}){
  const[txt,setTxt]=useState('');const[st,setSt]=useState(null);
  function fromFile(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>setTxt(ev.target.result||'');r.readAsText(f);}
  function go(){
    if(!txt.trim()){setSt({ok:false,msg:'Paste or upload a .tps file.'});return;}
    try{
      const doc=new DOMParser().parseFromString(txt,'text/xml');
      const res={};
      doc.querySelectorAll('color-palette').forEach(p=>{
        const n=p.getAttribute('name');if(!n)return;
        const c=Array.from(p.querySelectorAll('color')).map(x=>x.textContent.trim()).filter(x=>/^#[0-9A-Fa-f]{6}$/.test(x));
        if(c.length)res[n]=c;
      });
      const n=Object.keys(res).length;
      if(!n){setSt({ok:false,msg:'No <color-palette> elements found.'});return;}
      onImport(res);setSt({ok:true,msg:`Imported ${n} palette${n!==1?'s':''}.`});setTxt('');
    }catch(e){setSt({ok:false,msg:'Parse error: '+e.message});}
  }
  return(
    <div>
      <label style={{display:'inline-flex',alignItems:'center',gap:7,padding:'7px 14px',borderRadius:8,border:'1px solid '+T.border,background:T.white,cursor:'pointer',fontSize:12,fontWeight:500,color:T.text,marginBottom:8}}>
        📂 Choose .tps file<input type="file" accept=".tps,.xml" onChange={fromFile} style={{display:'none'}}/>
      </label>
      <div style={{fontSize:11,color:T.sub,marginBottom:6}}>— or paste XML —</div>
      <textarea value={txt} onChange={e=>setTxt(e.target.value)} rows={3}
        placeholder="<?xml version='1.0'?><workbook><preferences>..."
        style={{width:'100%',padding:'8px',border:'1px solid '+T.border,borderRadius:8,fontSize:11,fontFamily:'monospace',outline:'none',resize:'vertical',boxSizing:'border-box',marginBottom:8}}/>
      <button onClick={go} style={{padding:'7px 16px',borderRadius:8,border:'none',background:T.blue,color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>Import</button>
      {st&&<div style={{marginTop:8,fontSize:12,padding:'8px 12px',borderRadius:7,color:st.ok?'#065F46':T.red,background:st.ok?'#D1FAE5':'#FEF2F2',border:'1px solid '+(st.ok?'#6EE7B7':'#FCA5A5')}}>{st.ok?'✓ ':''}{st.msg}</div>}
    </div>
  );
}

// ── CUSTOM PALETTE EDITOR ─────────────────────────────────────────────────────
function CPEditor({cp,onChange}){
  const[pals,setPals]=useState(()=>cp||{});const[open,setOpen]=useState(null);
  const[nn,setNn]=useState('');const[err,setErr]=useState('');const[ac,setAc]=useState('#4E79A7');
  function save(u){setPals(u);onChange(u);}
  function create(){const n=nn.trim();if(!n){setErr('Required');return;}if(PALETTES[n]||pals[n]){setErr('Already used');return;}save({...pals,[n]:[]});setOpen(n);setNn('');setErr('');}
  function del(n){const u={...pals};delete u[n];save(u);if(open===n)setOpen(null);}
  const names=Object.keys(pals);
  return(
    <div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        <div style={{flex:1}}><input value={nn} onChange={e=>{setNn(e.target.value);setErr('');}} onKeyDown={e=>e.key==='Enter'&&create()} placeholder="New palette name…" style={{width:'100%',padding:'9px 12px',border:'1px solid '+(err?T.red:T.border),borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}}/>{err&&<div style={{fontSize:11,color:T.red,marginTop:3}}>{err}</div>}</div>
        <button onClick={create} style={{padding:'9px 16px',borderRadius:8,border:'none',background:T.blue,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',flexShrink:0}}>+ Create</button>
      </div>
      {!names.length&&<div style={{textAlign:'center',padding:'24px 0',color:T.dim,fontSize:13,border:'1px dashed '+T.border,borderRadius:10}}>No custom palettes yet.</div>}
      {names.map(name=>{
        const cols=pals[name]||[];const isOpen=open===name;
        return(
          <div key={name} style={{border:'1px solid '+T.border,borderRadius:10,marginBottom:10,overflow:'hidden'}}>
            <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:10,background:isOpen?T.blueBg:'#FAFAFA',cursor:'pointer',userSelect:'none'}} onClick={()=>setOpen(isOpen?null:name)}>
              <span style={{fontSize:13,fontWeight:600,color:T.text,flex:1}}>{name}</span>
              <div style={{display:'flex',gap:3}}>{cols.slice(0,12).map((c,i)=><div key={i} style={{width:14,height:14,borderRadius:3,background:c,border:'1px solid rgba(0,0,0,.1)'}}/>)}{!cols.length&&<span style={{fontSize:11,color:T.dim,fontStyle:'italic'}}>empty</span>}</div>
              <button onClick={e=>{e.stopPropagation();del(name);}} style={{background:'#FEF2F2',border:'1px solid #FCA5A5',borderRadius:6,padding:'3px 8px',color:T.red,fontSize:11,cursor:'pointer'}}>Del</button>
              <span style={{color:T.sub,fontSize:11}}>{isOpen?'▲':'▼'}</span>
            </div>
            {isOpen&&(
              <div style={{padding:16,borderTop:'1px solid '+T.border}}>
                {cols.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>{cols.map((c,i)=>(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    <input type="color" value={c} onChange={e=>{const a=[...pals[name]];a[i]=e.target.value;save({...pals,[name]:a});}} style={{width:38,height:38,padding:2,border:'1px solid '+T.border,borderRadius:7,cursor:'pointer',background:'none'}}/>
                    <button onClick={()=>save({...pals,[name]:cols.filter((_,j)=>j!==i)})} style={{background:'none',border:'none',cursor:'pointer',color:T.dim,fontSize:11,padding:0}}>×</button>
                  </div>
                ))}</div>}
                <div style={{display:'flex',gap:8,alignItems:'center',padding:10,background:T.bg,borderRadius:8,marginBottom:10}}>
                  <input type="color" value={ac} onChange={e=>setAc(e.target.value)} style={{width:38,height:34,padding:2,border:'1px solid '+T.border,borderRadius:6,cursor:'pointer',background:'none',flexShrink:0}}/>
                  <span style={{fontSize:11,color:T.sub,flex:1,fontFamily:'monospace'}}>{ac}</span>
                  <button onClick={()=>save({...pals,[name]:[...cols,ac]})} style={{padding:'6px 12px',borderRadius:7,border:'none',background:T.blue,color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer',flexShrink:0}}>+ Add</button>
                </div>
                <div style={{fontSize:11,color:T.sub,marginBottom:6}}>Quick-add from Tableau 10:</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:4}}>{PALETTES['Tableau 10'].map((c,i)=><div key={i} title={c} onClick={()=>save({...pals,[name]:[...cols,c]})} style={{width:20,height:20,borderRadius:4,background:c,cursor:'pointer',border:'1px solid rgba(0,0,0,.1)',transition:'transform .1s'}} onMouseEnter={e=>e.target.style.transform='scale(1.3)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}/>)}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── COLUMN PICKER DROPDOWN ────────────────────────────────────────────────────
function ColDrop({allCols,visible,onToggle,onClose}){
  const ref=useRef(null);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))onClose();};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[onClose]);
  return(
    <div ref={ref} style={{position:'absolute',right:0,top:'100%',zIndex:200,marginTop:4,background:T.white,border:'1px solid '+T.border,borderRadius:10,boxShadow:T.shadowMd,padding:'6px 0',minWidth:210,maxHeight:340,overflowY:'auto'}}>
      <div style={{padding:'8px 14px 6px',fontSize:10,fontWeight:700,color:T.dim,textTransform:'uppercase',letterSpacing:'0.5px',borderBottom:'1px solid '+T.border,marginBottom:4}}>Toggle Columns</div>
      {allCols.map(col=>(
        <label key={col.field} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 14px',cursor:'pointer',fontSize:12,color:T.text,userSelect:'none',background:visible.includes(col.field)?T.blueBg:T.white}}>
          <input type="checkbox" checked={visible.includes(col.field)} onChange={()=>onToggle(col.field)} style={{cursor:'pointer'}}/>
          {col.label}
        </label>
      ))}
    </div>
  );
}

// ── SETTINGS MODAL ────────────────────────────────────────────────────────────
function Settings({allCols,allRows,cfg,onSave,onClose,availSheets}){
  const[tab,setTab]             = useState('general');
  const[tname,setTname]         = useState(()=>cfg.tableName||'');
  const[tdesc,setTdesc]         = useState(()=>cfg.tableDesc||'');
  const[gs,setGs]               = useState(()=>cfg.gs||{});
  const[selCols,setSelCols]     = useState(()=>cfg.selectedColumns||[]);
  const[fmts,setFmts]           = useState(()=>cfg.columnFormats||{});
  const[cr,setCr]               = useState(()=>cfg.colorRules||{});
  const[cond,setCond]           = useState(()=>cfg.condRules||[]);
  const[cp,setCp]               = useState(()=>cfg.customPalettes||{});
  const selColFields=useMemo(()=>(cfg.selectedColumns||[]).map(c=>c.field),[cfg.selectedColumns]);
  const selColsOnly=useMemo(()=>allCols.filter(c=>selColFields.includes(c.field)),[allCols,selColFields]);
  const[selF,setSelF]           = useState(()=>(cfg.selectedColumns?.[0]?.field)||allCols[0]?.field||'');
  const[pal,setPal]             = useState('Tableau 10');
  const[expandCol,setExpandCol] = useState(null);

  const allPals=useMemo(()=>({...PALETTES,...cp}),[cp]);
  const allPalNames=useMemo(()=>Object.keys(allPals),[allPals]);
  const uniqueVals=useMemo(()=>{
    if(!selF)return[];const s=new Set();
    allRows.forEach(r=>{const v=String(r[selF]||'');if(v&&v!=='Null'&&v!=='null')s.add(v);});
    return Array.from(s).sort();
  },[selF,allRows]);

  const selFieldNames=selCols.map(c=>c.field);
  const availCols=allCols.filter(c=>!selFieldNames.includes(c.field));
  const addCol=col=>{setSelCols(p=>[...p,{field:col.field,displayLabel:'',headerStyle:{}}]);}
  const removeCol=field=>{setSelCols(p=>p.filter(c=>c.field!==field));};
  const moveUp=i=>{if(i===0)return;setSelCols(p=>{const a=[...p];[a[i-1],a[i]]=[a[i],a[i-1]];return a;});};
  const moveDown=i=>{setSelCols(p=>{if(i>=p.length-1)return p;const a=[...p];[a[i],a[i+1]]=[a[i+1],a[i]];return a;});};
  const updateSC=(field,key,val)=>setSelCols(p=>p.map(c=>c.field===field?{...c,[key]:val}:c));
  const updateHS=(field,key,val)=>setSelCols(p=>p.map(c=>c.field===field?{...c,headerStyle:{...(c.headerStyle||{}),[key]:val}}:c));

  function autoAssign(){
    const pl=allPals[pal]||[];if(!pl.length)return;
    const u={...(cr[selF]||{})};
    uniqueVals.forEach((v,i)=>{u[v]={bg:pl[i%pl.length],fg:isLight(pl[i%pl.length])?'#1F2937':'#FFFFFF'};});
    setCr(p=>({...p,[selF]:u}));
  }
  function setVColor(v,bg){const fg=isLight(bg)?'#1F2937':'#FFFFFF';setCr(p=>({...p,[selF]:{...(p[selF]||{}),[v]:{...((p[selF]||{})[v]||{}),bg,fg}}}))}
  function setColShape(g){setCr(p=>({...p,[selF]:{...(p[selF]||{}),_shape:g}}));}
  function clearField(){setCr(p=>{const n={...p};delete n[selF];return n;})}

  function addCond(){const f=selColsOnly[0]?.field||allCols[0]?.field||'';setCond(p=>[...p,{id:Date.now()+'',field:f,op:'equals',value:'',scope:'cell',targetField:f,style:{bg:'#FEF3C7',fg:'',bold:false}}]);}
  function delCond(id){setCond(p=>p.filter(r=>r.id!==id));}
  function updCond(id,k,v){setCond(p=>p.map(r=>r.id===id?{...r,[k]:v}:r));}
  function updCondStyle(id,k,v){setCond(p=>p.map(r=>r.id===id?{...r,style:{...r.style,[k]:v}}:r));}

  const TS=k=>({padding:'9px 14px',border:'none',cursor:'pointer',background:'none',fontSize:12,
    fontWeight:tab===k?700:400,color:tab===k?T.blue:T.sub,
    borderBottom:tab===k?'2px solid '+T.blue:'2px solid transparent',whiteSpace:'nowrap'});
  const LBL={display:'block',fontSize:11,fontWeight:700,color:T.sub,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:5};
  const INP={padding:'8px 10px',border:'1px solid '+T.border,borderRadius:7,fontSize:13,outline:'none',color:T.text,background:T.white,width:'100%',boxSizing:'border-box'};
  const SEL={...INP,cursor:'pointer'};

  return(
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'stretch',justifyContent:'flex-end'}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.35)'}} onClick={onClose}/>
      <div style={{position:'relative',width:560,background:T.white,boxShadow:'-4px 0 24px rgba(0,0,0,.12)',display:'flex',flexDirection:'column'}}>

        {/* Header */}
        <div style={{padding:'20px 24px 0',borderBottom:'1px solid '+T.border,flexShrink:0}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:16,fontWeight:700,color:T.text}}>⚙ Table Settings</div>
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:T.sub,lineHeight:1,padding:'0 4px'}}>×</button>
          </div>
          <div style={{display:'flex',gap:0,overflowX:'auto'}}>
            {[['general','⚡ General'],['columns','⊞ Columns'],['format','◈ Format'],['colors','🎨 Color Rules'],['rules','⚠ Cond. Rules'],['palettes','🖌 Palettes']].map(([k,l])=>(
              <button key={k} style={TS(k)} onClick={()=>setTab(k)}>{l}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{flex:1,padding:24,overflowY:'auto'}}>

          {/* ── GENERAL ── */}
          {tab==='general'&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div><label style={LBL}>Table Name</label><input value={tname} onChange={e=>setTname(e.target.value)} placeholder="Enter table title…" style={INP}/></div>
              <div><label style={LBL}>Description (shows below title)</label><textarea value={tdesc} onChange={e=>setTdesc(e.target.value)} placeholder="Optional description…" rows={2} style={{...INP,resize:'vertical'}}/></div>

              {/* Data source selector */}
              {availSheets?.length>0&&(
                <div style={{background:T.blueBg,border:'1px solid '+T.blueMid,borderRadius:10,padding:'14px 16px'}}>
                  <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:10,textTransform:'uppercase',letterSpacing:'0.5px'}}>📊 Data Sheet</div>
                  <div><label style={LBL}>Sheet providing data</label>
                    <select value={cfg.worksheetName||''} onChange={e=>{cfg.worksheetName=e.target.value;}} style={SEL}>
                      {availSheets.map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <hr style={{border:'none',borderTop:'1px solid '+T.border}}/>
              <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:-8}}>Global Table Style</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={LBL}>Font Family</label>
                  <select value={gs.fontFamily||FONTS[0]} onChange={e=>setGs(p=>({...p,fontFamily:e.target.value}))} style={SEL}>
                    {FONTS.map(f=><option key={f} value={f}>{f.split(',')[0].replace(/'/g,'')}</option>)}
                  </select>
                </div>
                <div><label style={LBL}>Font Size (px)</label>
                  <input type="number" min="11" max="22" value={gs.fontSize||13} onChange={e=>setGs(p=>({...p,fontSize:Math.max(11,parseInt(e.target.value)||13)}))} style={INP}/>
                </div>
                <div><label style={LBL}>Row Height (px)</label>
                  <input type="number" min="36" max="100" value={gs.rowHeight||50} onChange={e=>setGs(p=>({...p,rowHeight:parseInt(e.target.value)}))} style={INP}/>
                </div>
                <div><label style={LBL}>Cell Text Color</label>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <input type="color" value={gs.cellColor||'#111827'} onChange={e=>setGs(p=>({...p,cellColor:e.target.value}))} style={{width:40,height:34,padding:2,border:'1px solid '+T.border,borderRadius:7,cursor:'pointer',background:'none'}}/>
                    <span style={{fontSize:12,color:T.sub,fontFamily:'monospace'}}>{gs.cellColor||'#111827'}</span>
                  </div>
                </div>
                <div><label style={LBL}>Header Background</label>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <input type="color" value={gs.headerBg||'#FAFBFC'} onChange={e=>setGs(p=>({...p,headerBg:e.target.value}))} style={{width:40,height:34,padding:2,border:'1px solid '+T.border,borderRadius:7,cursor:'pointer',background:'none'}}/>
                    <span style={{fontSize:12,color:T.sub,fontFamily:'monospace'}}>{gs.headerBg||'#FAFBFC'}</span>
                  </div>
                </div>
                <div><label style={LBL}>Header Text Color</label>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <input type="color" value={gs.headerColor||'#6B7280'} onChange={e=>setGs(p=>({...p,headerColor:e.target.value}))} style={{width:40,height:34,padding:2,border:'1px solid '+T.border,borderRadius:7,cursor:'pointer',background:'none'}}/>
                    <span style={{fontSize:12,color:T.sub,fontFamily:'monospace'}}>{gs.headerColor||'#6B7280'}</span>
                  </div>
                </div>
                <div><label style={LBL}>Row Stripe Color</label>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <input type="color" value={gs.stripeColor||'#FAFAFA'} onChange={e=>setGs(p=>({...p,stripeColor:e.target.value}))} style={{width:40,height:34,padding:2,border:'1px solid '+T.border,borderRadius:7,cursor:'pointer',background:'none'}}/>
                    <span style={{fontSize:12,color:T.sub,fontFamily:'monospace'}}>{gs.stripeColor||'#FAFAFA'}</span>
                  </div>
                </div>
                <div><label style={LBL}>Row Hover Color</label>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <input type="color" value={gs.hoverColor||'#F5F8FF'} onChange={e=>setGs(p=>({...p,hoverColor:e.target.value}))} style={{width:40,height:34,padding:2,border:'1px solid '+T.border,borderRadius:7,cursor:'pointer',background:'none'}}/>
                    <span style={{fontSize:12,color:T.sub,fontFamily:'monospace'}}>{gs.hoverColor||'#F5F8FF'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── COLUMNS ── */}
          {tab==='columns'&&(
            <div>
              <p style={{fontSize:12,color:T.sub,marginBottom:16,lineHeight:1.65}}>
                Add columns from the datasource one by one. Reorder with ↑↓. Expand to set custom header label and styling.
              </p>
              {/* Available columns to add */}
              {availCols.length>0&&(
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:11,fontWeight:700,color:T.sub,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>Available Columns</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {availCols.map(col=>(
                      <button key={col.field} onClick={()=>addCol(col)}
                        style={{padding:'5px 12px',borderRadius:20,border:'1px solid '+T.border,background:T.white,fontSize:12,color:T.text,cursor:'pointer',display:'flex',alignItems:'center',gap:5}}
                        onMouseEnter={e=>{e.currentTarget.style.background=T.blueBg;e.currentTarget.style.borderColor=T.blue;e.currentTarget.style.color=T.blue;}}
                        onMouseLeave={e=>{e.currentTarget.style.background=T.white;e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.text;}}>
                        + {col.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Selected columns */}
              <div style={{fontSize:11,fontWeight:700,color:T.sub,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>
                Selected Columns ({selCols.length})
              </div>
              {selCols.length===0&&(
                <div style={{textAlign:'center',padding:'28px 0',color:T.dim,fontSize:13,border:'1px dashed '+T.border,borderRadius:10}}>
                  Click a column above to add it to the table.
                </div>
              )}
              {selCols.map((sc,i)=>{
                const col=allCols.find(c=>c.field===sc.field);
                const isX=expandCol===sc.field;
                return(
                  <div key={sc.field} style={{border:'1px solid '+T.border,borderRadius:10,marginBottom:8,overflow:'hidden'}}>
                    <div style={{padding:'11px 14px',display:'flex',alignItems:'center',gap:8,background:isX?T.blueBg:T.white}}>
                      <div style={{display:'flex',flexDirection:'column',gap:2,flexShrink:0}}>
                        <button onClick={()=>moveUp(i)} disabled={i===0} style={{background:'none',border:'none',cursor:i===0?'not-allowed':'pointer',color:i===0?T.dim:T.sub,fontSize:10,lineHeight:1,padding:0}}>▲</button>
                        <button onClick={()=>moveDown(i)} disabled={i===selCols.length-1} style={{background:'none',border:'none',cursor:i===selCols.length-1?'not-allowed':'pointer',color:i===selCols.length-1?T.dim:T.sub,fontSize:10,lineHeight:1,padding:0}}>▼</button>
                      </div>
                      <input value={sc.displayLabel||''} onChange={e=>updateSC(sc.field,'displayLabel',e.target.value)} placeholder={col?.label||sc.field}
                        style={{border:'1px solid transparent',background:'transparent',fontSize:13,fontWeight:500,color:T.text,flex:1,outline:'none',borderRadius:4,padding:'1px 4px',minWidth:0}}
                        onFocus={e=>{e.target.style.borderColor=T.blue;e.target.style.background=T.white;}}
                        onBlur={e=>{e.target.style.borderColor='transparent';e.target.style.background='transparent';}}
                        title="Click to rename column header"/>
                      <span style={{fontSize:10,color:T.dim,fontFamily:'monospace',background:T.bg,padding:'2px 6px',borderRadius:4,flexShrink:0,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sc.field}</span>
                      <button onClick={()=>setExpandCol(isX?null:sc.field)} title="Header styling" style={{background:'none',border:'none',cursor:'pointer',color:T.sub,fontSize:11,padding:'2px 4px'}}>⚙</button>
                      <button onClick={()=>removeCol(sc.field)} style={{background:'none',border:'none',cursor:'pointer',color:T.red,fontSize:13,padding:'2px 4px',lineHeight:1}}>×</button>
                    </div>
                    {isX&&(
                      <div style={{padding:'14px 16px',borderTop:'1px solid '+T.border,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                        <div style={{gridColumn:'1/-1'}}>
                          <label style={LBL}>Display Label (overrides datasource name)</label>
                          <input value={sc.displayLabel||''} onChange={e=>updateSC(sc.field,'displayLabel',e.target.value)} placeholder={col?.label||sc.field} style={INP}/>
                        </div>
                        <div><label style={LBL}>Header Font Weight</label>
                          <select value={sc.headerStyle?.fontWeight||700} onChange={e=>updateHS(sc.field,'fontWeight',parseInt(e.target.value))} style={SEL}>
                            <option value={400}>Normal</option><option value={600}>Semi-bold</option><option value={700}>Bold</option>
                          </select>
                        </div>
                        <div><label style={LBL}>Header Font Size (px)</label>
                          <input type="number" min="9" max="16" value={sc.headerStyle?.fontSize||11} onChange={e=>updateHS(sc.field,'fontSize',parseInt(e.target.value))} style={INP}/>
                        </div>
                        <div><label style={LBL}>Header Text Color</label>
                          <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <input type="color" value={sc.headerStyle?.color||gs.headerColor||'#6B7280'} onChange={e=>updateHS(sc.field,'color',e.target.value)} style={{width:38,height:32,padding:2,border:'1px solid '+T.border,borderRadius:6,cursor:'pointer',background:'none'}}/>
                            <span style={{fontSize:11,color:T.sub,fontFamily:'monospace'}}>{sc.headerStyle?.color||'default'}</span>
                          </div>
                        </div>
                        <div><label style={LBL}>Header Background</label>
                          <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <input type="color" value={sc.headerStyle?.bg||gs.headerBg||'#FAFBFC'} onChange={e=>updateHS(sc.field,'bg',e.target.value)} style={{width:38,height:32,padding:2,border:'1px solid '+T.border,borderRadius:6,cursor:'pointer',background:'none'}}/>
                            <span style={{fontSize:11,color:T.sub,fontFamily:'monospace'}}>{sc.headerStyle?.bg||'default'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── FORMAT ── */}
          {tab==='format'&&(
            <div>
              <p style={{fontSize:12,color:T.sub,marginBottom:16,lineHeight:1.65}}>Set cell rendering format per column.</p>
              {(()=>{
                const selFields=(cfg.selectedColumns||[]).map(s=>s.field);
                const fmtCols=allCols.filter(c=>selFields.includes(c.field));
                if(!fmtCols.length)return<div style={{textAlign:'center',padding:'40px 0',color:T.dim,fontSize:13}}>{allCols.length?'Add columns to your table first (Columns tab).':'No columns loaded.'}</div>;
                return fmtCols.map((col,i)=>{
                  const fmt=fmts[col.field]||{type:'text'};
                  const setF=val=>setFmts(p=>({...p,[col.field]:{...(p[col.field]||{}),type:val}}));
                  const setFProp=(k,v)=>setFmts(p=>({...p,[col.field]:{...(p[col.field]||{type:'text'}),[k]:v}}));
                  return(
                    <div key={col.field} style={{borderBottom:i<fmtCols.length-1?'1px solid '+T.border:'none',padding:'14px 0',display:'flex',flexDirection:'column',gap:12}}>
                      {/* Column header row */}
                      <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                        <div style={{flex:1,minWidth:120}}>
                          <div style={{fontSize:13,fontWeight:700,color:T.text,letterSpacing:'0.01em'}}>{col.label}</div>
                        </div>
                        {/* Type buttons — no native select, no overflow issue */}
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          {FMT_TYPES.map(f=>(
                            <button key={f.id} onClick={()=>setF(f.id)}
                              style={{padding:'5px 10px',borderRadius:6,border:'1px solid '+(fmt.type===f.id?T.blue:T.border),
                                background:fmt.type===f.id?T.blue:'transparent',color:fmt.type===f.id?'#fff':T.sub,
                                fontSize:11,fontWeight:fmt.type===f.id?700:400,cursor:'pointer',whiteSpace:'nowrap'}}>
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Sub-options */}
                      {fmt.type==='currency'&&<div style={{display:'flex',gap:10,flexWrap:'wrap',paddingLeft:4}}>
                        <div><label style={LBL}>Symbol</label><input value={fmt.symbol||'$'} onChange={e=>setFProp('symbol',e.target.value)} style={{...INP,width:60}}/></div>
                        <div><label style={LBL}>Decimals</label><input type="number" min="0" max="4" value={fmt.decimals??2} onChange={e=>setFProp('decimals',parseInt(e.target.value))} style={{...INP,width:70}}/></div>
                      </div>}
                      {fmt.type==='number'&&<div style={{paddingLeft:4}}><label style={LBL}>Decimal places</label><input type="number" min="0" max="6" value={fmt.decimals??0} onChange={e=>setFProp('decimals',parseInt(e.target.value))} style={{...INP,width:70}}/></div>}
                      {fmt.type==='percent'&&<div style={{paddingLeft:4}}><label style={LBL}>Decimal places</label><input type="number" min="0" max="4" value={fmt.decimals??1} onChange={e=>setFProp('decimals',parseInt(e.target.value))} style={{...INP,width:70}}/></div>}
                      {fmt.type==='duration'&&<div style={{display:'flex',gap:10,flexWrap:'wrap',paddingLeft:4}}>
                        <div><label style={LBL}>Unit</label><input value={fmt.unit||'d'} onChange={e=>setFProp('unit',e.target.value)} placeholder="d, h…" style={{...INP,width:60}}/></div>
                        <div><label style={LBL}>Positive color</label><input type="color" value={fmt.colorPositive||'#DC2626'} onChange={e=>setFProp('colorPositive',e.target.value)} style={{width:40,height:34,padding:2,border:'1px solid '+T.border,borderRadius:7,cursor:'pointer',background:'none'}}/></div>
                        <div><label style={LBL}>Negative color</label><input type="color" value={fmt.colorNegative||'#059669'} onChange={e=>setFProp('colorNegative',e.target.value)} style={{width:40,height:34,padding:2,border:'1px solid '+T.border,borderRadius:7,cursor:'pointer',background:'none'}}/></div>
                      </div>}
                      {fmt.type==='badge'&&<div style={{fontSize:11,color:T.blue,background:T.blueBg,padding:'7px 12px',borderRadius:7,paddingLeft:4}}>Set badge colors in the 🎨 Color Rules tab.</div>}
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {/* ── COLOR RULES ── */}
          {tab==='colors'&&(
            <div>
              <p style={{fontSize:12,color:T.sub,marginBottom:16,lineHeight:1.65}}>Assign badge color + shape per field value. Works for any column including Tableau calculated fields.</p>
              <div style={{marginBottom:14}}>
                <label style={LBL}>Field (from datasource or calculated field)</label>
                <select value={selF} onChange={e=>setSelF(e.target.value)} style={{...SEL,width:'100%'}}>{selColsOnly.map(c=><option key={c.field} value={c.field}>{c.label}</option>)}</select>
              </div>
              <div style={{marginBottom:14}}>
                <label style={LBL}>Palette</label>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <select value={pal} onChange={e=>setPal(e.target.value)} style={{...SEL,flex:1}}>
                    <optgroup label="Built-in">{PAL_NAMES.map(p=><option key={p}>{p}</option>)}</optgroup>
                    {Object.keys(cp).length>0&&<optgroup label="Custom">{Object.keys(cp).map(p=><option key={p}>{p}</option>)}</optgroup>}
                  </select>
                  <button onClick={autoAssign} style={{padding:'9px 16px',borderRadius:8,border:'none',background:T.blue,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>Auto-assign</button>
                  {cr[selF]&&<button onClick={clearField} style={{padding:'9px 12px',borderRadius:8,border:'1px solid #FCA5A5',background:'#FFF5F5',color:T.red,fontSize:13,fontWeight:600,cursor:'pointer'}}>Clear</button>}
                </div>
              </div>
              <div style={{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap',padding:10,background:T.bg,borderRadius:8}}>
                {(allPals[pal]||[]).map((c,i)=><div key={i} title={c} style={{width:22,height:22,borderRadius:4,background:c,border:'1px solid rgba(0,0,0,.08)',cursor:'default',transition:'transform .1s'}} onMouseEnter={e=>e.target.style.transform='scale(1.3)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}/>)}
              </div>
              {/* Column-level shape selector */}
              <div style={{marginBottom:14}}>
                <label style={LBL}>Badge Shape (applies to all values in this column)</label>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <select value={G2ID[cr[selF]?._shape||'']||'none'} onChange={e=>{const g=SHAPES.find(s=>s.id===e.target.value)?.g||'';setColShape(g);}} style={{...SEL,flex:1}}>
                    {SHAPES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <input
                    value={cr[selF]?._shape&&!SHAPES.find(s=>s.g===cr[selF]._shape)?cr[selF]._shape:''}
                    onChange={e=>{if(e.target.value)setColShape(e.target.value);else setColShape('');}}
                    placeholder="or type emoji…"
                    maxLength={4}
                    style={{...INP,width:110,textAlign:'center',fontSize:16}}
                    title="Type any emoji or symbol as custom shape"/>
                </div>
                {cr[selF]?._shape&&<div style={{marginTop:6,fontSize:11,color:T.sub}}>Current shape: <span style={{fontSize:15}}>{cr[selF]._shape}</span> — applies to all badges in this column</div>}
              </div>
              {uniqueVals.length===0
                ?<div style={{textAlign:'center',padding:'32px 0',color:T.dim,fontSize:13}}>No values for this field.</div>
                :(
                  <div style={{border:'1px solid '+T.border,borderRadius:10,overflow:'hidden'}}>
                    <div style={{padding:'10px 16px',background:T.bg,fontSize:11,fontWeight:700,color:T.sub,textTransform:'uppercase',letterSpacing:'0.5px',borderBottom:'1px solid '+T.border,display:'grid',gridTemplateColumns:'1fr 100px 40px',gap:8}}>
                      <span>Value</span><span>Preview</span><span>Color</span>
                    </div>
                    {uniqueVals.map((val,i)=>{
                      const rule=cr[selF]?.[val];const bg=rule?.bg||null;
                      const colShape=cr[selF]?._shape||'';
                      return(
                        <div key={val} style={{padding:'10px 16px',display:'grid',gridTemplateColumns:'1fr 100px 40px',gap:8,alignItems:'center',borderTop:i>0?'1px solid '+T.border+'60':'none',background:i%2===0?T.white:'#FAFAFA'}}>
                          <span style={{fontSize:13,color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{val}</span>
                          <span>{bg?<span style={{display:'inline-flex',alignItems:'center',gap:3,padding:'3px 9px',borderRadius:12,background:bg,color:isLight(bg)?'#1F2937':'#fff',fontSize:11,fontWeight:600,whiteSpace:'nowrap',maxWidth:95,overflow:'hidden'}}>{colShape&&<span style={{fontSize:9}}>{colShape}</span>}{val}</span>:<span style={{fontSize:11,color:T.dim,fontStyle:'italic'}}>none</span>}</span>
                          <input type="color" value={bg||'#888888'} onChange={e=>setVColor(val,e.target.value)} style={{width:34,height:30,padding:2,border:'1px solid '+T.border,borderRadius:6,cursor:'pointer',background:'none'}}/>
                        </div>
                      );
                    })}
                  </div>
                )}
              {Object.keys(cr).length>0&&<div style={{marginTop:16}}><div style={{fontSize:11,fontWeight:700,color:T.sub,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>Active Rules</div><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{Object.keys(cr).map(f=><span key={f} style={{padding:'5px 12px',borderRadius:20,background:T.blueBg,color:T.blue,fontSize:12,fontWeight:500,display:'inline-flex',gap:5,alignItems:'center'}}>{allCols.find(c=>c.field===f)?.label||f}<span style={{background:T.blue,color:'#fff',borderRadius:10,fontSize:10,padding:'0 5px',fontWeight:700}}>{Object.keys(cr[f]).length}</span></span>)}</div></div>}
            </div>
          )}

          {/* ── CONDITIONAL RULES ── */}
          {tab==='rules'&&(
            <div>
              <p style={{fontSize:12,color:T.sub,marginBottom:16,lineHeight:1.65}}>
                Apply cell or row styling based on conditions — e.g. "if Delay &gt; 5, highlight red". Rules are evaluated in order; first match wins.
              </p>
              <button onClick={addCond} style={{padding:'9px 18px',borderRadius:8,border:'none',background:T.blue,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:16}}>+ Add Rule</button>
              {cond.length===0&&<div style={{textAlign:'center',padding:'32px 0',color:T.dim,fontSize:13,border:'1px dashed '+T.border,borderRadius:10}}>No rules yet. Click "+ Add Rule" above.</div>}
              {cond.map((rule,ri)=>(
                <div key={rule.id} style={{border:'1px solid '+T.border,borderRadius:10,marginBottom:12,overflow:'hidden'}}>
                  <div style={{padding:'10px 14px',background:T.bg,display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid '+T.border}}>
                    <span style={{fontSize:12,fontWeight:600,color:T.text}}>Rule {ri+1}</span>
                    <button onClick={()=>delCond(rule.id)} style={{background:'none',border:'none',cursor:'pointer',color:T.red,fontSize:13,lineHeight:1}}>× Remove</button>
                  </div>
                  <div style={{padding:14,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <div><label style={LBL}>When field</label>
                      <select value={rule.field} onChange={e=>updCond(rule.id,'field',e.target.value)} style={SEL}>{selColsOnly.map(c=><option key={c.field} value={c.field}>{c.label}</option>)}</select>
                    </div>
                    <div><label style={LBL}>Operator</label>
                      <select value={rule.op} onChange={e=>updCond(rule.id,'op',e.target.value)} style={SEL}>{OPERATORS.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}</select>
                    </div>
                    {!['is_empty','is_not_empty'].includes(rule.op)&&(
                      <div style={{gridColumn:'1/-1'}}><label style={LBL}>Value</label>
                        <input value={rule.value||''} onChange={e=>updCond(rule.id,'value',e.target.value)} placeholder="Enter value…" style={INP}/>
                      </div>
                    )}
                    <div><label style={LBL}>Apply to</label>
                      <select value={rule.scope||'cell'} onChange={e=>updCond(rule.id,'scope',e.target.value)} style={SEL}>
                        <option value="cell">Specific cell</option><option value="row">Entire row</option>
                      </select>
                    </div>
                    {rule.scope==='cell'&&(
                      <div><label style={LBL}>Target column</label>
                        <select value={rule.targetField||selColsOnly[0]?.field||''} onChange={e=>updCond(rule.id,'targetField',e.target.value)} style={SEL}>{selColsOnly.map(c=><option key={c.field} value={c.field}>{c.label}</option>)}</select>
                      </div>
                    )}
                    <div style={{gridColumn:'1/-1',borderTop:'1px solid '+T.border,paddingTop:10,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                      <div><label style={LBL}>Background</label>
                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                          <input type="color" value={rule.style?.bg||'#FEF3C7'} onChange={e=>updCondStyle(rule.id,'bg',e.target.value)} style={{width:38,height:32,padding:2,border:'1px solid '+T.border,borderRadius:6,cursor:'pointer',background:'none'}}/>
                          <span style={{fontSize:10,fontFamily:'monospace',color:T.sub}}>{rule.style?.bg||'#FEF3C7'}</span>
                        </div>
                      </div>
                      <div><label style={LBL}>Text Color</label>
                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                          <input type="color" value={rule.style?.fg||'#92400E'} onChange={e=>updCondStyle(rule.id,'fg',e.target.value)} style={{width:38,height:32,padding:2,border:'1px solid '+T.border,borderRadius:6,cursor:'pointer',background:'none'}}/>
                          <span style={{fontSize:10,fontFamily:'monospace',color:T.sub}}>{rule.style?.fg||''}</span>
                        </div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
                        <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                          <input type="checkbox" checked={!!rule.style?.bold} onChange={e=>updCondStyle(rule.id,'bold',e.target.checked)} style={{cursor:'pointer'}}/>
                          <span style={{fontSize:12,color:T.text}}>Bold text</span>
                        </label>
                      </div>
                      {rule.scope==='cell'&&(
                        <div style={{gridColumn:'1/-1'}}>
                          <label style={LBL}>Shape (column only — not available for row rules)</label>
                          <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <select value={G2ID[rule.style?.shape||'']||'none'} onChange={e=>updCondStyle(rule.id,'shape',SHAPES.find(s=>s.id===e.target.value)?.g||'')} style={{...SEL,flex:1}}>
                              {SHAPES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                            <input
                              value={rule.style?.shape&&!SHAPES.find(s=>s.g===rule.style.shape)?rule.style.shape:''}
                              onChange={e=>updCondStyle(rule.id,'shape',e.target.value||'')}
                              placeholder="or type emoji…"
                              maxLength={4}
                              style={{...INP,width:110,textAlign:'center',fontSize:16}}/>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Preview */}
                    <div style={{gridColumn:'1/-1'}}>
                      <div style={{fontSize:11,color:T.sub,marginBottom:4}}>Preview:</div>
                      <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 12px',borderRadius:8,fontSize:13,
                        background:rule.style?.bg||'#FEF3C7',color:rule.style?.fg||'#92400E',
                        fontWeight:rule.style?.bold?700:400}}>
                        {rule.scope==='cell'&&rule.style?.shape&&<span style={{fontSize:10}}>{rule.style.shape}</span>}
                        Sample Value
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PALETTES ── */}
          {tab==='palettes'&&(
            <div>
              <div style={{background:T.blueBg,border:'1px solid '+T.blueMid,borderRadius:10,padding:'14px 16px',marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:600,color:T.blue,marginBottom:8}}>📂 Import from Preferences.tps</div>
                <p style={{fontSize:12,color:T.sub,marginBottom:10,lineHeight:1.6}}>File: <code style={{fontSize:11,background:'#DBEAFE',padding:'1px 4px',borderRadius:3}}>~/Documents/My Tableau Repository/Preferences.tps</code></p>
                <TpsImporter onImport={imported=>setCp(p=>({...p,...imported}))}/>
              </div>
              <CPEditor cp={cp} onChange={setCp}/>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:'16px 24px',borderTop:'1px solid '+T.border,flexShrink:0,display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{padding:'10px 20px',borderRadius:8,border:'1px solid '+T.border,background:T.white,fontSize:13,fontWeight:500,cursor:'pointer',color:T.text}}>Cancel</button>
          <button onClick={()=>onSave({tableName:tname,tableDesc:tdesc,gs,selectedColumns:selCols,columnFormats:fmts,colorRules:cr,condRules:cond,customPalettes:cp})}
            style={{padding:'10px 24px',borderRadius:8,border:'none',background:T.blue,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>Save & Apply</button>
        </div>
      </div>
    </div>
  );
}

// ── COLUMN PICKER ────────────────────────────────────────────────────────────
function ColPicker({allCols,onDone,onBack,fontFamily,initialPicked}){
  const[picked,setPicked]=useState(()=>initialPicked||[]);
  const[search,setSearch]=useState('');
  const sel=field=>picked.find(p=>p.field===field);
  const add=col=>{if(!sel(col.field))setPicked(p=>[...p,{field:col.field,displayLabel:'',headerStyle:{}}]);};
  const remove=field=>setPicked(p=>p.filter(c=>c.field!==field));
  const moveUp=i=>{if(i===0)return;setPicked(p=>{const a=[...p];[a[i-1],a[i]]=[a[i],a[i-1]];return a;});};
  const moveDown=i=>{setPicked(p=>{if(i>=p.length-1)return p;const a=[...p];[a[i],a[i+1]]=[a[i+1],a[i]];return a;});};
  const avail=allCols.filter(c=>!sel(c.field)).filter(c=>!search||c.label.toLowerCase().includes(search.toLowerCase())||c.field.toLowerCase().includes(search.toLowerCase()));
  return(
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:T.bg,fontFamily,overflow:'hidden'}}>
      <div style={{padding:'16px 20px 12px',borderBottom:'1px solid '+T.border,background:T.white,flexShrink:0,display:'flex',alignItems:'center',gap:12}}>
        {onBack&&<button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',color:T.sub,fontSize:13,padding:'4px 0',flexShrink:0}}>← Back</button>}
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,color:T.text}}>Select Columns</div>
          <div style={{fontSize:11,color:T.sub,marginTop:2}}>Click a field to add it to your table. Reorder with ↑↓.</div>
        </div>
        <button onClick={()=>onDone(picked)} disabled={picked.length===0}
          style={{padding:'9px 22px',borderRadius:9,border:'none',background:picked.length?T.blue:'#D1D5DB',color:'#fff',fontSize:13,fontWeight:600,cursor:picked.length?'pointer':'not-allowed',flexShrink:0}}>
          Done ({picked.length})
        </button>
      </div>
      <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 1fr',overflow:'hidden',minHeight:0}}>
        {/* Left: available fields */}
        <div style={{borderRight:'1px solid '+T.border,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'10px 14px',borderBottom:'1px solid '+T.border,flexShrink:0}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search fields…"
              style={{width:'100%',padding:'7px 10px',border:'1px solid '+T.border,borderRadius:7,fontSize:12,outline:'none',boxSizing:'border-box'}}/>
          </div>
          <div style={{padding:'6px 10px',fontSize:10,fontWeight:700,color:T.sub,textTransform:'uppercase',letterSpacing:'0.5px',borderBottom:'1px solid '+T.border+'50',flexShrink:0}}>
            Datasource Fields ({allCols.filter(c=>!sel(c.field)).length})
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {avail.length===0
              ?<div style={{padding:'24px 14px',textAlign:'center',color:T.dim,fontSize:13}}>
                {search?'No match':'All fields added'}
               </div>
              :avail.map(col=>(
                <div key={col.field} onClick={()=>add(col)}
                  style={{padding:'9px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,fontSize:12,color:T.text,borderBottom:'1px solid '+T.border+'25'}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.blueBg}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{color:T.blue,fontWeight:700,fontSize:14,lineHeight:1,flexShrink:0}}>+</span>
                  <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{col.label}</span>
                  <span style={{fontSize:10,color:T.dim,fontFamily:'monospace',maxWidth:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flexShrink:0}}>{col.field}</span>
                </div>
              ))}
          </div>
        </div>
        {/* Right: selected columns */}
        <div style={{display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'6px 14px 6px',fontSize:10,fontWeight:700,color:T.sub,textTransform:'uppercase',letterSpacing:'0.5px',borderBottom:'1px solid '+T.border+'50',paddingTop:13,flexShrink:0}}>
            Table Columns ({picked.length})
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {picked.length===0
              ?<div style={{padding:'28px 14px',textAlign:'center',color:T.dim,fontSize:13,lineHeight:1.7}}>
                ← Add fields from the left<br/>to build your table
               </div>
              :picked.map((sc,i)=>{
                const col=allCols.find(c=>c.field===sc.field);
                return(
                  <div key={sc.field} style={{padding:'9px 12px',display:'flex',alignItems:'center',gap:8,fontSize:12,color:T.text,borderBottom:'1px solid '+T.border+'25',background:T.white}}>
                    <div style={{display:'flex',flexDirection:'column',gap:1,flexShrink:0}}>
                      <button onClick={()=>moveUp(i)} style={{background:'none',border:'none',cursor:i===0?'not-allowed':'pointer',color:i===0?T.dim:T.sub,fontSize:9,lineHeight:1,padding:0}}>▲</button>
                      <button onClick={()=>moveDown(i)} style={{background:'none',border:'none',cursor:i===picked.length-1?'not-allowed':'pointer',color:i===picked.length-1?T.dim:T.sub,fontSize:9,lineHeight:1,padding:0}}>▼</button>
                    </div>
                    <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{col?.label||sc.field}</span>
                    <button onClick={()=>remove(sc.field)} style={{background:'none',border:'none',cursor:'pointer',color:T.dim,fontSize:14,lineHeight:1,padding:'0 2px',flexShrink:0}}>×</button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
function Core(){
  const[allRows,setAllRows]   = useState([]);
  const[allCols,setAllCols]   = useState([]);
  const[search,setSearch]     = useState('');
  const[sortCol,setSortCol]   = useState(null);
  const[sortDir,setSortDir]   = useState('asc');
  const[selected,setSelected] = useState(new Set());
  const[loading,setLoading]   = useState(true);
  const[error,setError]       = useState(null);
  const[showSets,setShowSets] = useState(false);
  const[cfg,setCfg]           = useState(()=>loadCfg());
  const[screen,setScreen]     = useState('loading'); // loading|notTableau|noDs|error|pickDs|pickCols|table
  const[availDs,setAvailDs]   = useState([]);
  const[selDsId,setSelDsId]   = useState('');
  const[noDsInfo,setNoDsInfo] = useState(null);
  const parentRef             = useRef(null);
  const dsRefs                = useRef(new Map()); // id -> raw ds object for worksheet fallback
  const initialised           = useRef(false);

  // ── helpers ──────────────────────────────────────────────────────────────
  function withTO(p,ms=8000){return Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('Timeout')),ms))]);}

  // Probe a worksheet for ALL available columns using every method available
  async function probeWsCols(ws){
    // Best: getUnderlyingDataAsync returns ALL datasource cols, not just view cols
    try{
      const dt=await withTO(ws.getUnderlyingDataAsync({maxRows:1,includeAllColumns:true}),6000);
      if(dt?.columns?.length>0)
        return dt.columns.map(c=>({field:c.fieldName||c.id||'',label:autoLabel(c.fieldName||c.id||''),dataType:'string'}));
    }catch{}
    // Fallback: getSummaryDataAsync (only view cols — limited but reliable)
    try{
      const dt=await withTO(ws.getSummaryDataAsync({maxRows:1,ignoreAliases:false,ignoreSelection:true}),5000);
      if(dt?.columns?.length>0)
        return dt.columns.map(c=>({field:c.fieldName||c.id||'',label:autoLabel(c.fieldName||c.id||''),dataType:'string'}));
    }catch{}
    return[];
  }

  async function fetchAllDsInfo(){
    const svc=window.tableau?.extensions?.datasourceService;
    let hasSvc=false;let svcErr='';

    // Attempt 1 — datasourceService (API 1.7+)
    if(svc){
      hasSvc=true;
      try{
        const all=await withTO(svc.getAllDatasourcesAsync());
        if(all?.length)
          return{list:all.map(d=>({id:d.id,name:d.name,tables:(d.logicalTables||[]).map(t=>({id:t.id,caption:t.caption||t.id})),_raw:d})),hasSvc,via:'service'};
        svcErr='service returned empty';
      }catch(e){svcErr=e.message||String(e);}
    }

    const dash=window.tableau.extensions.dashboardContent.dashboard;
    const wsCount=dash.worksheets.length;
    const seen=new Map();

    for(const ws of dash.worksheets){
      const wsKey='ws:'+ws.name;

      // Attempt 2a — getDatasourcesAsync (proper datasource name + metadata)
      try{
        const dsList=await withTO(ws.getDatasourcesAsync());
        for(const ds of dsList){
          if(!seen.has(ds.id)){
            let tables=[];
            try{tables=await withTO(ds.getUnderlyingTablesAsync());}catch{}
            // Try ds.fields for proper Tableau field names
            let allCols=[];
            try{allCols=(ds.fields||[]).filter(f=>!f.isHidden).map(f=>({field:f.name,label:f.name,dataType:f.dataType||'string'}));}catch{}
            // If ds.fields empty, probe the worksheet for all cols
            if(!allCols.length)allCols=await probeWsCols(ws);
            seen.set(ds.id,{id:ds.id,name:ds.name,tables:tables.map(t=>({id:t.id,caption:t.caption||t.id})),_raw:ds,_ws:ws,_allCols:allCols});
          }
        }
        if([...seen.values()].some(d=>d._ws===ws))continue; // got datasource, skip direct ws probe
      }catch{}

      // Attempt 2b — probe worksheet directly (getUnderlyingDataAsync → getSummaryDataAsync)
      if(!seen.has(wsKey)){
        const allCols=await probeWsCols(ws);
        if(allCols.length)
          seen.set(wsKey,{id:wsKey,name:ws.name,tables:[{id:wsKey,caption:ws.name}],_wsName:ws.name,_ws:ws,_allCols:allCols});
      }
    }

    return{list:[...seen.values()],hasSvc,svcErr,wsCount,via:'worksheet'};
  }

  async function fetchTableData(dsInfo,tblId){
    const dash=window.tableau.extensions.dashboardContent.dashboard;

    // Via datasourceService
    const svc=window.tableau?.extensions?.datasourceService;
    if(svc){
      try{
        const all=await withTO(svc.getAllDatasourcesAsync());
        const ds=all.find(d=>d.id===dsInfo.id)||all[0];
        const tbl=(tblId&&ds.logicalTables?.find(t=>t.id===tblId))||ds.logicalTables?.[0];
        if(tbl)return await withTO(ds.getLogicalTableDataAsync(tbl.id,{maxRows:0,ignoreAliases:false}),30000);
      }catch{}
    }
    // Via datasource object (getUnderlyingTableDataAsync)
    const rawDs=dsInfo._raw||dsRefs.current.get(dsInfo.id);
    if(rawDs){
      try{
        let tables=dsInfo.tables||[];
        if(!tables.length)tables=await withTO(rawDs.getUnderlyingTablesAsync());
        const tbl=(tblId&&tables.find(t=>t.id===tblId))||tables[0];
        if(tbl?.id)return await withTO(rawDs.getUnderlyingTableDataAsync(tbl.id,{maxRows:0,includeAllColumns:true}),30000);
      }catch{}
    }
    // Via worksheet getUnderlyingDataAsync (ALL cols, deprecated but wide support)
    const ws=dsInfo._ws||dash.worksheets.find(w=>w.name===dsInfo._wsName||w.name===dsInfo.name);
    if(ws){
      try{return await withTO(ws.getUnderlyingDataAsync({maxRows:0,includeAllColumns:true}),30000);}catch{}
      // Last resort: summary data (view cols only)
      try{return await withTO(ws.getSummaryDataAsync({maxRows:0,ignoreAliases:false,ignoreSelection:true}),20000);}catch{}
    }
    throw new Error('Could not load data from datasource. Check Full Data permission.');
  }

  const doLoad=useCallback(async(dsInfo,tblId)=>{
    setLoading(true);setError(null);
    try{
      // Show pre-probed columns immediately so ColPicker is ready
      if(dsInfo._allCols?.length)setAllCols(dsInfo._allCols);
      const dt=await fetchTableData(dsInfo,tblId);
      // Use actual data columns (consistent with row data keys)
      const cols=dt.columns.map(c=>({field:c.fieldName||c.id||'',label:autoLabel(c.fieldName||c.id||''),dataType:'string'}));
      const rows=dt.data.map((r,i)=>{const o={_id:i};dt.columns.forEach((c,ci)=>{const k=c.fieldName||c.id||'';o[k]=r[ci]?.formattedValue??'';});return o;});
      setAllCols(cols);setAllRows(rows);
    }catch(e){setError(e.message);setScreen('error');}
    finally{setLoading(false);}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  async function runInit(){
    setScreen('loading');setLoading(true);setError(null);
    let inFrame=false;
    try{inFrame=window.self!==window.top;}catch{inFrame=true;}
    if(!inFrame){setScreen('notTableau');setLoading(false);return;}
    try{
      if(!initialised.current){
        await window.tableau.extensions.initializeAsync();
        initialised.current=true;
      }
      const env=window.tableau.extensions.environment||{};
      const result=await fetchAllDsInfo();
      if(!result.list.length){
        setNoDsInfo({
          hasSvc:result.hasSvc,
          svcErr:result.svcErr||'',
          wsCount:result.wsCount??0,
          tableauVersion:env.tableauVersion||env.apiVersion||'unknown',
        });
        setScreen('noDs');setLoading(false);return;
      }
      result.list.forEach(d=>{
        if(d._raw)dsRefs.current.set(d.id,d._raw);
        if(d._ws)dsRefs.current.set(d.id+'_ws',d._ws); // store ws ref too
      });
      // mapped: strip internal refs before storing in state
      const mapped=result.list.map(({id,name,tables,_allCols,_wsName})=>({id,name,tables,_allCols,_wsName}));
      setAvailDs(mapped);
      const sc=loadCfg();
      const savedDs=result.list.find(d=>d.id===sc.dataSourceId);
      if(savedDs){
        await doLoad(savedDs,sc.logicalTableId);
        setScreen(sc.selectedColumns?.length?'table':'pickCols');
      }else if(result.list.length===1){
        const u={...sc,dataSourceId:result.list[0].id,logicalTableId:result.list[0].tables?.[0]?.id||''};
        saveCfg(u);setCfg(u);
        await doLoad(result.list[0],u.logicalTableId);
        setScreen('pickCols');
      }else{
        setScreen('pickDs');setLoading(false);
      }
    }catch(e){setError(e.message);setScreen('error');setLoading(false);}
  }

  useEffect(()=>{runInit();},[]);// eslint-disable-line react-hooks/exhaustive-deps

  async function pickDs(ds){
    const tblId=ds.tables?.[0]?.id||'';
    const u={...cfg,dataSourceId:ds.id,logicalTableId:tblId};
    saveCfg(u);setCfg(u);setSelDsId(ds.id);
    const dsInfo={...ds,_raw:dsRefs.current.get(ds.id),_ws:dsRefs.current.get(ds.id+'_ws')};
    await doLoad(dsInfo,tblId);
    setScreen('pickCols');
  }
  async function reconnectDs(){
    // Re-scan worksheets for datasources and go to pickDs/pickCols
    setScreen('loading');setLoading(true);
    try{
      const result=await fetchAllDsInfo();
      result.list.forEach(d=>{
        if(d._raw)dsRefs.current.set(d.id,d._raw);
        if(d._ws)dsRefs.current.set(d.id+'_ws',d._ws);
      });
      const mapped=result.list.map(({id,name,tables,_allCols,_wsName})=>({id,name,tables,_allCols,_wsName}));
      setAvailDs(mapped);
      if(mapped.length===0){setScreen('noDs');setLoading(false);}
      else if(mapped.length===1){await pickDs(result.list[0]);}
      else{setScreen('pickDs');setLoading(false);}
    }catch(e){setError(e.message);setScreen('error');setLoading(false);}
  }
  function finishCols(picked){
    const u={...cfg,selectedColumns:picked};saveCfg(u);setCfg(u);setScreen('table');
  }

  const gs=cfg.gs||{};
  const selCols=cfg.selectedColumns||[];
  const colorRules=cfg.colorRules||{};
  const columnFormats=cfg.columnFormats||{};
  const condRules=cfg.condRules||[];
  const fontFamily=gs.fontFamily||'Arial,Helvetica,sans-serif';
  const headerBg=gs.headerBg||'#FAFBFC';
  const headerColor=gs.headerColor||T.sub;
  const[colFilters,setColFilters]=useState({});
  const[showColFilter,setShowColFilter]=useState(false);
  const[sessionUnlocked,setSessionUnlocked]=useState(false); // unlocked for this session
  const[showLock,setShowLock]=useState(false); // show unlock/lock modal

  // SHA-256 hash for password storage (non-reversible)
  async function hashPass(p){
    if(!p)return'';
    try{
      const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p));
      return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }catch{
      // Fallback simple hash if crypto.subtle unavailable
      let h=0;for(let i=0;i<p.length;i++){h=(h<<5)-h+p.charCodeAt(i);h|=0;}return String(Math.abs(h));
    }
  }
  const isLocked=!!(cfg.lockHash)&&!sessionUnlocked;

  const visDefs=useMemo(()=>selCols.map(sc=>{
    const base=allCols.find(c=>c.field===sc.field);
    if(!base)return null;
    return{...base,label:sc.displayLabel||base.label,headerStyle:sc.headerStyle||{}};
  }).filter(Boolean),[allCols,selCols]);

  const filtered=useMemo(()=>{
    let rows=allRows;
    // Global search — only visible columns, each word must match
    if(search.trim()){
      const terms=search.toLowerCase().split(/\s+/).filter(Boolean);
      const visFields=visDefs.map(c=>c.field);
      rows=rows.filter(r=>{
        const vs=visFields.map(f=>String(r[f]??'').toLowerCase());
        return terms.every(t=>vs.some(v=>v.includes(t)));
      });
    }
    // Per-column filters
    const activeFilters=Object.entries(colFilters).filter(([,v])=>v.trim());
    if(activeFilters.length){
      rows=rows.filter(r=>activeFilters.every(([f,v])=>String(r[f]??'').toLowerCase().includes(v.toLowerCase())));
    }
    if(sortCol){rows=[...rows].sort((a,b)=>{const av=String(a[sortCol]||''),bv=String(b[sortCol]||'');const na=parseFloat(av.replace(/[^0-9.-]/g,'')),nb=parseFloat(bv.replace(/[^0-9.-]/g,''));const c=!isNaN(na)&&!isNaN(nb)?na-nb:av.localeCompare(bv);return sortDir==='asc'?c:-c;});}
    return rows;
  },[allRows,search,sortCol,sortDir,visDefs,colFilters]);

  const virtualizer=useVirtualizer({count:filtered.length,getScrollElement:()=>parentRef.current,estimateSize:()=>gs.rowHeight||50,overscan:20});
  const toggleRow=id=>setSelected(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll=()=>selected.size===filtered.length?setSelected(new Set()):setSelected(new Set(filtered.map(r=>r._id)));
  const handleSort=f=>{if(sortCol===f)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortCol(f);setSortDir('asc');}};
  function saveSets(u2){const u={...cfg,...u2};saveCfg(u);setCfg(u);setShowSets(false);if(u2.dataSourceId&&u2.dataSourceId!==cfg.dataSourceId)doLoad(u2.dataSourceId,u2.logicalTableId);}
  function handleExport(){doExport(visDefs,selected.size>0?filtered.filter(r=>selected.has(r._id)):filtered);}
  const gridCols=`40px ${visDefs.map(()=>'minmax(80px,1fr)').join(' ')} 70px`;

  // ── LOADING ─────────────────────────────────────────────────────────────
  if(loading)return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:T.bg,fontFamily}}>
      <div style={{textAlign:'center',color:T.sub}}><div style={{fontSize:24,marginBottom:8}}>⟳</div><div style={{fontSize:13}}>Connecting to datasource…</div></div>
    </div>
  );

  // ── NOT IN TABLEAU ───────────────────────────────────────────────────────
  if(screen==='notTableau')return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:T.bg,fontFamily,padding:32}}>
      <div style={{textAlign:'center',maxWidth:360}}>
        <div style={{width:60,height:60,borderRadius:15,background:'linear-gradient(135deg,#3B5BDB,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px',boxShadow:'0 4px 12px #2563EB30'}}><span style={{color:'#fff',fontSize:26}}>≡</span></div>
        <div style={{fontSize:19,fontWeight:700,color:T.text,marginBottom:8}}>Table Extension</div>
        <div style={{fontSize:13,color:T.sub,lineHeight:1.7,marginBottom:18}}>Add to a Tableau Dashboard via the Objects panel → Extension.</div>
        <div style={{background:T.white,border:'1px solid '+T.border,borderRadius:10,padding:'12px 16px',textAlign:'left',fontSize:12,color:T.sub}}>
          <ol style={{paddingLeft:16,lineHeight:2.2,margin:0}}><li>Open a <strong>Dashboard</strong> tab</li><li>Objects → drag <strong>Extension</strong> onto canvas</li><li><strong>Access Local Extensions</strong> → <code style={{background:T.bg,padding:'1px 4px',borderRadius:3}}>table_extension.trex</code></li><li>Click Allow</li></ol>
        </div>
      </div>
    </div>
  );

  // ── NO DATASOURCE FOUND ──────────────────────────────────────────────────
  if(screen==='noDs'){
    const{hasSvc,svcErr,wsCount=0,tableauVersion}=noDsInfo||{};
    return(
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:T.bg,fontFamily,padding:24}}>
        <div style={{width:'100%',maxWidth:480}}>
          <div style={{textAlign:'center',marginBottom:20}}>
            <div style={{fontSize:38,marginBottom:10}}>🔌</div>
            <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:6}}>No Datasource Detected</div>
            <div style={{fontSize:12,color:T.sub,lineHeight:1.7}}>
              The extension found <strong>{wsCount} sheet{wsCount!==1?'s':''}</strong> on this dashboard but couldn't read datasource data from {wsCount===0?'any':'them'}.
            </div>
          </div>

          <div style={{background:T.white,border:'1px solid '+T.border,borderRadius:12,padding:'16px 20px',marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>Steps to fix:</div>
            <ol style={{paddingLeft:16,margin:0,fontSize:12,color:T.sub,lineHeight:2.4}}>
              <li>In Tableau, open a <strong>Sheet tab</strong> at the bottom</li>
              <li>Drag <strong>any field</strong> from the data pane onto the view</li>
              <li>Return to the <strong>Dashboard tab</strong></li>
              <li>From the <em>Sheets</em> panel (left sidebar), drag that sheet onto the dashboard canvas — it can be very small or hidden behind the extension</li>
              <li>Click <strong>Refresh</strong> below</li>
            </ol>
          </div>

          {wsCount>0&&(
            <div style={{background:'#FFF7ED',border:'1px solid #FED7AA',borderRadius:10,padding:'12px 16px',marginBottom:12,fontSize:11,color:'#92400E',lineHeight:1.7}}>
              <strong>{wsCount} sheet{wsCount!==1?'s':''} found</strong> but reading datasource failed.
              This usually means Tableau denied the <em>Full Data</em> permission. Try <strong>removing and re-adding</strong> the extension — click Allow when the permission dialog appears.
              {svcErr&&<div style={{marginTop:6,fontFamily:'monospace',fontSize:10,opacity:.8}}>({svcErr})</div>}
            </div>
          )}

          {!hasSvc&&tableauVersion&&(
            <div style={{fontSize:11,color:T.dim,textAlign:'center',marginBottom:12}}>
              Tableau {tableauVersion} · datasourceService not available in loaded API library
            </div>
          )}

          <button onClick={runInit}
            style={{width:'100%',padding:'13px',borderRadius:10,border:'none',background:T.blue,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 8px #2563EB40'}}>
            ↻ Refresh — Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── ERROR ────────────────────────────────────────────────────────────────
  if(screen==='error')return(
    <div style={{padding:28,background:T.bg,minHeight:'100vh',fontFamily}}>
      <div style={{background:'#FEF2F2',border:'1px solid #FCA5A5',borderRadius:10,padding:'16px 20px',fontSize:13,color:T.red,lineHeight:1.7}}>
        <strong>Error:</strong> {error}
      </div>
      <button onClick={runInit} style={{marginTop:14,padding:'10px 22px',borderRadius:9,border:'none',background:T.blue,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>↻ Retry</button>
    </div>
  );

  // ── CONNECT / PICK DATASOURCE ─────────────────────────────────────────────
  if(screen==='pickDs')return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:T.bg,fontFamily,padding:24}}>
      <div style={{width:'100%',maxWidth:440}}>
        <div style={{textAlign:'center',marginBottom:22}}>
          <div style={{width:56,height:56,borderRadius:14,background:'linear-gradient(135deg,#3B5BDB,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',boxShadow:'0 4px 12px #2563EB30'}}><span style={{color:'#fff',fontSize:22}}>≡</span></div>
          <div style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:5}}>Connect Datasource</div>
          <div style={{fontSize:12,color:T.sub,lineHeight:1.6}}>Select a datasource — all its columns will be available to add to your table.</div>
        </div>
        {availDs.length===0
          ?<div style={{textAlign:'center',padding:'24px',background:'#FFF7ED',border:'1px solid #FED7AA',borderRadius:12,fontSize:12,color:'#92400E',lineHeight:1.8}}>
              No datasources detected on this dashboard.<br/>
              <strong>Add a sheet with data to the dashboard</strong>, then click Refresh.
              <button onClick={reconnectDs} style={{display:'block',margin:'14px auto 0',padding:'9px 20px',borderRadius:8,border:'none',background:T.blue,color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>↻ Refresh</button>
           </div>
          :availDs.map(ds=>{
            const colCount=ds._allCols?.length||0;
            return(
              <div key={ds.id} onClick={()=>pickDs(ds)}
                style={{padding:'16px 18px',marginBottom:10,background:T.white,border:'2px solid '+T.border,borderRadius:12,cursor:'pointer',display:'flex',alignItems:'center',gap:12,transition:'all .12s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.blue;e.currentTarget.style.background=T.blueBg;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.white;}}>
                <div style={{width:36,height:36,borderRadius:9,background:T.blueBg,border:'1px solid '+T.blueMid,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:16}}>🗃</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ds.name}</div>
                  <div style={{fontSize:11,color:T.sub,marginTop:2}}>{colCount?`${colCount} columns available`:'Click to load columns'}</div>
                </div>
                <span style={{color:T.blue,fontSize:13,flexShrink:0}}>Connect →</span>
              </div>
            );
          })}
        {availDs.length>0&&<button onClick={reconnectDs} style={{width:'100%',marginTop:8,padding:'10px',borderRadius:10,border:'1px solid '+T.border,background:T.white,color:T.sub,fontSize:12,cursor:'pointer'}}>↻ Refresh datasources</button>}
      </div>
    </div>
  );

  // ── PICK COLUMNS ─────────────────────────────────────────────────────────
  if(screen==='pickCols')return(
    <ColPicker allCols={allCols} fontFamily={fontFamily}
      initialPicked={selCols}
      onBack={availDs.length>1?()=>setScreen('pickDs'):undefined}
      onDone={finishCols}/>
  );

  // ── TABLE ────────────────────────────────────────────────────────────────
  const tableName=cfg.tableName||cfg.dataSourceId||'Table';
  const tableDesc=cfg.tableDesc||'';

  // ── LOCK MODAL (inline, renders inside the table view) ───────────────────
  function LockModal(){
    const[pass,setPass]=useState('');
    const[err,setErr]=useState('');
    const[busy,setBusy]=useState(false);
    const[newPass,setNewPass]=useState('');
    const[confirm,setConfirm]=useState('');
    const[mode,setMode]=useState(cfg.lockHash?'unlock':'setpass'); // 'unlock'|'setpass'|'changepass'|'remove'

    async function handleUnlock(){
      setBusy(true);setErr('');
      const h=await hashPass(pass);
      if(h===cfg.lockHash){setSessionUnlocked(true);setShowLock(false);}
      else{setErr('Incorrect password.');}
      setBusy(false);
    }
    async function handleSetPass(){
      if(!newPass){setErr('Enter a password.');return;}
      if(newPass!==confirm){setErr('Passwords do not match.');return;}
      setBusy(true);
      const h=await hashPass(newPass);
      const u={...cfg,lockHash:h};saveCfg(u);setCfg(u);
      setSessionUnlocked(true);setShowLock(false);setBusy(false);
    }
    async function handleChangePass(){
      const oldH=await hashPass(pass);
      if(oldH!==cfg.lockHash){setErr('Current password incorrect.');return;}
      if(!newPass){setErr('Enter new password.');return;}
      if(newPass!==confirm){setErr('New passwords do not match.');return;}
      setBusy(true);
      const h=await hashPass(newPass);
      const u={...cfg,lockHash:h};saveCfg(u);setCfg(u);
      setSessionUnlocked(true);setShowLock(false);setBusy(false);
    }
    async function handleRemove(){
      const h=await hashPass(pass);
      if(h!==cfg.lockHash){setErr('Incorrect password.');return;}
      const u={...cfg,lockHash:''};saveCfg(u);setCfg(u);
      setSessionUnlocked(false);setShowLock(false);
    }

    const onKey=e=>{if(e.key==='Enter'){if(mode==='unlock')handleUnlock();else if(mode==='setpass')handleSetPass();else if(mode==='changepass')handleChangePass();else handleRemove();}};

    return(
      <div style={{position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.45)'}}>
        <div style={{background:T.white,borderRadius:16,padding:'32px 28px',width:360,boxShadow:'0 8px 40px rgba(0,0,0,.25)',fontFamily}}>
          <div style={{textAlign:'center',marginBottom:22}}>
            <div style={{fontSize:32,marginBottom:8}}>{mode==='unlock'?'🔒':'🛡'}</div>
            <div style={{fontSize:16,fontWeight:700,color:T.text}}>
              {mode==='unlock'?'Enter Password':mode==='setpass'?'Set Lock Password':mode==='changepass'?'Change Password':'Remove Lock'}
            </div>
            <div style={{fontSize:12,color:T.sub,marginTop:5,lineHeight:1.6}}>
              {mode==='unlock'?'Enter the password to access settings.':mode==='setpass'?'Set a password to protect table configuration.':mode==='changepass'?'Enter current then new password.':'Enter password to remove the lock.'}
            </div>
          </div>

          {(mode==='unlock'||mode==='changepass'||mode==='remove')&&(
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:600,color:T.sub,display:'block',marginBottom:5}}>
                {mode==='changepass'?'Current Password':'Password'}
              </label>
              <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr('');}} onKeyDown={onKey} autoFocus
                placeholder="Enter password…"
                style={{width:'100%',padding:'10px 14px',border:'1px solid '+(err?T.red:T.border),borderRadius:9,fontSize:13,outline:'none',color:T.text,boxSizing:'border-box'}}/>
            </div>
          )}
          {(mode==='setpass'||mode==='changepass')&&(<>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:600,color:T.sub,display:'block',marginBottom:5}}>{mode==='changepass'?'New Password':'Password'}</label>
              <input type="password" value={newPass} onChange={e=>{setNewPass(e.target.value);setErr('');}} onKeyDown={onKey}
                autoFocus={mode==='setpass'} placeholder="Choose a password…"
                style={{width:'100%',padding:'10px 14px',border:'1px solid '+T.border,borderRadius:9,fontSize:13,outline:'none',color:T.text,boxSizing:'border-box'}}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:600,color:T.sub,display:'block',marginBottom:5}}>Confirm Password</label>
              <input type="password" value={confirm} onChange={e=>{setConfirm(e.target.value);setErr('');}} onKeyDown={onKey}
                placeholder="Repeat password…"
                style={{width:'100%',padding:'10px 14px',border:'1px solid '+T.border,borderRadius:9,fontSize:13,outline:'none',color:T.text,boxSizing:'border-box'}}/>
            </div>
          </>)}

          {err&&<div style={{fontSize:12,color:T.red,marginBottom:12,textAlign:'center'}}>{err}</div>}

          <button onClick={mode==='unlock'?handleUnlock:mode==='setpass'?handleSetPass:mode==='changepass'?handleChangePass:handleRemove}
            disabled={busy}
            style={{width:'100%',padding:'12px',borderRadius:10,border:'none',background:T.blue,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:10,opacity:busy?.7:1}}>
            {mode==='unlock'?'Unlock':'Save'}
          </button>

          {/* Contextual links */}
          <div style={{display:'flex',justifyContent:'center',gap:16,fontSize:12,color:T.blue,cursor:'pointer'}}>
            {mode==='unlock'&&cfg.lockHash&&<span onClick={()=>{setMode('changepass');setErr('');}}>Change password</span>}
            {mode==='unlock'&&cfg.lockHash&&<span onClick={()=>{setMode('remove');setErr('');}}>Remove lock</span>}
            {(mode==='changepass'||mode==='remove')&&<span onClick={()=>{setMode('unlock');setErr('');setPass('');setNewPass('');setConfirm('');}}>← Back</span>}
          </div>
          <button onClick={()=>setShowLock(false)} style={{display:'block',margin:'14px auto 0',background:'none',border:'none',fontSize:12,color:T.dim,cursor:'pointer'}}>Cancel</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{background:T.bg,height:'100vh',display:'flex',flexDirection:'column',fontFamily,overflow:'hidden'}}>
      {/* Header */}
      <div style={{padding:'12px 18px 10px',background:T.bg,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
          <div style={{width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#3B5BDB,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px #2563EB30',flexShrink:0}}><span style={{color:'#fff',fontSize:15}}>≡</span></div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:16,fontWeight:700,color:T.text,lineHeight:1.2}}>{tableName}</div>
            {tableDesc?<div style={{fontSize:11,color:T.sub,marginTop:2}}>{tableDesc}</div>:<div style={{fontSize:11,color:T.dim,marginTop:2}}>{allRows.length.toLocaleString()} rows · {visDefs.length} col{visDefs.length!==1?'s':''}</div>}
          </div>
          <div style={{display:'flex',gap:6,flexShrink:0,alignItems:'center'}}>
            {isLocked?(
              // Locked — show only the lock icon
              <button onClick={()=>setShowLock(true)} title="Configuration is locked — click to unlock"
                style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:7,border:'1px solid #FCA5A5',background:'#FFF5F5',cursor:'pointer',fontSize:12,fontWeight:600,color:'#DC2626',boxShadow:T.shadow}}>
                🔒 Locked
              </button>
            ):(
              // Unlocked — show all edit buttons
              <>
                <button onClick={reconnectDs} title="Connect / change datasource"
                  style={{display:'flex',alignItems:'center',gap:5,padding:'7px 11px',borderRadius:7,border:'1px solid '+T.border,background:T.white,cursor:'pointer',fontSize:11,fontWeight:600,color:T.sub,boxShadow:T.shadow}}>🗃 Datasource</button>
                <button onClick={()=>setScreen('pickCols')} title="Add / remove columns"
                  style={{padding:'7px 11px',borderRadius:7,border:'1px solid '+T.border,background:T.white,cursor:'pointer',fontSize:11,fontWeight:600,color:T.sub,boxShadow:T.shadow}}>+ Columns</button>
                <button onClick={()=>setShowSets(true)} title="Settings"
                  style={{width:34,height:34,borderRadius:7,border:'1px solid '+T.border,background:T.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:T.sub,boxShadow:T.shadow}}>⚙</button>
                {cfg.lockHash&&sessionUnlocked&&(
                  <button onClick={()=>setSessionUnlocked(false)} title="Lock configuration now"
                    style={{width:34,height:34,borderRadius:7,border:'1px solid '+T.border,background:T.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,boxShadow:T.shadow}}>🔓</button>
                )}
                {!cfg.lockHash&&(
                  <button onClick={()=>setShowLock(true)} title="Set lock password"
                    style={{width:34,height:34,borderRadius:7,border:'1px solid '+T.border,background:T.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:T.dim,boxShadow:T.shadow}}>🔒</button>
                )}
              </>
            )}
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <div style={{flex:1,position:'relative'}}>
            <svg style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',width:12,height:12,color:T.dim,pointerEvents:'none'}} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6"/><path d="M14 14l4 4"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search visible columns… (space = AND)"
              style={{width:'100%',padding:'8px 10px 8px 30px',border:'1px solid '+(search?T.blue:T.border),borderRadius:8,fontSize:12,outline:'none',background:T.white,color:T.text,boxShadow:T.shadow}}/>
            {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:14,color:T.dim,lineHeight:1}}>×</button>}
          </div>
          {/* Column filter toggle */}
          <button onClick={()=>{setShowColFilter(p=>!p);if(showColFilter)setColFilters({});}}
            title="Column filters"
            style={{padding:'8px 12px',borderRadius:8,border:'1px solid '+(showColFilter||Object.values(colFilters).some(v=>v.trim())?T.blue:T.border),
              background:showColFilter||Object.values(colFilters).some(v=>v.trim())?T.blueBg:T.white,
              color:showColFilter||Object.values(colFilters).some(v=>v.trim())?T.blue:T.sub,
              fontSize:11,fontWeight:600,cursor:'pointer',boxShadow:T.shadow,flexShrink:0,whiteSpace:'nowrap'}}>
            ⊟ Filter{Object.values(colFilters).filter(v=>v.trim()).length>0?' ('+Object.values(colFilters).filter(v=>v.trim()).length+')':''}
          </button>
          <button onClick={handleExport} style={{display:'flex',alignItems:'center',gap:5,padding:'8px 14px',borderRadius:8,border:'1px solid '+T.border,background:T.white,color:T.text,fontSize:12,fontWeight:500,cursor:'pointer',boxShadow:T.shadow,flexShrink:0}}>
            ↓ {selected.size>0?`Export (${selected.size})`:'Export'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{margin:'0 18px 14px',flex:1,background:T.white,borderRadius:10,border:'1px solid '+T.border,boxShadow:T.shadow,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
        <div style={{display:'grid',gridTemplateColumns:gridCols,borderBottom:'2px solid '+T.border,background:headerBg,flexShrink:0}}>
          <div style={{padding:'10px 12px',display:'flex',alignItems:'center'}}>
            <input type="checkbox" checked={filtered.length>0&&selected.size===filtered.length} ref={el=>{if(el)el.indeterminate=selected.size>0&&selected.size<filtered.length;}} onChange={toggleAll} style={{cursor:'pointer',width:13,height:13}}/>
          </div>
          {visDefs.map(col=>{
            const hs=col.headerStyle||{};
            const hFontSize=Math.max(11,hs.fontSize||(gs.fontSize?Math.max(11,gs.fontSize-1):11));
            return(
              <div key={col.field} onClick={()=>handleSort(col.field)}
                style={{padding:'10px 8px',fontSize:hFontSize,fontWeight:hs.fontWeight||700,color:hs.color||headerColor,
                  textTransform:'uppercase',letterSpacing:'0.4px',cursor:'pointer',userSelect:'none',
                  display:'flex',alignItems:'center',gap:2,borderLeft:'1px solid '+T.border+'50',
                  background:hs.bg||(sortCol===col.field?T.blueBg:headerBg),whiteSpace:'nowrap',overflow:'hidden'}}>
                <span style={{overflow:'hidden',textOverflow:'ellipsis',flex:1}}>{col.label}</span>
                <span style={{fontSize:9,flexShrink:0,color:sortCol===col.field?T.blue:T.dim}}>{sortCol===col.field?(sortDir==='asc'?'↑':'↓'):'⇅'}</span>
              </div>
            );
          })}
          <div style={{borderLeft:'1px solid '+T.border+'50'}}/>
        </div>

        {/* ── Column filter row ── */}
        {showColFilter&&(
          <div style={{display:'grid',gridTemplateColumns:gridCols,borderBottom:'1px solid '+T.border,background:'#F0F4FF',flexShrink:0}}>
            <div/>
            {visDefs.map(col=>(
              <div key={col.field} style={{padding:'4px 6px',borderLeft:'1px solid '+T.border+'40'}}>
                <input
                  value={colFilters[col.field]||''}
                  onChange={e=>setColFilters(p=>({...p,[col.field]:e.target.value}))}
                  placeholder={'Filter '+col.label+'…'}
                  style={{width:'100%',padding:'4px 7px',border:'1px solid '+(colFilters[col.field]?T.blue:T.border+'80'),
                    borderRadius:5,fontSize:11,outline:'none',background:colFilters[col.field]?'#EFF6FF':'#fff',
                    color:T.text,fontFamily}}/>
              </div>
            ))}
            <div style={{padding:'4px 6px',borderLeft:'1px solid '+T.border+'40',display:'flex',alignItems:'center'}}>
              <button onClick={()=>setColFilters({})} title="Clear all column filters"
                style={{fontSize:10,padding:'3px 7px',border:'1px solid '+T.border,borderRadius:5,background:T.white,cursor:'pointer',color:T.sub,whiteSpace:'nowrap'}}>
                Clear
              </button>
            </div>
          </div>
        )}

        <div ref={parentRef} style={{flex:1,overflowY:'auto',overflowX:'auto',minHeight:0}}>
          {filtered.length===0
            ?<div style={{padding:'50px 0',textAlign:'center',color:T.sub,fontSize:13}}>{search||Object.values(colFilters).some(v=>v.trim())?'No rows match the current filters.':'No rows.'}</div>
            :(
              <div style={{height:virtualizer.getTotalSize(),position:'relative'}}>
                {virtualizer.getVirtualItems().map(vRow=>{
                  const row=filtered[vRow.index];const isSel=selected.has(row._id);const isEven=vRow.index%2===0;
                  const rowRule=condRules.find(r=>r.scope==='row'&&evalRule(r,row));
                  const rowBg=rowRule?.style?.bg||(isSel?'#EFF6FF':isEven?T.white:(gs.stripeColor||'#FAFAFA'));
                  return(
                    <div key={vRow.key} data-index={vRow.index} ref={virtualizer.measureElement}
                      style={{position:'absolute',top:0,left:0,right:0,transform:`translateY(${vRow.start}px)`,
                        display:'grid',gridTemplateColumns:gridCols,borderBottom:'1px solid '+T.border+'30',
                        background:rowBg,color:rowRule?.style?.fg||gs.cellColor||T.text,
                        fontWeight:rowRule?.style?.bold?700:undefined}}
                      onMouseEnter={e=>{if(!isSel&&!rowRule)e.currentTarget.style.background=gs.hoverColor||'#F5F8FF';}}
                      onMouseLeave={e=>{if(!isSel&&!rowRule)e.currentTarget.style.background=rowBg;}}>
                      <div style={{padding:'0 12px',display:'flex',alignItems:'center',minHeight:gs.rowHeight||46,flexShrink:0}}>
                        <input type="checkbox" checked={isSel} onChange={()=>toggleRow(row._id)} style={{cursor:'pointer',width:13,height:13}}/>
                      </div>
                      {visDefs.map(col=>(
                        <div key={col.field} style={{padding:'6px 8px',display:'flex',alignItems:'center',minHeight:gs.rowHeight||46,overflow:'hidden',borderLeft:'1px solid '+T.border+'18'}}>
                          <CellValue value={row[col.field]} fieldName={col.field} colorRules={colorRules} columnFormats={columnFormats} condRules={condRules} row={row} gs={gs}/>
                        </div>
                      ))}
                      <div style={{borderLeft:'1px solid '+T.border+'18'}}/>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        <div style={{borderTop:'1px solid '+T.border,padding:'7px 14px',flexShrink:0,display:'flex',justifyContent:'space-between',fontSize:11,color:T.sub,background:headerBg}}>
          <span>{filtered.length.toLocaleString()} row{filtered.length!==1?'s':''}{search&&` matching "${search}"`}{selected.size>0&&<span style={{color:T.blue}}> · {selected.size} selected</span>}</span>
          <span style={{color:T.dim}}>{allRows.length.toLocaleString()} total</span>
        </div>
      </div>

      {showSets&&<Settings allCols={allCols} allRows={allRows} cfg={cfg} onSave={saveSets} onClose={()=>setShowSets(false)} availSheets={[]}/>}
      {showLock&&<LockModal/>}
    </div>
  );
}

export default function TableExtension(){return<EB><Core/></EB>;}
