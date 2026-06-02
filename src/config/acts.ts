import type { ActId } from '../types';
export const ACT_OPTIONS:{id:ActId;label:string}[]=[{id:'all',label:'Все акты'},{id:'V26:A3',label:'V26:A3'},{id:'V26:A2',label:'V26:A2'},{id:'V26:A1',label:'V26:A1'}];
// Fallback ranges kept here intentionally: edit these if Riot changes the season calendar.
export const ACT_RANGES:{id:Exclude<ActId,'all'>;start:string;end:string}[]=[
 {id:'V26:A1',start:'2026-01-07T00:00:00',end:'2026-03-04T00:00:00'},
 {id:'V26:A2',start:'2026-03-04T00:00:00',end:'2026-04-29T00:00:00'},
 {id:'V26:A3',start:'2026-04-29T00:00:00',end:'2026-06-24T00:00:00'},
];
export const MIN_MATCHES_FOR_COMBO=1;
