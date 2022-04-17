
export function normalizeXivapiServerName(server: string): string {
  // Convert strings like "Omega [Chaos]" to just "Omega"
  return server.replace(/^([^ ]+) \[.+\]$/, '$1');
}
