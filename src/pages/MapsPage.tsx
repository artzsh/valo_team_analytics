import { useEffect, useMemo, useState } from 'react';
import { useData } from '../App';
import { Container, Hero } from '../components/PageShell';
import { Fade, FilterBar, Loading, NoData, normalizeMinMatches } from '../components/Common';
import { ComboList, ComboRow } from '../components/Cards';
import { aggregateCombos, best, worst } from '../lib/metrics';
import { filterMatches, rowsFromMatches } from '../lib/grouping';
import { mapAsset } from '../lib/assets';
import type { ActId } from '../types';

export function MapsPage() {
  const { matches, catalog, loading } = useData();
  const [act, setAct] = useState<ActId>('all');
  const [player, setPlayer] = useState('');
  const [map, setMap] = useState('');
  const [minMatchesInput, setMinMatchesInput] = useState('1');
  const minMatches = normalizeMinMatches(minMatchesInput);
  const maps = useMemo(() => { const count = new Map<string, number>(); matches.filter((match) => act === 'all' || match.act === act).forEach((match) => count.set(match.map, (count.get(match.map) ?? 0) + 1)); return [...count].sort((a, b) => b[1] - a[1]).map(([name]) => name); }, [matches, act]);
  useEffect(() => { if (!maps.includes(map)) setMap(maps[0] ?? ''); }, [maps, map]);
  const players = useMemo(() => [...new Set(matches.flatMap((match) => match.rows.map((row) => row.player)))].sort(), [matches]);
  const filteredMatches = useMemo(() => filterMatches(matches, act, player, map), [matches, act, player, map]);
  const rows = rowsFromMatches(filteredMatches);
  const normal = aggregateCombos(filteredMatches, 'players', minMatches);
  const roles = aggregateCombos(filteredMatches, 'roles', minMatches);
  const agents = aggregateCombos(filteredMatches, 'agents', minMatches);
  const hasCombos = normal.length > 0 || roles.length > 0 || agents.length > 0;
  const background = mapAsset(catalog, map).image;

  if (loading) return <Loading/>;
  return <div className="relative"><div className="pointer-events-none absolute inset-x-0 top-0 h-[450px] bg-cover bg-center opacity-20" style={{ backgroundImage: `linear-gradient(to bottom,transparent,#080b12),url(${background})` }}/><Container><div className="relative">
    <Hero eyebrow="Map room" title="Статистика по картам" copy="Проверяй лучшие связки состава, ролей и агентов на каждой боевой площадке."/>
    <FilterBar act={act} setAct={setAct} fields={[{ label: 'Карта', value: map, set: setMap, options: maps }, { label: 'Обязательно включать', value: player, set: setPlayer, options: players, none: 'Нет' }]} numberFields={[{ label: 'Минимальное количество матчей', value: minMatchesInput, set: setMinMatchesInput }]}/>
    {!hasCombos ? <NoData/> : <Fade id={`${act}-${map}-${player}-${minMatches}`}>
      <div className="space-y-3">
        <ComboRow title="Лучшая команда" combo={best(normal)} rows={rows}/><ComboRow title="Худшая команда" combo={worst(normal)} rows={rows}/>
        <ComboRow title="Лучшая команда по ролям" combo={best(roles)} rows={rows}/><ComboRow title="Худшая команда по ролям" combo={worst(roles)} rows={rows}/>
        <ComboRow title="Лучший состав агентов" combo={best(agents)} rows={rows}/><ComboRow title="Худший состав агентов" combo={worst(agents)} rows={rows}/>
      </div>
      <div className="mt-8 grid gap-5"><ComboList title="Обычные составы" combos={normal} rows={rows}/><ComboList title="Составы по ролям" combos={roles} rows={rows}/><ComboList title="Составы по агентам" combos={agents} rows={rows}/></div>
    </Fade>}
  </div></Container></div>;
}
