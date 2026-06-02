import { useMemo, useState } from 'react';
import { useData } from '../App';
import { Container, Hero } from '../components/PageShell';
import { Fade, FilterBar, Loading, NoData, normalizeMinMatches } from '../components/Common';
import { ComboList, ComboRow } from '../components/Cards';
import { aggregateCombos, best, worst } from '../lib/metrics';
import { filterMatches, rowsFromMatches } from '../lib/grouping';
import type { ActId } from '../types';

export function TeamsPage() {
  const { matches, loading, error } = useData();
  const [act, setAct] = useState<ActId>('all');
  const [player, setPlayer] = useState('');
  const [minMatchesInput, setMinMatchesInput] = useState('1');
  const minMatches = normalizeMinMatches(minMatchesInput);
  const players = useMemo(() => [...new Set(matches.flatMap((match) => match.rows.map((row) => row.player)))].sort(), [matches]);
  const filteredMatches = useMemo(() => filterMatches(matches, act, player), [matches, act, player]);
  const rows = rowsFromMatches(filteredMatches);
  const normal = aggregateCombos(filteredMatches, 'players', minMatches);
  const roles = aggregateCombos(filteredMatches, 'roles', minMatches);
  const hasCombos = normal.length > 0 || roles.length > 0;

  if (loading) return <Loading/>;
  return <Container>
    <Hero eyebrow="Team matrix" title="Статистика составов" copy="Сравнивай сыгранные пятёрки и ролевые сочетания. Победа матча учитывается ровно один раз."/>
    <FilterBar act={act} setAct={setAct} fields={[{ label: 'Обязательно включать', value: player, set: setPlayer, options: players, none: 'Нет' }]} numberFields={[{ label: 'Минимальное количество матчей', value: minMatchesInput, set: setMinMatchesInput }]}/>
    {error || !hasCombos ? <NoData/> : <Fade id={`${act}-${player}-${minMatches}`}>
      <div className="space-y-3">
        <ComboRow title="Лучшая команда" combo={best(normal)} rows={rows}/><ComboRow title="Худшая команда" combo={worst(normal)} rows={rows}/>
        <ComboRow title="Лучшая команда по ролям" combo={best(roles)} rows={rows}/><ComboRow title="Худшая команда по ролям" combo={worst(roles)} rows={rows}/>
      </div>
      <div className="mt-8 grid gap-5"><ComboList title="Обычные составы" combos={normal} rows={rows}/><ComboList title="Составы по ролям" combos={roles} rows={rows}/></div>
    </Fade>}
  </Container>;
}
