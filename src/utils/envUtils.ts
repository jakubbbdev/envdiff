export function parseEnv(content: string): Record<string, string> {
  const lines = content.split(/\r?\n/);
  const env: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    env[key] = value;
  }
  return env;
}

export function diffEnv(a: Record<string, string>, b: Record<string, string>) {
  const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
  return allKeys.map(key => {
    if (!(key in a)) return { key, status: 'missing_in_a', valueA: '', valueB: b[key] };
    if (!(key in b)) return { key, status: 'missing_in_b', valueA: a[key], valueB: '' };
    if (a[key] !== b[key]) return { key, status: 'different', valueA: a[key], valueB: b[key] };
    return { key, status: 'equal', valueA: a[key], valueB: b[key] };
  });
} 