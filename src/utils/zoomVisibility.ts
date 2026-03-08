import type { ObsidianZoomPluginSettings } from "../services/SettingsService";

type ZoomVisibilitySettings = Pick<
  ObsidianZoomPluginSettings,
  | "hideInlineTitle"
  | "hideProperties"
  | "hideEmbeddedBacklinks"
  | "customHiddenSelectors"
>;

const BUILT_IN_HIDDEN_ELEMENT_SELECTORS = {
  hideInlineTitle: [".inline-title"],
  hideProperties: [".metadata-container"],
  hideEmbeddedBacklinks: [".embedded-backlinks"],
} as const;

export function normalizeCustomHiddenSelectors(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
    ? value.split("\n")
    : [];

  return Array.from(
    new Set(
      values
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0)
    )
  );
}

export function buildHiddenElementSelectors(
  settings: ZoomVisibilitySettings
): string[] {
  const selectors = [
    ...(settings.hideInlineTitle
      ? BUILT_IN_HIDDEN_ELEMENT_SELECTORS.hideInlineTitle
      : []),
    ...(settings.hideProperties
      ? BUILT_IN_HIDDEN_ELEMENT_SELECTORS.hideProperties
      : []),
    ...(settings.hideEmbeddedBacklinks
      ? BUILT_IN_HIDDEN_ELEMENT_SELECTORS.hideEmbeddedBacklinks
      : []),
    ...normalizeCustomHiddenSelectors(settings.customHiddenSelectors),
  ];

  return Array.from(new Set(selectors));
}

export function compileScopedHiddenElementsCss(
  doc: Pick<Document, "querySelector">,
  scopeSelector: string,
  selectors: string[]
): {
  cssText: string;
  invalidSelectors: string[];
  validSelectors: string[];
} {
  const validSelectors: string[] = [];
  const invalidSelectors: string[] = [];

  for (const selector of selectors) {
    const scopedSelector = `${scopeSelector} ${selector}`;

    try {
      doc.querySelector(scopedSelector);
      validSelectors.push(scopedSelector);
    } catch {
      invalidSelectors.push(selector);
    }
  }

  if (validSelectors.length === 0) {
    return { cssText: "", invalidSelectors, validSelectors };
  }

  return {
    cssText: `${validSelectors.join(",\n")} {\n  display: none !important;\n}`,
    invalidSelectors,
    validSelectors,
  };
}
