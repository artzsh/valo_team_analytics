import type {ActId,Match,PlayerRow} from '../types';
export function groupMatches(rows:PlayerRow[]):Match[]{const by=new Map<string,PlayerRow[]>();rows.forEach(r=>by.set(r.match_id,[...(by.get(r.match_id)??[]),r]));return [...by].flatMap(([id,rs])=>{if(rs.length<5)return[];const rows=rs.slice(0,5),result=rows[0].result;if(rows.some(r=>r.result!==result))console.warn(`Different results in match ${id}; first row used.`);return[{id,rows,result,map:rows[0].map,started_at:rows[0].started_at,act:rows[0].act}]})}
export const filterMatches=(matches:Match[],act:ActId,player?:string,map?:string)=>matches.filter(m=>(act==='all'||m.act===act)&&(!player||m.rows.some(r=>r.player===player))&&(!map||m.map===map));
export const rowsFromMatches=(matches:Match[])=>matches.flatMap(m=>m.rows);
