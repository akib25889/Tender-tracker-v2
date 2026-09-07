/**
 * Zero-dependency client-side Fuzzy Search Engine
 * Provides typo tolerance (Levenshtein distance), acronym matching,
 * tokenized multi-word search, and relevance scoring.
 */

// Compute Levenshtein edit distance between two strings
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val =
        a[i - 1] === b[j - 1]
          ? row[j - 1]
          : Math.min(row[j - 1], prev, row[j]) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }

  return row[b.length];
}

// Check if a single target word matches a single query word
function wordMatches(target: string, query: string): boolean {
  if (target === query) return true;
  if (target.includes(query)) return true;

  const qLen = query.length;
  const tLen = target.length;

  // For very short queries (< 3 chars), require exact substring
  if (qLen < 3) return false;

  // Levenshtein distance thresholds (allow distance 2 for words >= 6 chars to catch transpositions)
  const maxDistance = qLen >= 6 ? 2 : qLen >= 4 ? 1 : 0;
  if (maxDistance > 0 && Math.abs(tLen - qLen) <= maxDistance) {
    if (levenshteinDistance(target, query) <= maxDistance) {
      return true;
    }
  }

  return false;
}

// Extract acronym from text (e.g., "Dhaka Transport Coordination Authority" -> "dtca")
function getAcronym(text: string): string {
  return text
    .split(/[\s\-_/]+/)
    .filter(Boolean)
    .map((w) => w[0]?.toLowerCase())
    .join('');
}

// Subsequence check: characters of query appear in target in order
function isSubsequence(target: string, query: string): boolean {
  let qIdx = 0;
  for (let tIdx = 0; tIdx < target.length && qIdx < query.length; tIdx++) {
    if (target[tIdx] === query[qIdx]) {
      qIdx++;
    }
  }
  return qIdx === query.length;
}

/**
 * Calculates a match score between a target string and a query.
 * Returns 0 for no match, or a positive integer (higher = closer match).
 */
export function calculateFuzzyScore(targetStr: string, rawQuery: string): number {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return 100; // empty query matches everything

  const target = targetStr.toLowerCase();
  if (!target) return 0;

  // 1. Exact match
  if (target === query) return 1000;

  // 2. Starts with query
  if (target.startsWith(query)) return 800;

  // 3. Exact full substring
  if (target.includes(query)) return 600;

  // 4. Acronym match (e.g. query "dtca" matches "Dhaka Transport Coordination Authority")
  const acronym = getAcronym(target);
  if (acronym && (acronym === query || acronym.includes(query))) {
    return 500;
  }

  // 5. Multi-token match: all query tokens must match somewhere in target words
  const queryTokens = query.split(/\s+/).filter(Boolean);
  const targetWords = target.split(/[\s\-_/.,:;()]+/).filter(Boolean);

  let tokensMatched = 0;
  for (const qToken of queryTokens) {
    const hasWordMatch = targetWords.some((tWord) => wordMatches(tWord, qToken));
    if (hasWordMatch) {
      tokensMatched++;
    } else if (target.includes(qToken)) {
      tokensMatched++;
    }
  }

  if (queryTokens.length > 0 && tokensMatched === queryTokens.length) {
    return 400;
  }

  // 6. Subsequence match (for short/acronym searches <= 6 chars)
  if (query.length >= 3 && query.length <= 6 && isSubsequence(target, query)) {
    return 200;
  }

  return 0;
}

/**
 * Checks if target fields match the query using fuzzy rules.
 */
export function fuzzyMatch(
  targets: string | (string | undefined | null)[],
  query: string
): boolean {
  if (!query || !query.trim()) return true;

  const targetList = Array.isArray(targets) ? targets : [targets];
  const combined = targetList.filter(Boolean).join(' ');

  return calculateFuzzyScore(combined, query) > 0;
}

/**
 * Filters and optionally sorts an array of items by fuzzy match relevance.
 */
export function fuzzyFilter<T>(
  items: T[],
  query: string,
  extractFields: (item: T) => (string | undefined | null)[],
  sortByRelevance = false
): T[] {
  const trimmed = query.trim();
  if (!trimmed) return items;

  const scored: { item: T; score: number }[] = [];

  for (const item of items) {
    const fields = extractFields(item);
    const combined = fields.filter(Boolean).join(' ');
    const score = calculateFuzzyScore(combined, trimmed);
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  if (sortByRelevance) {
    scored.sort((a, b) => b.score - a.score);
  }

  return scored.map((s) => s.item);
}
