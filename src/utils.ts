//Strip control codes
export function scc(s: string = '') {
  return s.replace(/\x1b\[[0-9;]*m/g, '').trim();
}
