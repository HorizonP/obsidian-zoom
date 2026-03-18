export type BreadcrumbType =
  | { kind: "root" }
  | { kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6 }
  | { kind: "list" }
  | { kind: "numbered-list" }
  | { kind: "task"; checked: boolean };

export function detectBreadcrumbType(rawLine: string): BreadcrumbType {
  const trimmed = rawLine.trim();

  // Task before list (tasks are a subset of list items)
  if (/^[-+*]\s+\[[ xX]\]/.test(trimmed)) {
    return { kind: "task", checked: /^[-+*]\s+\[[xX]\]/.test(trimmed) };
  }

  const headingMatch = trimmed.match(/^(#{1,6})\s/);
  if (headingMatch) {
    return {
      kind: "heading",
      level: headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6,
    };
  }

  if (/^\d+\.\s/.test(trimmed)) {
    return { kind: "numbered-list" };
  }

  if (/^[-+*]\s/.test(trimmed)) {
    return { kind: "list" };
  }

  return { kind: "root" };
}
