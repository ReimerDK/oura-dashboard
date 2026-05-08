export function interpolate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
    template
  );
}
