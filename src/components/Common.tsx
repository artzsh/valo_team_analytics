import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { ActId } from '../types';
import { ACT_OPTIONS } from '../config/acts';
import { fmt } from '../lib/normalize';

interface SelectField { label: string; value: string; set: (value: string) => void; options: string[]; none?: string }
interface NumberField { label: string; value: string; set: (value: string) => void; min?: number }

export const Fade = ({ children, id = 'x' }: { children: ReactNode; id?: string }) => (
  <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
    {children}
  </motion.div>
);

export function NoData() {
  return <div className="glass rounded-2xl p-16 text-center"><div className="text-5xl">◌</div><p className="mt-4 font-display text-3xl font-bold uppercase text-slate-300">Данных нет :(</p></div>;
}

export function Loading() {
  return <div className="flex min-h-[55vh] items-center justify-center"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-valorant"/><p className="label mt-4">Загружаем боевые отчёты</p></div></div>;
}

export function normalizeMinMatches(value: string) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export function FilterBar({ act, setAct, fields = [], numberFields = [] }: { act: ActId; setAct: (act: ActId) => void; fields?: SelectField[]; numberFields?: NumberField[] }) {
  return <div className="glass sticky top-[73px] z-40 mb-8 flex flex-wrap gap-3 rounded-2xl p-3">
    <Select label="Акт" value={act} set={(value) => setAct(value as ActId)} options={ACT_OPTIONS.map((option) => [option.id, option.label])}/>
    {fields.map((field) => <Select key={field.label} label={field.label} value={field.value} set={field.set} options={[...(field.none ? [['', field.none]] : []), ...field.options.map((option) => [option, option])]}/>) }
    {numberFields.map((field) => <NumberInput key={field.label} {...field}/>) }
  </div>;
}

function Select({ label, value, set, options }: { label: string; value: string; set: (value: string) => void; options: string[][] }) {
  return <label className="min-w-[150px] flex-1"><span className="label ml-1">{label}</span><select value={value} onChange={(event) => set(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-valorant/70">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>;
}

function NumberInput({ label, value, set, min = 1 }: NumberField) {
  return <label className="min-w-[190px] flex-1"><span className="label ml-1">{label}</span><input type="number" min={min} step="1" inputMode="numeric" value={value} onChange={(event) => set(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-valorant/70"/></label>;
}

export function StatCard({ label, value, note, accent = false }: { label: string; value: string; note?: string; accent?: boolean }) {
  return <motion.div layout className={`glass rounded-2xl p-4 ${accent ? 'border-valorant/40 bg-valorant/10' : ''}`}><p className="label">{label}</p><p className="metric mt-2">{value}</p>{note && <p className="mt-1 text-xs text-slate-400">{note}</p>}</motion.div>;
}

export const pct = (number: number) => `${fmt(number, 1)}%`;
