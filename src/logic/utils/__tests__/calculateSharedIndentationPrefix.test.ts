import { calculateSharedIndentationPrefix } from "../calculateSharedIndentationPrefix";

test("should return shared indentation for nested list subtree", () => {
  expect(
    calculateSharedIndentationPrefix(["  - Child", "    - Grandchild"])
  ).toBe("  ");
});

test("should return single-line indentation for nested item", () => {
  expect(calculateSharedIndentationPrefix(["    - Child"])).toBe("    ");
});

test("should ignore blank lines when calculating shared indentation", () => {
  expect(
    calculateSharedIndentationPrefix(["  - Child", "", "    - Grandchild"])
  ).toBe("  ");
});

test("should return empty indentation for top-level items and headings", () => {
  expect(calculateSharedIndentationPrefix(["- Parent", "  - Child"])).toBe("");
  expect(calculateSharedIndentationPrefix(["# Heading", "text"])).toBe("");
});

test("should keep exact shared whitespace prefix for mixed indentation", () => {
  expect(
    calculateSharedIndentationPrefix([" \t- Child", " \t  - Grandchild"])
  ).toBe(" \t");
});
