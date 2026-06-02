export type Result='win'|'loss';
export type ActId='all'|'V26:A1'|'V26:A2'|'V26:A3';
export interface PlayerRow {match_id:string;started_at:Date;mode:string;map:string;duration:string;average_rank:string;team:string;team_score:number;opponent_score:number;score:string;result:Result;player:string;riot_id:string;agent:string;role:string;account_level:number;match_rank:string;trs:number;acs:number;kills:number;deaths:number;assists:number;kd_diff:number;damage_delta:number;adr:number;headshot_pct:number;kast_pct:number;first_kills:number;first_deaths:number;multikills:number;act:ActId|null}
export interface Match {id:string;rows:PlayerRow[];result:Result;map:string;started_at:Date;act:ActId|null}
export type ComboKind='players'|'roles'|'agents';
export interface ComboMember {player:string;detail?:string}
export interface Combo {key:string;kind:ComboKind;members:ComboMember[];matches:number;wins:number;losses:number;winrate:number}
export interface AssetItem {name:string;image?:string;order?:number}
export interface AssetCatalog {agents:Record<string,AssetItem>;maps:Record<string,AssetItem>;roles:Record<string,AssetItem>;ranks:Record<string,AssetItem>}
export interface GroupStats {name:string;matches:number;wins:number;winrate:number;kd:number;kast:number;rows:PlayerRow[]}

export interface DuoStats {player:string;rows:PlayerRow[];matches:number;wins:number;losses:number;winrate:number;agent:string}
