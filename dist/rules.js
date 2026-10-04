export const CHARACTERS=['mumei','ikoma','biba'];
export const NAMES={mumei:'無名',ikoma:'生駒',biba:'美馬'};
export const RULES={version:'2026-10-05.conservative-v1',single:1,confirmedFlash:15,highSingle:15,double:15,highDouble:30,allstar:30,highAllstar:60,source:'https://p.hisshobon.jp/machine/3906/1/90306'};
export const emptyHigh=()=>Object.fromEntries(CHARACTERS.map(c=>[c,false]));
export function minimumPoints(e,resolutions={},rules=RULES){
 if(e.type!=='chance')return {};
 return Object.fromEntries(e.characters.map(c=>[c,e.chanceType==='allstar'?(c==='biba'?null:(e.high[c]?rules.highAllstar:rules.allstar)):e.chanceType==='double'?(e.high[c]?rules.highDouble:rules.double):e.high[c]?rules.highSingle:e.illuminated[c]===true&&resolutions[e.id]==='no-cz'?rules.confirmedFlash:rules.single]));
}
const emptyStats=()=>({points:0,chances:0,singles:0,flash:0,dark:0,unknown:0,high:0,normal:0,normalFlash:0,pending:0,unknownAmounts:0});
export function replay(events){
 const resolutions=Object.fromEntries(events.filter(e=>e.type==='resolve').map(e=>[e.target,e.result]));
 let high=emptyHigh(),current=Object.fromEntries(CHARACTERS.map(c=>[c,emptyStats()])),total=Object.fromEntries(CHARACTERS.map(c=>[c,emptyStats()])),cz=[],sessions=[],st=0,games=null;
 for(const e of events){
  if(e.type==='state')high={...high,[e.character]:e.enabled};
  if(e.type==='games')games=e.value;
  if(e.type==='chance')for(const c of e.characters){
   for(const stats of [current[c],total[c]]){
    const amount=minimumPoints(e,resolutions)[c];stats.points+=amount??0;if(amount===null)stats.unknownAmounts++;stats.chances++;
    if(e.chanceType==='single')stats.singles++;
    if(e.illuminated[c]===true)stats.flash++;else if(e.illuminated[c]===false)stats.dark++;else stats.unknown++;
    if(e.high[c])stats.high++;
    if(e.chanceType==='single'&&!e.high[c]){stats.normal++;if(e.illuminated[c]===true){stats.normalFlash++;if(!resolutions[e.id])stats.pending++;}}
   }
  }
  if(e.type==='cz'){cz.push({id:e.id,character:e.character,timestamp:e.timestamp,stats:{...current[e.character]},boundary:'observed_cz_record'});current[e.character]=emptyStats();}
  if(e.type==='st'){sessions.push({id:e.id,timestamp:e.timestamp,current:structuredClone(current)});st++;current=Object.fromEntries(CHARACTERS.map(c=>[c,emptyStats()]));high=emptyHigh();}
 }
 return {high,current,total,cz,sessions,st,games,resolutions};
}
export function activeEvents(events){const undone=new Set(events.filter(e=>e.type==='undo').map(e=>e.target));return events.filter(e=>e.type!=='undo'&&!undone.has(e.id));}
export function undoTarget(events){return activeEvents(events).at(-1)?.id;}
export function validateImport(data){
 if(data?.schemaVersion!==1||data.machine!=='S-KABANERI-2022'||!Array.isArray(data.sessions)||!data.sessions.length)throw Error('対応するメダル機JSONではありません');
 const safeId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x);
 const ids=new Set(),sessionIds=new Set();let open=0;
 for(const s of data.sessions){
  if(!safeId(s.id)||sessionIds.has(s.id)||!Array.isArray(s.events)||!Number.isFinite(s.startedAt)||(s.endedAt!=null&&!Number.isFinite(s.endedAt)))throw Error('実戦形式が不正です');
  sessionIds.add(s.id);if(s.endedAt==null)open++;const prior=new Map(),undone=new Set();
  for(const e of s.events){
   if(!safeId(e.id)||ids.has(e.id)||!Number.isFinite(e.timestamp)||!['chance','state','games','cz','st','resolve','undo'].includes(e.type))throw Error('イベント形式が不正です');
   ids.add(e.id);
   if(e.type==='chance'){
    if(!['single','double','allstar'].includes(e.chanceType)||!Array.isArray(e.characters)||new Set(e.characters).size!==e.characters.length||e.characters.length!==({single:1,double:2,allstar:3}[e.chanceType])||e.characters.some(c=>!CHARACTERS.includes(c))||!e.high||CHARACTERS.some(c=>typeof e.high[c]!=='boolean')||!e.illuminated||e.characters.some(c=>![true,false,null].includes(e.illuminated[c])))throw Error('チャンス目形式が不正です');
    if(e.chanceType==='single'&&typeof e.illuminated[e.characters[0]]!=='boolean')throw Error('単独の発光記録が不正です');
   }
   if(['state','cz'].includes(e.type)&&!CHARACTERS.includes(e.character))throw Error('キャラが不正です');
   if(e.type==='state'&&typeof e.enabled!=='boolean')throw Error('状態が不正です');
   if(e.type==='games'&&(!Number.isSafeInteger(e.value)||e.value<0))throw Error('ゲーム数が不正です');
   if(['undo','resolve'].includes(e.type)){
    const target=prior.get(e.target);
    if(!target||target.type==='undo'||undone.has(e.target))throw Error('参照が不正です');
    if(e.type==='undo')undone.add(e.target);
    if(e.type==='resolve'&&(target.type!=='chance'||target.chanceType!=='single'||target.high[target.characters[0]]||!target.illuminated[target.characters[0]]||!['no-cz','cz-or-unknown'].includes(e.result)))throw Error('確認形式が不正です');
   }
   prior.set(e.id,e);
  }
 }
 if(open>1)throw Error('記録中の実戦が複数あります');
 return data;
}
