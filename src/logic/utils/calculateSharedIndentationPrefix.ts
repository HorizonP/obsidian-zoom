export function calculateSharedIndentationPrefix(lines: string[]) {
  const prefixes = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^\s*/)?.[0] ?? "");

  if (prefixes.length === 0) {
    return "";
  }

  let sharedPrefix = prefixes[0];

  for (const prefix of prefixes.slice(1)) {
    while (!prefix.startsWith(sharedPrefix) && sharedPrefix.length > 0) {
      sharedPrefix = sharedPrefix.slice(0, -1);
    }
  }

  return sharedPrefix;
}
