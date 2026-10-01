// Детерминированный PRNG (mulberry32) + вспомогательные числовые утилиты.
// Используется генератором demo-данных, чтобы результат был воспроизводим.

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sum(arr: number[]): number {
  let s = 0;
  for (const v of arr) s += v;
  return s;
}

/**
 * Распределяет целое `total` по весам `weights` методом наибольшего остатка
 * (Hamilton). Гарантирует, что сумма результата === total.
 */
export function allocate(weights: number[], total: number): number[] {
  const n = weights.length;
  const result = new Array<number>(n).fill(0);
  if (total <= 0 || n === 0) return result;
  const s = sum(weights);
  if (s <= 0) {
    // равномерно
    let rem = total;
    for (let i = 0; i < n && rem > 0; i++) {
      result[i] = 1;
      rem--;
    }
    return result;
  }
  const rema: { i: number; frac: number }[] = [];
  let assigned = 0;
  for (let i = 0; i < n; i++) {
    const ideal = (total * weights[i]) / s;
    const base = Math.floor(ideal);
    result[i] = base;
    assigned += base;
    rema.push({ i, frac: ideal - base });
  }
  let remaining = total - assigned;
  rema.sort((a, b) => b.frac - a.frac);
  let k = 0;
  while (remaining > 0 && k < rema.length) {
    result[rema[k].i] += 1;
    remaining--;
    k++;
  }
  return result;
}

/**
 * Распределяет `total` по весам, но каждое значение ограничено caps[i].
 * Предусловие: total <= sum(caps).
 */
export function allocateCapped(
  weights: number[],
  caps: number[],
  total: number,
): number[] {
  const n = weights.length;
  const result = new Array<number>(n).fill(0);
  if (total <= 0 || n === 0) return result;
  const effWeights = weights.map((w, i) => (caps[i] > 0 ? Math.max(w, 0) : 0));
  const s = sum(effWeights);
  if (s <= 0) {
    // нет весов — заполняем по caps подряд
    let rem = total;
    for (let i = 0; i < n && rem > 0; i++) {
      const give = Math.min(caps[i], rem);
      result[i] = give;
      rem -= give;
    }
    return result;
  }
  const rema: { i: number; frac: number }[] = [];
  let assigned = 0;
  for (let i = 0; i < n; i++) {
    const ideal = (total * effWeights[i]) / s;
    const base = Math.min(caps[i], Math.floor(ideal));
    result[i] = base;
    assigned += base;
    rema.push({ i, frac: ideal - base });
  }
  let remaining = total - assigned;
  rema.sort((a, b) => b.frac - a.frac);
  // несколько проходов, чтобы учесть cap
  let guard = 0;
  while (remaining > 0 && guard < n * 4) {
    let progressed = false;
    for (const r of rema) {
      if (remaining <= 0) break;
      if (result[r.i] < caps[r.i]) {
        result[r.i] += 1;
        remaining--;
        progressed = true;
      }
    }
    if (!progressed) break;
    guard++;
  }
  return result;
}

/**
 * Чинит ограничение child[i] <= parent[i], сохраняя sum(child) неизменной.
 * Предусловие: sum(child) <= sum(parent).
 */
export function repairCap(child: number[], parent: number[]): void {
  const n = child.length;
  let excess = 0;
  for (let i = 0; i < n; i++) {
    if (child[i] > parent[i]) {
      excess += child[i] - parent[i];
      child[i] = parent[i];
    }
  }
  if (excess <= 0) return;
  const headroom = child.map((c, i) => parent[i] - c);
  const give = allocateCapped(headroom, headroom, excess);
  for (let i = 0; i < n; i++) child[i] += give[i];
}

export function round(n: number): number {
  return Math.round(n);
}

export function pick<T>(rnd: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rnd() * arr.length) % arr.length];
}

export function range(from: number, to: number): number[] {
  const r: number[] = [];
  for (let i = from; i <= to; i++) r.push(i);
  return r;
}
