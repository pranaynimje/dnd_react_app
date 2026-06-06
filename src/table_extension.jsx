import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// ── THEME ──────────────────────────────────────────────────────────────────
const T = {
  bg:'#F4F5F7', white:'#FFFFFF', border:'#E5E7EB',
  text:'#111827', sub:'#6B7280', dim:'#9CA3AF',
  blue:'#2563EB', blueBg:'#EFF6FF', blueMid:'#BFDBFE',
  red:'#EF4444',
  shadow:'0 1px 3px rgba(0,0,0,.06)',
  shadowMd:'0 4px 16px rgba(0,0,0,.10)',
};

// ── SHAPES (Tableau-style shape marks) ──────────────────────────────────────
const SHAPES = [
  {id:'circle',    label:'Circle',      glyph:'●'},
  {id:'circle-o',  label:'Circle (o)',  glyph:'○'},
  {id:'square',    label:'Square',      glyph:'■'},
  {id:'square-o',  label:'Square (o)',  glyph:'□'},
  {id:'triangle',  label:'Triangle ▲', glyph:'▲'},
  {id:'tri-down',  label:'Triangle ▼', glyph:'▼'},
  {id:'diamond',   label:'Diamond',     glyph:'◆'},
  {id:'diamond-o', label:'Diamond (o)', glyph:'◇'},
  {id:'star',      label:'Star',        glyph:'★'},
  {id:'star-o',    label:'Star (o)',    glyph:'☆'},
  {id:'check',     label:'Check ✓',    glyph:'✓'},
  {id:'cross',     label:'Cross ✕',    glyph:'✕'},
  {id:'plus',      label:'Plus',        glyph:'+'},
  {id:'arrow-r',   label:'Arrow →',    glyph:'→'},
  {id:'arrow-up',  label:'Arrow ↑',    glyph:'↑'},
  {id:'arrow-dn',  label:'Arrow ↓',    glyph:'↓'},
  {id:'warn',      label:'Warning',     glyph:'⚠'},
  {id:'info',      label:'Info',        glyph:'ℹ'},
  {id:'dot',       label:'Dot •',      glyph:'•'},
  {id:'none',      label:'None',        glyph:''},
];
const SHAPE_BY_ID = Object.fromEntries(SHAPES.map(s=>[s.id,s]));

// ── TABLEAU PALETTES ────────────────────────────────────────────────────────
const PALETTES = {
  'Tableau 10':  ['#4E79A7','#F28E2B','#E15759','#76B7B2','#59A14F','#EDC948','#B07AA1','#FF9DA7','#9C755F','#BAB0AC'],
  'Tableau 20':  ['#4E79A7','#A0CBE8','#F28E2B','#FFBE7D','#59A14F','#8CD17D','#B6992D','#F1CE63','#499894','#86BCB6','#E15759','#FF9D9A','#79706E','#BAB0AC','#D37295','#FABFD2','#B07AA1','#D4A6C8','#9D7660','#D7B5A6'],
  'Color Blind': ['#1170AA','#FC7D0B','#A3ACB9','#57606C','#5FA2CE','#C85200','#7B848F','#A3CCE9','#E08B55','#D0CCC5'],
  'Traffic Light':['#ED1C24','#FF7F00','#FFFF00','#00A14B','#0072BC','#92278F'],
  'Status':      ['#2ECC71','#F39C12','#E74C3C','#3498DB','#9B59B6','#95A5A6'],
  'Blue-Teal':   ['#1A1A6E','#2B4BA3','#3E7AC7','#5DA9E9','#7DC4F5','#A5D8FA','#C3E9FC','#DEF4FE','#08546A','#0E8FA3'],
  'Orange-Gold': ['#7B2D00','#C03B00','#E25C00','#F28B1E','#F5A623','#F7C244','#FAD978','#FDE9A6','#B07A32','#D4A44C'],
  'Purple-Gray': ['#1A0030','#3B0064','#6200A0','#9B2FBE','#C55FDB','#D98EEA','#E8B5F4','#F3D5F9','#6B6B80','#A9A9B8'],
  'Green-Gold':  ['#2D4A1E','#4A7A2E','#6CAF40','#95D15A','#B8E380','#D3F0A6','#1E5C2D','#2D8C44','#3DB85E','#74D494'],
  'Hue Circle':  ['#1F77B4','#FF7F0E','#2CA02C','#D62728','#9467BD','#8C564B','#E377C2','#7F7F7F','#BCBD22','#17BECF'],
};
const PALETTE_NAMES = Object.keys(PALETTES);

// ── STORAGE ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'sl_ext_config_v2';
function loadConfig(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'); }catch{ return {}; } }
function saveConfig(cfg){ localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); }

