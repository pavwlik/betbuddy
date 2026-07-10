/**
 * Parimutuel odds engine.
 *
 * Everyone's stakes on a poll go into one shared pool. The odds on each
 * option are derived from how much money is on that option relative to the
 * whole pool, minus a small house margin (kept here just so the pool always
 * sums to slightly less than 100% payout, same as real parimutuel systems).
 *
 * odds(option) = (totalPool * (1 - MARGIN)) / poolOnOption
 *
 * If nobody has bet on an option yet, we return a default "opening" odds
 * value instead of Infinity, so the UI has something sane to show.
 */

export const HOUSE_MARGIN = 0.05; // 5%
const DEFAULT_OPENING_ODDS = 2.0;
const MIN_ODDS = 1.01;

export interface OptionPool {
  optionId: string;
  totalStaked: number;
}

export function computeOdds(pools: OptionPool[]): Record<string, number> {
  const totalPool = pools.reduce((sum, p) => sum + p.totalStaked, 0);
  const result: Record<string, number> = {};

  for (const p of pools) {
    if (totalPool === 0 || p.totalStaked === 0) {
      result[p.optionId] = DEFAULT_OPENING_ODDS;
      continue;
    }
    const raw = (totalPool * (1 - HOUSE_MARGIN)) / p.totalStaked;
    result[p.optionId] = Math.max(MIN_ODDS, Math.round(raw * 100) / 100);
  }

  return result;
}

export function toWinAmount(stake: number, odds: number): number {
  return Math.round(stake * odds * 100) / 100;
}

/**
 * Before anyone has placed a bet, we don't have a betting pool yet — but we
 * do have the anonymous gut-feeling votes. We use those to seed "opening"
 * odds (implied probability from vote share, same margin as above), so the
 * board isn't just flat 2.00/2.00/2.00 the moment a poll opens.
 * Once real bets exist, computeOdds() (pool-based) takes over instead.
 */
export function computeOpeningOddsFromVotes(
  voteCounts: { optionId: string; count: number }[]
): Record<string, number> {
  const total = voteCounts.reduce((s, v) => s + v.count, 0);
  const result: Record<string, number> = {};

  for (const v of voteCounts) {
    if (total === 0 || v.count === 0) {
      result[v.optionId] = DEFAULT_OPENING_ODDS;
      continue;
    }
    const impliedProbability = v.count / total;
    const raw = (1 - HOUSE_MARGIN) / impliedProbability;
    result[v.optionId] = Math.max(MIN_ODDS, Math.round(raw * 100) / 100);
  }

  return result;
}
