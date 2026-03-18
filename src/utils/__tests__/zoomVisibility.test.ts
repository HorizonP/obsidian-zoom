/**
 * @jest-environment jsdom
 */
import {
  buildHiddenElementSelectors,
  compileScopedHiddenElementsCss,
  normalizeCustomHiddenSelectors,
} from "../zoomVisibility";

test("should normalize custom selectors from text input", () => {
  expect(
    normalizeCustomHiddenSelectors(
      "\n.inline-title\n.plugin-item\n.inline-title\n"
    )
  ).toEqual([".inline-title", ".plugin-item"]);
});

test("should build selector list from presets and custom selectors", () => {
  expect(
    buildHiddenElementSelectors({
      hideInlineTitle: true,
      hideProperties: true,
      hideEmbeddedBacklinks: false,
      customHiddenSelectors: [".custom-pane", ".metadata-container"],
    })
  ).toEqual([".inline-title", ".metadata-container", ".custom-pane"]);
});

test("should compile scoped css and skip invalid selectors", () => {
  const { cssText, invalidSelectors } = compileScopedHiddenElementsCss(
    document,
    '.workspace-leaf-content[data-enhanced-zoom-root-id="1"]',
    [".inline-title", "???"]
  );

  expect(cssText).toBe(
    '.workspace-leaf-content[data-enhanced-zoom-root-id="1"] .inline-title {\n  display: none !important;\n}'
  );
  expect(invalidSelectors).toEqual(["???"]);
});
