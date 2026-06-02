import { MIN_MATCHES_FOR_COMBO } from '../config/acts';
import type { Combo, ComboKind, DuoStats, GroupStats, Match, PlayerRow } from '../types';

export const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export const ratio = (a: number, b: number) => (b ? a / b : a ? Infinity : 0);
export const winrate = (wins: number, matches: number) => (matches ? (wins / matches) * 100 : 0);
export const byWinrateDescThenMatchesDesc = (a: Combo, b: Combo) =>
  b.winrate - a.winrate || b.matches - a.matches;
export const byWinrateAscThenMatchesDesc = (a: Combo, b: Combo) =>
  a.winrate - b.winrate || b.matches - a.matches;

export function aggregateCombos(
  matches: Match[],
  kind: ComboKind,
  minMatches = MIN_MATCHES_FOR_COMBO,
): Combo[] {
  const combos = new Map<string, Combo>();

  matches.forEach((match) => {
    const members = match.rows
      .map((row) => ({
        player: row.player,
        detail: kind === 'roles' ? row.role : kind === 'agents' ? row.agent : undefined,
      }))
      .sort((a, b) => `${a.player}:${a.detail}`.localeCompare(`${b.player}:${b.detail}`));
    const key = members.map((member) => `${member.player}${member.detail ? `:${member.detail}` : ''}`).join('|');
    const combo = combos.get(key) ?? { key, kind, members, matches: 0, wins: 0, losses: 0, winrate: 0 };

    combo.matches += 1;
    match.result === 'win' ? (combo.wins += 1) : (combo.losses += 1);
    combo.winrate = winrate(combo.wins, combo.matches);
    combos.set(key, combo);
  });

  return [...combos.values()].filter((combo) => combo.matches >= minMatches);
}

export const best = (combos: Combo[]) => [...combos].sort(byWinrateDescThenMatchesDesc)[0];
export const worst = (combos: Combo[]) => [...combos].sort(byWinrateAscThenMatchesDesc)[0];

export function summarize(rows: PlayerRow[]) {
  const wins = rows.filter((row) => row.result === 'win').length;
  const kills = rows.reduce((sum, row) => sum + row.kills, 0);
  const deaths = rows.reduce((sum, row) => sum + row.deaths, 0);

  return {
    matches: rows.length,
    wins,
    losses: rows.length - wins,
    winrate: winrate(wins, rows.length),
    kills,
    deaths,
    assists: rows.reduce((sum, row) => sum + row.assists, 0),
    kd: ratio(kills, deaths),
    hs: average(rows.map((row) => row.headshot_pct)),
    kast: average(rows.map((row) => row.kast_pct)),
    acs: average(rows.map((row) => row.acs)),
    trs: average(rows.map((row) => row.trs)),
    damage: average(rows.map((row) => row.damage_delta)),
    fk: rows.reduce((sum, row) => sum + row.first_kills, 0),
    fd: rows.reduce((sum, row) => sum + row.first_deaths, 0),
  };
}

export function groupRows(rows: PlayerRow[], field: 'map' | 'role' | 'agent'): GroupStats[] {
  const grouped = new Map<string, PlayerRow[]>();
  rows.forEach((row) => grouped.set(row[field], [...(grouped.get(row[field]) ?? []), row]));
  return [...grouped].map(([name, items]) => {
    const stats = summarize(items);
    return { name, matches: stats.matches, wins: stats.wins, winrate: stats.winrate, kd: stats.kd, kast: stats.kast, rows: items };
  }).sort((a, b) => b.winrate - a.winrate || b.matches - a.matches || b.kd - a.kd || b.kast - a.kast);
}

export function mostCommon(rows: PlayerRow[], field: 'agent' | 'match_rank') {
  const count = new Map<string, number>();
  rows.forEach((row) => count.set(row[field], (count.get(row[field]) ?? 0) + 1));
  return [...count].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

export function getDuos(matches: Match[], player: string): DuoStats[] {
  const grouped = new Map<string, { player: string; rows: PlayerRow[]; matches: number; wins: number }>();

  matches.filter((match) => match.rows.some((row) => row.player === player)).forEach((match) => {
    match.rows.filter((row) => row.player !== player).forEach((row) => {
      const duo = grouped.get(row.player) ?? { player: row.player, rows: [], matches: 0, wins: 0 };
      duo.rows.push(row);
      duo.matches += 1;
      if (match.result === 'win') duo.wins += 1;
      grouped.set(row.player, duo);
    });
  });

  return [...grouped.values()].map((duo) => ({
    ...duo,
    losses: duo.matches - duo.wins,
    winrate: winrate(duo.wins, duo.matches),
    agent: mostCommon(duo.rows, 'agent'),
  }));
}

export const getBestDuo = (duos: DuoStats[]) =>
  [...duos].sort((a, b) => b.winrate - a.winrate || b.matches - a.matches)[0];

export const getWorstDuo = (duos: DuoStats[]) =>
  [...duos].sort((a, b) => a.winrate - b.winrate || b.matches - a.matches)[0];
