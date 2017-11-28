export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
}

export function toUnder(str: string): string {
  return str.replace(/([A-Z])/g, function ($1) {
    return "_" + $1.toLowerCase();
  });
}