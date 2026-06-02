export const parseNumber=(v:unknown)=>{const n=Number(String(v??'').replace(',','.').trim());return Number.isFinite(n)?n:0};
export const parsePercent=(v:unknown)=>parseNumber(String(v??'').replace('%',''));
export const parseSignedNumber=(v:unknown)=>parseNumber(String(v??'').replace('+',''));
export const normalizeName=(v:string)=>v.trim().toLocaleLowerCase();
export const parseDate=(v:string)=>{const [d,t='00:00']=v.split(',').map(s=>s.trim());const [day,month,year]=d.split('.').map(Number);const [h,m]=t.split(':').map(Number);return new Date(year,month-1,day,h,m)};
export const fmt=(n:number,d=0)=>Number.isFinite(n)?n.toFixed(d):'0';
