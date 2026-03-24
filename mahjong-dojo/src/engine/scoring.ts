import type { YakuResult } from "./types";

// ─── Han/Fu-based scoring ──────────────────────────────────

/**
 * Calculate base points from han and fu.
 * Simplified scoring table for the prototype.
 */
export function calculateBasePoints(han: number, fu: number): number {
  // Yakuman
  if (han >= 13) return 8000;

  // Counted yakuman (sanbaiman, baiman, haneman, mangan)
  if (han >= 11) return 6000; // sanbaiman
  if (han >= 8) return 4000; // baiman
  if (han >= 6) return 3000; // haneman
  if (han >= 5) return 2000; // mangan

  // 4 han 30 fu or 3 han 60 fu = mangan
  if ((han === 4 && fu >= 30) || (han === 3 && fu >= 60)) return 2000;

  // Normal calculation: fu × 2^(han+2)
  const base = fu * Math.pow(2, han + 2);
  // Cap at mangan
  return Math.min(base, 2000);
}

export interface ScoreResult {
  /** Total points paid to winner */
  total: number;
  /** If ron: points paid by the discarder. If tsumo: [non-dealer pays, dealer pays] */
  payments: number | [number, number];
}

/**
 * Calculate final payment amounts.
 * @param basePoints - from calculateBasePoints
 * @param isDealer - is the winner the dealer?
 * @param isTsumo - self-draw win?
 * @param honba - current honba count (adds 100/300 per honba)
 */
export function calculatePayments(
  basePoints: number,
  isDealer: boolean,
  isTsumo: boolean,
  honba: number
): ScoreResult {
  const honbaBonus = honba * 300;

  if (isTsumo) {
    if (isDealer) {
      // Each non-dealer pays ceil(base * 2 / 100) * 100
      const each = roundUp(basePoints * 2) + 100 * honba;
      return { total: each * 3, payments: [each, each] };
    } else {
      const nonDealer = roundUp(basePoints) + 100 * honba;
      const dealer = roundUp(basePoints * 2) + 100 * honba;
      return {
        total: nonDealer * 2 + dealer,
        payments: [nonDealer, dealer],
      };
    }
  } else {
    // Ron
    if (isDealer) {
      const total = roundUp(basePoints * 6) + honbaBonus;
      return { total, payments: total };
    } else {
      const total = roundUp(basePoints * 4) + honbaBonus;
      return { total, payments: total };
    }
  }
}

/** Round up to nearest 100 */
function roundUp(n: number): number {
  return Math.ceil(n / 100) * 100;
}

// ─── Fu calculation (simplified) ───────────────────────────

export function calculateFu(
  isTsumo: boolean,
  isClosed: boolean,
  isPinfu: boolean,
  isChiitoitsu: boolean
): number {
  if (isChiitoitsu) return 25;
  if (isPinfu && isTsumo) return 20;
  if (isPinfu && !isTsumo) return 30;

  // Base fu
  let fu = 20;
  if (!isTsumo && isClosed) fu += 10; // menzen ron bonus
  if (isTsumo) fu += 2;

  // Simplified: add 10 fu as a rough estimate for sets
  // (A full implementation would examine each set individually)
  fu += 10;

  return roundUpFu(fu);
}

function roundUpFu(fu: number): number {
  return Math.ceil(fu / 10) * 10;
}

// ─── Convenience: full score from yaku list ────────────────

export function scoreHand(
  yaku: YakuResult[],
  isTsumo: boolean,
  isClosed: boolean,
  isDealer: boolean,
  honba: number
): ScoreResult & { han: number; fu: number } {
  const totalHan = yaku.reduce((sum, y) => sum + y.han, 0);
  const isYakuman = yaku.some((y) => y.isYakuman);

  const isPinfu = yaku.some((y) => y.name === "Pinfu");
  const isChiitoitsu = yaku.some((y) => y.name === "Chiitoitsu");

  const fu = isYakuman ? 30 : calculateFu(isTsumo, isClosed, isPinfu, isChiitoitsu);
  const han = isYakuman ? 13 : totalHan;

  const basePoints = calculateBasePoints(han, fu);
  const result = calculatePayments(basePoints, isDealer, isTsumo, honba);

  return { ...result, han, fu };
}