// ── CUSTOM PALETTE EDITOR ────────────────────────────────────────────────────
function CustomPaletteEditor({customPalettes, onChange}){
  const[palettes,setPalettes]=useState(()=>customPalettes||{});
  const[editName,setEditName]=useState(null); // name of palette being edited
  const[newName,setNewName]=useState('');
  const[newNameErr,setNewNameErr]=useState('');
  const[addingColor,setAddingColor]=useState('#4E79A7');

  function persist(updated){
    setPalettes(updated);
    onChange(updated);
  }

  function createPalette(){
    const n=newName.trim();
    if(!n){ setNewNameErr('Name required'); return; }
    if(PALETTES[n]||palettes[n]){ setNewNameErr('Name already used'); return; }
    const updated={...palettes,[n]:[]};
    persist(updated);
    setEditName(n);
    setNewName('');
    setNewNameErr('');
  }

  function deletePalette(name){
    const updated={...palettes};
    delete updated[name];
    persist(updated);
    if(editName===name) setEditName(null);
  }

  function addColor(name){
    const updated={...palettes,[name]:[...(palettes[name]||[]),addingColor]};
    persist(updated);
  }

  function removeColor(name,idx){
    const updated={...palettes,[name]:palettes[name].filter((_,i)=>i!==idx)};
    persist(updated);
  }

  function updateColor(name,idx,hex){
    const arr=[...palettes[name]];
    arr[idx]=hex;
    persist({...palettes,[name]:arr});
  }

  const names=Object.keys(palettes);

  return(
    <div>
      <p style={{fontSize:12,color:T.sub,marginBottom:18,lineHeight:1.65}}>
        Build your own color palettes. They appear alongside the built-in Tableau palettes in the Color Rules tab.
      </p>

      {/* Create new */}
      <div style={{marginBottom:20}}>
        <label style={{display:'block',fontSize:11,fontWeight:700,color:T.sub,
          textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6}}>New Palette Name</label>
        <div style={{display:'flex',gap:8}}>
          <div style={{flex:1}}>
            <input value={newName} onChange={e=>{setNewName(e.target.value);setNewNameErr('');}}
              onKeyDown={e=>e.key==='Enter'&&createPalette()}
              placeholder="e.g. My Milestones"
              style={{width:'100%',padding:'9px 12px',border:'1px solid '+(newNameErr?T.red:T.border),
                borderRadius:8,fontSize:13,outline:'none',color:T.text,background:T.white}}/>
            {newNameErr&&<div style={{fontSize:11,color:T.red,marginTop:4}}>{newNameErr}</div>}
          </div>
          <button onClick={createPalette}
            style={{padding:'9px 18px',borderRadius:8,border:'none',background:T.blue,
              color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
            + Create
          </button>
        </div>
      </div>

      {/* Palette list */}
      {names.length===0&&(
        <div style={{textAlign:'center',padding:'32px 0',color:T.dim,fontSize:13,
          border:'1px dashed '+T.border,borderRadius:10}}>
          No custom palettes yet. Create one above.
        </div>
      )}

      {names.map(name=>{
        const colors=palettes[name]||[];
        const isOpen=editName===name;
        return(
          <div key={name} style={{border:'1px solid '+T.border,borderRadius:10,
            marginBottom:10,overflow:'hidden'}}>
            {/* Header row */}
            <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:10,
              background:isOpen?T.blueBg:'#FAFAFA',cursor:'pointer',userSelect:'none'}}
              onClick={()=>setEditName(isOpen?null:name)}>
              <span style={{fontSize:13,fontWeight:600,color:T.text,flex:1}}>{name}</span>
              {/* Color preview dots */}
              <div style={{display:'flex',gap:3,flexShrink:0}}>
                {colors.slice(0,10).map((c,i)=>(
                  <div key={i} style={{width:14,height:14,borderRadius:3,background:c,
                    border:'1px solid rgba(0,0,0,.1)',flexShrink:0}}/>
                ))}
                {colors.length===0&&<span style={{fontSize:11,color:T.dim,fontStyle:'italic'}}>empty</span>}
              </div>
              <span style={{fontSize:11,color:T.sub,marginLeft:4,flexShrink:0}}>{colors.length} color{colors.length!==1?'s':''}</span>
              <button onClick={e=>{e.stopPropagation();deletePalette(name);}}
                title="Delete palette"
                style={{background:'#FEF2F2',border:'1px solid #FCA5A5',borderRadius:6,
                  padding:'3px 8px',color:T.red,fontSize:11,cursor:'pointer',flexShrink:0}}>
                Delete
              </button>
              <span style={{color:T.sub,fontSize:12,flexShrink:0}}>{isOpen?'▲':'▼'}</span>
            </div>

            {/* Expanded editor */}
            {isOpen&&(
              <div style={{padding:'16px',borderTop:'1px solid '+T.border}}>
                {/* Existing colors */}
                {colors.length>0&&(
                  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
                    {colors.map((c,i)=>(
                      <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                        <div style={{position:'relative'}}>
                          <input type="color" value={c}
                            onChange={e=>updateColor(name,i,e.target.value)}
                            title={c}
                            style={{width:40,height:40,padding:3,border:'1px solid '+T.border,
                              borderRadius:8,cursor:'pointer',background:'none'}}/>
                        </div>
                        <button onClick={()=>removeColor(name,i)}
                          style={{background:'none',border:'none',cursor:'pointer',
                            color:T.dim,fontSize:11,padding:0,lineHeight:1}}
                          title="Remove">×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add color row */}
                <div style={{display:'flex',gap:8,alignItems:'center',
                  padding:'10px 12px',background:T.bg,borderRadius:8}}>
                  <input type="color" value={addingColor}
                    onChange={e=>setAddingColor(e.target.value)}
                    style={{width:40,height:36,padding:2,border:'1px solid '+T.border,
                      borderRadius:6,cursor:'pointer',background:'none',flexShrink:0}}/>
                  <span style={{fontSize:12,color:T.sub,flex:1,fontFamily:'monospace'}}>{addingColor}</span>
                  <button onClick={()=>addColor(name)}
                    style={{padding:'7px 14px',borderRadius:7,border:'none',background:T.blue,
                      color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
                    + Add Color
                  </button>
                </div>

                {/* Quick-add from built-in palette */}
                <div style={{marginTop:12}}>
                  <div style={{fontSize:11,color:T.sub,marginBottom:6}}>Quick-add from Tableau palette:</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                    {PALETTES['Tableau 10'].map((c,i)=>(
                      <div key={i} title={'Add '+c}
                        onClick={()=>{const upd={...palettes,[name]:[...(palettes[name]||[]),c]};persist(upd);}}
                        style={{width:22,height:22,borderRadius:4,background:c,cursor:'pointer',
                          border:'1px solid rgba(0,0,0,.1)',transition:'transform .1s'}}
                        onMouseEnter={e=>e.target.style.transform='scale(1.3)'}
                        onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── MOCK DATA (dev fallback) ─────────────────────────────────────────────────
const MOCK_COLS = [
  {field:'shipmentId',  label:'SHIPMENT ID'},
  {field:'container',   label:'CONTAINER NO'},
  {field:'origin',      label:'ORIGIN PORT'},
  {field:'destination', label:'DESTINATION'},
  {field:'carrier',     label:'CARRIER'},
  {field:'milestone',   label:'MILESTONE'},
  {field:'eta',         label:'ETA'},
  {field:'riskType',    label:'RISK TYPE'},
  {field:'delayDays',   label:'DELAY (DAYS)'},
  {field:'exposure',    label:'EXPOSURE ($)'},
];
function makeMock(n=400){
  const origins=['Tokyo','Ho Chi Minh','Hong Kong','Chennai','Dubai','Guangzhou','Shanghai','Hamburg','Busan','Colombo'];
  const carriers=['ZIM','MSC','HAPAG-LLOYD','MAERSK','CMA CGM','COSCO','EVERGREEN','ONE','HMM','YANGMING'];
  const milestones=['GATE IN FULL','GATE OUT EMPTY','DELIVERED','DISCHARGED','ARRIVED','LOADED','IN TRANSIT','AT PORT','BOOKING','CUSTOMS'];
  const risks=['Detention','Demurrage','Delay','Storage','','','',''];
  const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const base=new Date('2026-05-28');
  const pfxs=['EGHU','MSCU','APLU','COSU','CMDU','HLCU'];
  return Array.from({length:n},(_,i)=>{
    const risk=risks[rnd(0,risks.length-1)];
    const d=new Date(base); d.setDate(d.getDate()+rnd(0,14));
    return{
      _id:i,
      shipmentId:'SHP-'+String(i+1).padStart(4,'0'),
      container:pfxs[rnd(0,pfxs.length-1)]+rnd(1000000,9999999),
      origin:origins[rnd(0,origins.length-1)],
      destination:'Los Angeles',
      carrier:carriers[rnd(0,carriers.length-1)],
      milestone:milestones[rnd(0,milestones.length-1)],
      eta:d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
      riskType:risk,
      delayDays:risk?rnd(1,14):'',
      exposure:risk?(rnd(500,8000)):'',
    };
  });
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function isLightColor(hex){
  if(!hex||hex.length<7) return true;
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return (r*299+g*587+b*114)/1000>128;
}
function humanLabel(field){
  return field
    .replace(/^(transportUnit\.|surchargeSnapshot\.|pod\.|pol\.|cf\.|gl\.)/,'')
    .replace(/([a-z])([A-Z])/g,'$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g,'$1 $2')
    .replace(/_/g,' ').trim().toUpperCase();
}
function exportCSV(cols,rows){
  const esc=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const csv=[cols.map(c=>esc(c.label)).join(','),...rows.map(r=>cols.map(c=>esc(r[c.field])).join(','))].join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='shipments_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
}

// ── CELL VALUE ───────────────────────────────────────────────────────────────
function CellValue({value, fieldName, colorRules}){
  const v=(value==null||value===''||value==='Null'||value==='null')?null:String(value);
  if(v===null) return <span style={{color:T.dim,fontSize:12}}>—</span>;

  // User-configured color rule
  const rule=colorRules?.[fieldName]?.[v];
  if(rule){
    const bg=rule.bg||rule;
    const fg=rule.fg||(isLightColor(bg)?'#1F2937':'#FFFFFF');
    return(
      <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',
        borderRadius:16,background:bg,color:fg,fontSize:11,fontWeight:600,
        letterSpacing:'0.3px',whiteSpace:'nowrap',lineHeight:1.3}}>
        {rule.icon&&<span style={{fontSize:9}}>{rule.icon}</span>}
        {v}
      </span>
    );
  }

  // Smart numeric formatting
  const n=parseFloat(String(v).replace(/[^0-9.-]/g,''));
  const fl=fieldName.toLowerCase();
  if(!isNaN(n)&&(fl.includes('cost')||fl.includes('exposure')||fl.includes('demurrage')||fl.includes('detention')||fl.includes('$'))){
    return <span style={{fontWeight:600,fontSize:13,color:T.text}}>{n>=1000?'$'+(n/1000).toFixed(1)+'K':'$'+Math.round(n)}</span>;
  }
  if(!isNaN(n)&&n>0&&(fl.includes('day')||fl.includes('delay')||fl.includes('dwell'))){
    return <span style={{color:'#DC2626',fontWeight:700,fontSize:13}}>+{Math.ceil(n)}d</span>;
  }
  if(fl.includes('id')||fl.includes('container')||fl.includes('bol')||fl.includes('bl ')){
    return <span style={{color:T.blue,fontWeight:500,fontSize:13}}>{v}</span>;
  }
  return <span style={{fontSize:13,color:T.text}}>{v}</span>;
}

// ── PREFERENCES.TPS IMPORTER ────────────────────────────────────────────────
function parseTps(xml){
  // Parse <color-palette name="..." type="..."><color>#hex</color>...</color-palette>
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const result = {};
  const palEls = doc.querySelectorAll('color-palette');
  palEls.forEach(pal => {
    const name = pal.getAttribute('name');
    if (!name) return;
    const colors = Array.from(pal.querySelectorAll('color'))
      .map(c => c.textContent.trim())
      .filter(c => /^#[0-9A-Fa-f]{6}$/.test(c));
    if (colors.length > 0) result[name] = colors;
  });
  return result;
}

function TpsImporter({onImport}){
  const[text,setText]=useState('');
  const[status,setStatus]=useState(null); // {ok, msg}

  function handleFile(e){
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>setText(ev.target.result||'');
    reader.readAsText(file);
  }

  function doImport(){
    if(!text.trim()){ setStatus({ok:false,msg:'Paste or upload a Preferences.tps file first.'}); return; }
    try{
      const parsed=parseTps(text);
      const n=Object.keys(parsed).length;
      if(n===0){ setStatus({ok:false,msg:'No <color-palette> elements found. Check the XML.'}); return; }
      onImport(parsed);
      setStatus({ok:true,msg:`Imported ${n} palette${n!==1?'s':''}. They are now available in Color Rules.`});
      setText('');
    }catch(e){ setStatus({ok:false,msg:'Parse error: '+e.message}); }
  }

  return(
    <div>
      {/* File upload */}
      <label style={{display:'inline-flex',alignItems:'center',gap:7,padding:'8px 14px',
        borderRadius:8,border:'1px solid '+T.border,background:T.white,cursor:'pointer',
        fontSize:12,fontWeight:500,color:T.text,marginBottom:8}}>
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 16v1a2 2 0 002 2h8a2 2 0 002-2v-1M8 12l4-4 4 4M12 8v8"/>
        </svg>
        Choose .tps file
        <input type="file" accept=".tps,.xml" onChange={handleFile} style={{display:'none'}}/>
      </label>
      <div style={{fontSize:11,color:T.sub,marginBottom:8}}>— or paste XML below —</div>
      <textarea value={text} onChange={e=>setText(e.target.value)}
        placeholder={'<?xml version=\'1.0\'?>\n<workbook>\n  <preferences>\n    <color-palette name="My Palette" type="regular">\n      <color>#4E79A7</color>\n      ...\n    </color-palette>\n  </preferences>\n</workbook>'}
        rows={5}
        style={{width:'100%',padding:'9px 12px',border:'1px solid '+T.border,borderRadius:8,
          fontSize:11,fontFamily:'monospace',outline:'none',resize:'vertical',
          color:T.text,background:T.white,marginBottom:8,boxSizing:'border-box'}}/>
      <button onClick={doImport}
        style={{padding:'8px 18px',borderRadius:8,border:'none',background:T.blue,
          color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>
        Import Palettes
      </button>
      {status&&(
        <div style={{marginTop:8,fontSize:12,color:status.ok?'#065F46':T.red,
          background:status.ok?'#D1FAE5':'#FEF2F2',padding:'8px 12px',borderRadius:7,
          border:'1px solid '+(status.ok?'#6EE7B7':'#FCA5A5')}}>
          {status.ok?'✓ ':''}{status.msg}
        </div>
      )}
    </div>
  );
}

// ── COLUMN PICKER DROPDOWN ───────────────────────────────────────────────────
function ColPicker({allCols,visible,onToggle,onClose}){
  const ref=useRef(null);
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))onClose();};
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[onClose]);
  return(
    <div ref={ref} style={{position:'absolute',right:0,top:'100%',zIndex:200,marginTop:4,
      background:T.white,border:'1px solid '+T.border,borderRadius:10,boxShadow:T.shadowMd,
      padding:'6px 0',minWidth:210,maxHeight:340,overflowY:'auto'}}>
      <div style={{padding:'8px 14px 6px',fontSize:10,fontWeight:700,color:T.dim,
        textTransform:'uppercase',letterSpacing:'0.5px',borderBottom:'1px solid '+T.border,marginBottom:4}}>
        Toggle Columns
      </div>
      {allCols.map(col=>(
        <label key={col.field} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 14px',
          cursor:'pointer',fontSize:12,color:T.text,userSelect:'none',
          background:visible.includes(col.field)?T.blueBg:T.white}}>
          <input type="checkbox" checked={visible.includes(col.field)} onChange={()=>onToggle(col.field)} style={{cursor:'pointer'}}/>
          {col.label}
        </label>
      ))}
    </div>
  );
}

// ── SETTINGS MODAL ───────────────────────────────────────────────────────────
function SettingsModal({allCols,allRows,config,onSave,onClose}){
  const[tab,setTab]=useState('colors');
  const[colorRules,setColorRules]=useState(()=>config.colorRules||{});
  const[customPalettes,setCustomPalettes]=useState(()=>config.customPalettes||{});
  const[selField,setSelField]=useState(allCols[0]?.field||'');
  const[selPalette,setSelPalette]=useState('Tableau 10');

  // Merged palette list: built-in + custom
  const allPalettes=useMemo(()=>({...PALETTES,...customPalettes}),[customPalettes]);
  const allPaletteNames=useMemo(()=>Object.keys(allPalettes),[allPalettes]);

  const uniqueVals=useMemo(()=>{
    if(!selField) return [];
    const seen=new Set();
    allRows.forEach(r=>{const v=String(r[selField]||'');if(v&&v!=='Null'&&v!=='null')seen.add(v);});
    return Array.from(seen).sort();
  },[selField,allRows]);

  function autoAssign(){
    const pal=allPalettes[selPalette]||PALETTES['Tableau 10'];
    if(!pal.length) return;
    const updated={...(colorRules[selField]||{})};
    uniqueVals.forEach((v,i)=>{updated[v]={bg:pal[i%pal.length],fg:isLightColor(pal[i%pal.length])?'#1F2937':'#FFFFFF'};});
    setColorRules(p=>({...p,[selField]:updated}));
  }

  function setValueColor(value,bg){
    const fg=isLightColor(bg)?'#1F2937':'#FFFFFF';
    setColorRules(p=>({...p,[selField]:{...(p[selField]||{}),[value]:{bg,fg}}}));
  }

  function clearField(){
    setColorRules(p=>{const n={...p};delete n[selField];return n;});
  }

  const TAB_STYLE=(k)=>({
    padding:'9px 18px',border:'none',cursor:'pointer',background:'none',fontSize:13,
    fontWeight:tab===k?700:400,color:tab===k?T.blue:T.sub,
    borderBottom:tab===k?'2px solid '+T.blue:'2px solid transparent',
  });

  return(
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'stretch',justifyContent:'flex-end'}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.35)'}} onClick={onClose}/>
      <div style={{position:'relative',width:500,background:T.white,
        boxShadow:'-4px 0 24px rgba(0,0,0,.12)',display:'flex',flexDirection:'column',overflowY:'hidden'}}>

        {/* Header */}
        <div style={{padding:'20px 24px 0',borderBottom:'1px solid '+T.border,flexShrink:0}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:16,fontWeight:700,color:T.text}}>⚙ Extension Settings</div>
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',
              fontSize:20,color:T.sub,lineHeight:1,padding:'0 4px'}}>×</button>
          </div>
          <div style={{display:'flex',gap:0}}>
            <button style={TAB_STYLE('colors')} onClick={()=>setTab('colors')}>🎨 Color Rules</button>
            <button style={TAB_STYLE('palettes')} onClick={()=>setTab('palettes')}>🖌 Custom Palettes</button>
            <button style={TAB_STYLE('about')} onClick={()=>setTab('about')}>ℹ About</button>
          </div>
        </div>

        {/* Body */}
        <div style={{flex:1,padding:24,overflowY:'auto'}}>
          {tab==='colors'&&(
            <div>
              <p style={{fontSize:12,color:T.sub,marginBottom:18,lineHeight:1.65}}>
                Define badge colors per field value — like Tableau's color palette. Select a field, then auto-assign a palette or pick each color individually.
              </p>

              {/* Field selector */}
              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:T.sub,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6}}>
                  Field
                </label>
                <select value={selField} onChange={e=>setSelField(e.target.value)}
                  style={{width:'100%',padding:'9px 12px',border:'1px solid '+T.border,borderRadius:8,fontSize:13,color:T.text,background:T.white,cursor:'pointer'}}>
                  {allCols.map(c=><option key={c.field} value={c.field}>{c.label}</option>)}
                </select>
              </div>

              {/* Palette selector + buttons */}
              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:T.sub,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6}}>
                  Palette
                </label>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <select value={selPalette} onChange={e=>setSelPalette(e.target.value)}
                    style={{flex:1,padding:'9px 12px',border:'1px solid '+T.border,borderRadius:8,fontSize:13,background:T.white,cursor:'pointer'}}>
                    <optgroup label="Tableau Built-in">
                      {PALETTE_NAMES.map(p=><option key={p}>{p}</option>)}
                    </optgroup>
                    {Object.keys(customPalettes).length>0&&(
                      <optgroup label="Custom">
                        {Object.keys(customPalettes).map(p=>(
                          <option key={p}>{p}{customPalettes[p].length===0?' (empty)':''}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <button onClick={autoAssign}
                    style={{padding:'9px 16px',borderRadius:8,border:'none',background:T.blue,
                      color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
                    Auto-assign
                  </button>
                  {colorRules[selField]&&(
                    <button onClick={clearField}
                      style={{padding:'9px 14px',borderRadius:8,border:'1px solid #FCA5A5',
                        background:'#FFF5F5',color:T.red,fontSize:13,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Palette color preview dots */}
              <div style={{display:'flex',gap:5,marginBottom:20,flexWrap:'wrap',padding:'10px',
                background:T.bg,borderRadius:8}}>
                {(allPalettes[selPalette]||[]).map((c,i)=>(
                  <div key={i} title={c} style={{width:24,height:24,borderRadius:5,background:c,
                    border:'1px solid rgba(0,0,0,.08)',cursor:'default',
                    transition:'transform .1s',flexShrink:0}}
                    onMouseEnter={e=>e.target.style.transform='scale(1.3)'}
                    onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
                ))}
              </div>

              {/* Per-value color + shape rows */}
              {uniqueVals.length===0
                ? <div style={{textAlign:'center',padding:'40px 0',color:T.dim,fontSize:13}}>No values found for this field.</div>
                : (
                  <div style={{border:'1px solid '+T.border,borderRadius:10,overflow:'hidden'}}>
                    <div style={{padding:'10px 16px',background:T.bg,fontSize:11,fontWeight:700,
                      color:T.sub,textTransform:'uppercase',letterSpacing:'0.5px',
                      borderBottom:'1px solid '+T.border,display:'grid',
                      gridTemplateColumns:'1fr 110px 44px 80px',gap:8}}>
                      <span>Value</span><span>Preview</span><span>Color</span><span>Shape</span>
                    </div>
                    {uniqueVals.map((val,i)=>{
                      const rule=colorRules[selField]?.[val];
                      const bg=rule?.bg||rule||null;
                      const icon=rule?.icon||'';
                      return(
                        <div key={val} style={{padding:'10px 16px',display:'grid',
                          gridTemplateColumns:'1fr 110px 44px 80px',gap:8,alignItems:'center',
                          borderTop:i>0?'1px solid '+T.border+'60':'none',
                          background:i%2===0?T.white:'#FAFAFA'}}>
                          <span style={{fontSize:13,color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{val}</span>
                          <span>
                            {bg
                              ? <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',
                                  borderRadius:12,background:bg,color:isLightColor(bg)?'#1F2937':'#fff',
                                  fontSize:11,fontWeight:600,maxWidth:105,overflow:'hidden',
                                  textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                  {icon&&<span style={{fontSize:9}}>{icon}</span>}{val}
                                </span>
                              : <span style={{fontSize:11,color:T.dim,fontStyle:'italic'}}>no rule</span>}
                          </span>
                          <input type="color" value={bg||'#888888'}
                            onChange={e=>setValueColor(val,e.target.value)}
                            style={{width:36,height:32,padding:2,border:'1px solid '+T.border,
                              borderRadius:6,cursor:'pointer',background:'none'}}/>
                          <select
                            value={SHAPES.find(s=>s.glyph===icon)?.id||'none'}
                            onChange={e=>{
                              const glyph=e.target.value==='none'?'':SHAPE_BY_ID[e.target.value]?.glyph||'';
                              const fg=bg?(isLightColor(bg)?'#1F2937':'#FFFFFF'):undefined;
                              setColorRules(p=>({...p,[selField]:{...(p[selField]||{}),[val]:{bg:bg||'#888888',fg,icon:glyph}}}));
                            }}
                            style={{padding:'5px 4px',border:'1px solid '+T.border,borderRadius:6,
                              fontSize:13,background:T.white,cursor:'pointer',width:'100%'}}>
                            {SHAPES.map(s=>(
                              <option key={s.id} value={s.id}>
                                {s.glyph?s.glyph+' ':''}{s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Active rules summary chips */}
              {Object.keys(colorRules).length>0&&(
                <div style={{marginTop:20}}>
                  <div style={{fontSize:11,fontWeight:700,color:T.sub,textTransform:'uppercase',
                    letterSpacing:'0.5px',marginBottom:8}}>Active Rules</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {Object.keys(colorRules).map(f=>(
                      <span key={f} style={{padding:'5px 12px',borderRadius:20,background:T.blueBg,
                        color:T.blue,fontSize:12,fontWeight:500,display:'inline-flex',gap:5,alignItems:'center'}}>
                        {allCols.find(c=>c.field===f)?.label||f}
                        <span style={{background:T.blue,color:'#fff',borderRadius:10,fontSize:10,
                          padding:'0 5px',fontWeight:700}}>
                          {Object.keys(colorRules[f]).length}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab==='palettes'&&(
            <div>
              {/* Import from Preferences.tps */}
              <div style={{background:T.blueBg,border:'1px solid '+T.blueMid,borderRadius:10,
                padding:'14px 16px',marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:600,color:T.blue,marginBottom:6}}>
                  📂 Import from Preferences.tps
                </div>
                <p style={{fontSize:12,color:T.sub,marginBottom:10,lineHeight:1.6}}>
                  Paste your <strong>Preferences.tps</strong> XML below (found at <code style={{fontSize:11,background:'#DBEAFE',padding:'1px 4px',borderRadius:3}}>~/Documents/My Tableau Repository/Preferences.tps</code>) to import all custom palettes at once.
                </p>
                <TpsImporter onImport={imported=>{
                  const merged={...customPalettes,...imported};
                  setCustomPalettes(merged);
                }}/>
              </div>
              <CustomPaletteEditor customPalettes={customPalettes} onChange={setCustomPalettes}/>
            </div>
          )}

          {tab==='about'&&(
            <div style={{fontSize:13,color:T.sub,lineHeight:1.7}}>
              <p style={{marginBottom:12}}><strong style={{color:T.text}}>Shipment List Extension</strong> reads live data from your Tableau worksheet datasource via the Extensions API.</p>
              <p style={{marginBottom:12}}>Color rules are saved locally in your browser (localStorage) and persist across sessions.</p>
              <ul style={{paddingLeft:18,color:T.sub}}>
                <li style={{marginBottom:6}}>Click column headers to sort</li>
                <li style={{marginBottom:6}}>Use <strong style={{color:T.text}}>⚙</strong> to configure badge colors per field value</li>
                <li style={{marginBottom:6}}>Use <strong style={{color:T.text}}>+Col</strong> to toggle column visibility</li>
                <li style={{marginBottom:6}}>Checkbox rows then Export to download a filtered CSV</li>
                <li style={{marginBottom:6}}>Search box filters across all visible columns</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:'16px 24px',borderTop:'1px solid '+T.border,flexShrink:0,
          display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{padding:'10px 20px',borderRadius:8,border:'1px solid '+T.border,
            background:T.white,fontSize:13,fontWeight:500,cursor:'pointer',color:T.text}}>
            Cancel
          </button>
          <button onClick={()=>onSave({colorRules,customPalettes})}
            style={{padding:'10px 24px',borderRadius:8,border:'none',background:T.blue,
              color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN EXTENSION ───────────────────────────────────────────────────────────
export default function TableExtension(){
  const[allRows,setAllRows]           = useState([]);
  const[allCols,setAllCols]           = useState([]);
  const[visibleCols,setVisibleCols]   = useState([]);
  const[search,setSearch]             = useState('');
  const[sortCol,setSortCol]           = useState(null);
  const[sortDir,setSortDir]           = useState('asc');
  const[selected,setSelected]         = useState(new Set());
  const[loading,setLoading]           = useState(true);
  const[error,setError]               = useState(null);
  const[showColPicker,setShowColPicker]=useState(false);
  const[showSettings,setShowSettings] = useState(false);
  const[config,setConfig]             = useState(()=>loadConfig());
  const[wsName,setWsName]             = useState('');
  const parentRef                     = useRef(null);

  // ── Load data from Tableau datasource ─────────────────────────────────
  const loadData=useCallback(async()=>{
    setLoading(true); setError(null);
    try{
      if(window.tableau?.extensions){
        const dash=window.tableau.extensions.dashboardContent.dashboard;
        const sheets=dash.worksheets;
        if(!sheets.length) throw new Error('No worksheets found in this dashboard.');
        const ws=sheets[0];
        setWsName(ws.name);

        // Attempt to get datasource field metadata (field names + types)
        let dsFields={};
        try{
          const dsList=await ws.getDataSourcesAsync();
          if(dsList.length) dsList[0].fields.forEach(f=>{dsFields[f.name]={dataType:f.dataType};});
        }catch{}

        // Fetch all summary rows (maxRows: 0 = no limit)
        const dt=await ws.getSummaryDataAsync({maxRows:0,ignoreAliases:false,ignoreSelection:true});
        const cols=dt.columns.map(c=>({
          field:c.fieldName,
          label:humanLabel(c.fieldName),
          dataType:(dsFields[c.fieldName]?.dataType||'').toLowerCase()||'string',
        }));
        const rows=dt.data.map((row,i)=>{
          const obj={_id:i};
          dt.columns.forEach((c,ci)=>{obj[c.fieldName]=row[ci].formattedValue;});
          return obj;
        });
        setAllCols(cols);
        const saved=loadConfig();
        setVisibleCols(saved.visibleCols||cols.slice(0,10).map(c=>c.field));
        setAllRows(rows);
      }else{
        setAllCols(MOCK_COLS);
        const saved=loadConfig();
        setVisibleCols(saved.visibleCols||MOCK_COLS.map(c=>c.field));
        setAllRows(makeMock(500));
        setWsName('Demo (no Tableau)');
      }
    }catch(e){ setError(e.message); }
    finally{ setLoading(false); }
  },[]);

  useEffect(()=>{
    async function init(){
      if(window.tableau?.extensions){
        await window.tableau.extensions.initializeAsync();
        const ws=window.tableau.extensions.dashboardContent.dashboard.worksheets;
        if(ws.length){
          ws[0].addEventListener(
            window.tableau.TableauEventType.SummaryDataChanged,
            ()=>loadData()
          );
        }
      }
      loadData();
    }
    init();
  },[loadData]);

  // ── Filter + sort ──────────────────────────────────────────────────────
  const filtered=useMemo(()=>{
    let rows=allRows;
    if(search.trim()){
      const q=search.toLowerCase();
      rows=rows.filter(r=>Object.values(r).some(v=>String(v).toLowerCase().includes(q)));
    }
    if(sortCol){
      rows=[...rows].sort((a,b)=>{
        const av=String(a[sortCol]||''),bv=String(b[sortCol]||'');
        const na=parseFloat(av.replace(/[^0-9.-]/g,'')),nb=parseFloat(bv.replace(/[^0-9.-]/g,''));
        const cmp=!isNaN(na)&&!isNaN(nb)?na-nb:av.localeCompare(bv);
        return sortDir==='asc'?cmp:-cmp;
      });
    }
    return rows;
  },[allRows,search,sortCol,sortDir]);

  // ── Virtualizer ────────────────────────────────────────────────────────
  const virtualizer=useVirtualizer({
    count:filtered.length,
    getScrollElement:()=>parentRef.current,
    estimateSize:()=>50,
    overscan:20,
  });

  // ── Selection helpers ──────────────────────────────────────────────────
  const toggleRow=id=>setSelected(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll=()=>selected.size===filtered.length?setSelected(new Set()):setSelected(new Set(filtered.map(r=>r._id)));
  const handleSort=field=>{if(sortCol===field)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortCol(field);setSortDir('asc');}};

  const toggleCol=field=>{
    const next=visibleCols.includes(field)?visibleCols.filter(f=>f!==field):[...visibleCols,field];
    setVisibleCols(next);
    const saved={...loadConfig(),visibleCols:next};
    saveConfig(saved); setConfig(saved);
  };

  function handleSaveSettings({colorRules,customPalettes}){
    const next={...config,colorRules,customPalettes,visibleCols};
    saveConfig(next); setConfig(next); setShowSettings(false);
  }

  function handleExport(){
    const rows=selected.size>0?filtered.filter(r=>selected.has(r._id)):filtered;
    exportCSV(visDefs,rows);
  }

  const visDefs=useMemo(()=>allCols.filter(c=>visibleCols.includes(c.field)),[allCols,visibleCols]);
  const colorRules=config.colorRules||{};
  const gridCols=`40px ${visDefs.map(()=>'minmax(90px,1fr)').join(' ')} 70px`;

  if(loading) return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:T.bg}}>
      <div style={{textAlign:'center',color:T.sub}}>
        <div style={{fontSize:28,marginBottom:10}}>⟳</div>
        <div style={{fontSize:13}}>Loading from datasource…</div>
      </div>
    </div>
  );

  if(error) return(
    <div style={{padding:32,background:T.bg,minHeight:'100vh'}}>
      <div style={{background:'#FEF2F2',border:'1px solid #FCA5A5',borderRadius:10,
        padding:'16px 20px',fontSize:13,color:T.red}}>⚠ {error}</div>
    </div>
  );

  return(
    <div style={{background:T.bg,height:'100vh',display:'flex',flexDirection:'column',
      fontFamily:"'Inter','Segoe UI',sans-serif",overflow:'hidden'}}>

      {/* ── HEADER ── */}
      <div style={{padding:'16px 20px 12px',background:T.bg,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
          <div style={{width:42,height:42,borderRadius:11,
            background:'linear-gradient(135deg,#3B5BDB,#2563EB)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 2px 8px #2563EB30',flexShrink:0}}>
            <span style={{color:'#fff',fontSize:17}}>≡</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:18,fontWeight:700,color:T.text}}>Shipment List</div>
            <div style={{fontSize:11,color:T.sub,marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {wsName&&<span style={{marginRight:8,padding:'1px 7px',background:T.blueBg,color:T.blue,
                borderRadius:10,fontSize:10,fontWeight:500}}>{wsName}</span>}
              {allRows.length.toLocaleString()} rows loaded from datasource
            </div>
          </div>
          <button onClick={()=>setShowSettings(true)} title="Configure colors & settings"
            style={{width:36,height:36,borderRadius:8,border:'1px solid '+T.border,background:T.white,
              cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:15,color:T.sub,flexShrink:0,boxShadow:T.shadow,transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=T.bg;e.currentTarget.style.color=T.blue;}}
            onMouseLeave={e=>{e.currentTarget.style.background=T.white;e.currentTarget.style.color=T.sub;}}>
            ⚙
          </button>
        </div>

        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{flex:1,position:'relative'}}>
            <svg style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',
              width:13,height:13,color:T.dim,pointerEvents:'none'}}
              viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="8" r="6"/><path d="M14 14l4 4"/>
            </svg>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search all columns…"
              style={{width:'100%',padding:'9px 12px 9px 34px',border:'1px solid '+T.border,
                borderRadius:9,fontSize:13,outline:'none',background:T.white,
                color:T.text,boxShadow:T.shadow}}
              onFocus={e=>e.target.style.borderColor=T.blue}
              onBlur={e=>e.target.style.borderColor=T.border}/>
          </div>
          <button onClick={handleExport}
            style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:9,
              border:'1px solid '+T.border,background:T.white,color:T.text,fontSize:13,
              fontWeight:500,cursor:'pointer',boxShadow:T.shadow,whiteSpace:'nowrap',flexShrink:0}}>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 16h14M10 3v10m-4-4l4 4 4-4"/>
            </svg>
            {selected.size>0?`Export (${selected.size})`:'Export'}
          </button>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div style={{margin:'0 20px 16px',flex:1,background:T.white,borderRadius:12,
        border:'1px solid '+T.border,boxShadow:T.shadow,display:'flex',
        flexDirection:'column',overflow:'hidden',minHeight:0}}>

        {/* Column header row */}
        <div style={{display:'grid',gridTemplateColumns:gridCols,
          borderBottom:'2px solid '+T.border,background:'#FAFBFC',flexShrink:0}}>
          <div style={{padding:'11px 14px',display:'flex',alignItems:'center'}}>
            <input type="checkbox"
              checked={filtered.length>0&&selected.size===filtered.length}
              ref={el=>{if(el)el.indeterminate=selected.size>0&&selected.size<filtered.length;}}
              onChange={toggleAll} style={{cursor:'pointer',width:14,height:14}}/>
          </div>
          {visDefs.map(col=>(
            <div key={col.field} onClick={()=>handleSort(col.field)}
              style={{padding:'11px 10px',fontSize:11,fontWeight:700,color:T.sub,
                textTransform:'uppercase',letterSpacing:'0.5px',cursor:'pointer',
                userSelect:'none',display:'flex',alignItems:'center',gap:2,
                borderLeft:'1px solid '+T.border+'50',
                background:sortCol===col.field?T.blueBg:'#FAFBFC',
                whiteSpace:'nowrap',overflow:'hidden'}}>
              <span style={{overflow:'hidden',textOverflow:'ellipsis',flex:1}}>{col.label}</span>
              {sortCol===col.field
                ? <span style={{color:T.blue,fontSize:9,flexShrink:0}}>{sortDir==='asc'?'↑':'↓'}</span>
                : <span style={{color:T.dim,fontSize:9,flexShrink:0}}>⇅</span>}
            </div>
          ))}
          <div style={{padding:'8px 6px',display:'flex',alignItems:'center',
            justifyContent:'center',borderLeft:'1px solid '+T.border+'50',position:'relative',flexShrink:0}}>
            <button onClick={()=>setShowColPicker(p=>!p)}
              style={{background:T.blueBg,border:'1px solid '+T.blueMid,borderRadius:6,
                padding:'3px 8px',color:T.blue,fontSize:11,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
              +Col
            </button>
            {showColPicker&&<ColPicker allCols={allCols} visible={visibleCols}
              onToggle={toggleCol} onClose={()=>setShowColPicker(false)}/>}
          </div>
        </div>

        {/* Virtual scroll body */}
        <div ref={parentRef} style={{flex:1,overflowY:'auto',overflowX:'auto',minHeight:0}}>
          {filtered.length===0
            ? <div style={{padding:'60px 0',textAlign:'center',color:T.sub,fontSize:13}}>
                {search?`No rows match "${search}"`:'No data available.'}
              </div>
            : (
              <div style={{height:virtualizer.getTotalSize(),position:'relative'}}>
                {virtualizer.getVirtualItems().map(vRow=>{
                  const row=filtered[vRow.index];
                  const isSel=selected.has(row._id);
                  const isEven=vRow.index%2===0;
                  return(
                    <div key={vRow.key} data-index={vRow.index} ref={virtualizer.measureElement}
                      style={{position:'absolute',top:0,left:0,right:0,
                        transform:`translateY(${vRow.start}px)`,
                        display:'grid',gridTemplateColumns:gridCols,
                        borderBottom:'1px solid '+T.border+'35',
                        background:isSel?'#EFF6FF':isEven?T.white:'#FAFAFA',
                        transition:'background .08s'}}
                      onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background='#F5F8FF';}}
                      onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background=isEven?T.white:'#FAFAFA';}}>
                      <div style={{padding:'0 14px',display:'flex',alignItems:'center',minHeight:50,flexShrink:0}}>
                        <input type="checkbox" checked={isSel} onChange={()=>toggleRow(row._id)}
                          style={{cursor:'pointer',width:14,height:14}}/>
                      </div>
                      {visDefs.map(col=>(
                        <div key={col.field} style={{padding:'8px 10px',display:'flex',
                          alignItems:'center',minHeight:50,overflow:'hidden',
                          borderLeft:'1px solid '+T.border+'20'}}>
                          <CellValue value={row[col.field]} fieldName={col.field} colorRules={colorRules}/>
                        </div>
                      ))}
                      <div style={{borderLeft:'1px solid '+T.border+'20'}}/>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* Footer */}
        <div style={{borderTop:'1px solid '+T.border,padding:'9px 16px',flexShrink:0,
          display:'flex',justifyContent:'space-between',alignItems:'center',
          fontSize:11,color:T.sub,background:'#FAFBFC'}}>
          <span>
            {filtered.length.toLocaleString()} row{filtered.length!==1?'s':''}
            {search&&<span> matching <strong>"{search}"</strong></span>}
            {selected.size>0&&<span style={{color:T.blue,marginLeft:6}}>· {selected.size} selected</span>}
          </span>
          <span style={{color:T.dim,fontSize:11}}>
            {Object.keys(colorRules).length>0&&(
              <span style={{color:T.blue,marginRight:10}}>
                🎨 {Object.keys(colorRules).length} color rule{Object.keys(colorRules).length!==1?'s':''}
              </span>
            )}
            {allRows.length.toLocaleString()} total
          </span>
        </div>
      </div>

      {showSettings&&(
        <SettingsModal allCols={allCols} allRows={allRows} config={config}
          onSave={handleSaveSettings} onClose={()=>setShowSettings(false)}/>
      )}
    </div>
  );
}
