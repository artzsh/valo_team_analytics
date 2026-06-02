import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useData } from '../App';
import { Container, Hero } from '../components/PageShell';
import { Fade, FilterBar, Loading, NoData, pct, StatCard } from '../components/Common';
import { AgentCard, MapCard, PlayerCard, RoleCard } from '../components/Cards';
import { agentAsset } from '../lib/assets';
import { filterMatches, rowsFromMatches } from '../lib/grouping';
import { getBestDuo, getDuos, getWorstDuo, groupRows, mostCommon, summarize } from '../lib/metrics';
import { fmt } from '../lib/normalize';
import type { ActId, DuoStats } from '../types';

const roles = ['duelist', 'controller', 'initiator', 'sentinel'];

export function PlayersPage() {
  const { matches, catalog, loading } = useData();
  const [act, setAct] = useState<ActId>('all');
  const [player, setPlayer] = useState('');
  const actMatches = useMemo(() => filterMatches(matches, act), [matches, act]);
  const allRows = rowsFromMatches(actMatches);
  const players = useMemo(() => {
    const count = new Map<string, number>();
    allRows.forEach((row) => count.set(row.player, (count.get(row.player) ?? 0) + 1));
    return [...count].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [allRows]);

  useEffect(() => { if (!players.includes(player)) setPlayer(players[0] ?? ''); }, [players, player]);

  const rows = allRows.filter((row) => row.player === player);
  const stats = summarize(rows);
  const maps = groupRows(rows, 'map');
  const roleStats = groupRows(rows, 'role');
  const agents = groupRows(rows, 'agent');
  const mainAgent = mostCommon(rows, 'agent');
  const duos = getDuos(actMatches, player);
  const bestDuo = getBestDuo(duos);
  const worstDuo = getWorstDuo(duos);

  if (loading) return <Loading/>;
  return <Container>
    <Hero eyebrow="Player intel" title="Статистика игрока" copy="Личный dashboard с KPI, любимыми агентами, картами, ролями и лучшими связками с тиммейтами."/>
    <FilterBar act={act} setAct={setAct} fields={[{ label: 'Игрок', value: player, set: setPlayer, options: players }]}/>
    {!rows.length ? <NoData/> : <Fade id={`${act}-${player}`}>
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="glass relative overflow-hidden rounded-2xl p-5">
          <img src={agentAsset(catalog, mainAgent).image} className="absolute inset-0 h-full w-full object-cover opacity-30"/>
          <div className="relative flex h-full flex-col justify-end pt-32"><p className="label text-valorant">Most picked · {mainAgent}</p><p className="font-display text-3xl font-bold">{player}</p><p className="mt-2 text-sm text-slate-400">{stats.wins}W / {stats.losses}L</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Winrate" value={pct(stats.winrate)} accent/><StatCard label="Матчи" value={`${stats.matches}`}/><StatCard label="K/D" value={fmt(stats.kd, 2)}/><StatCard label="ACS" value={fmt(stats.acs, 0)}/><StatCard label="TRS" value={fmt(stats.trs, 0)}/><StatCard label="KAST" value={pct(stats.kast)}/><StatCard label="HS%" value={pct(stats.hs)}/><StatCard label="FK / FD" value={`${stats.fk} / ${stats.fd}`}/><StatCard label="Damage Delta" value={`${stats.damage >= 0 ? '+' : ''}${fmt(stats.damage, 1)}`}/><StatCard label="K / D / A" value={`${stats.kills} / ${stats.deaths} / ${stats.assists}`}/>
        </div>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <DuoCard label="Лучшее дуо" title="Надёжный напарник" duo={bestDuo} accent="text-emerald-400"/>
        <DuoCard label="Худшее дуо" title="Слабая связка" duo={worstDuo} accent="text-valorant"/>
      </div>
      <Section title="Винрейт по картам"><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{maps.map((map) => <MapCard key={map.name} stat={map}/>)}</div></Section>
      <Section title="Роли"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{roles.map((role) => <RoleCard key={role} name={role} stat={roleStats.find((stat) => stat.name.toLowerCase() === role)}/>)}</div></Section>
      <Section title="Агенты"><div className="grid gap-3 md:grid-cols-2">{agents.map((agent) => <AgentCard key={agent.name} stat={agent}/>)}</div></Section>
    </Fade>}
  </Container>;
}

function DuoCard({ label, title, duo, accent }: { label: string; title: string; duo?: DuoStats; accent: string }) {
  return <section className="glass flex min-h-40 flex-wrap items-center gap-4 rounded-2xl p-4">
    <div><p className={`label ${accent}`}>{label}</p><h2 className="font-display text-2xl font-bold uppercase">{title}</h2></div>
    {duo ? <><div className="ml-auto w-32"><PlayerCard player={duo.player} detail={duo.agent} kind="agents" rows={duo.rows}/></div><div className="min-w-28 text-right"><p className={`metric ${accent}`}>{pct(duo.winrate)}</p><p className="text-xs text-slate-400">{duo.matches} совместных матчей</p><p className="mt-1 text-xs text-slate-500">{duo.wins}W / {duo.losses}L</p></div></> : <div className="ml-auto text-sm text-slate-400">Данных нет :(</div>}
  </section>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-8"><h2 className="mb-4 font-display text-2xl font-bold uppercase">{title}</h2>{children}</section>;
}
