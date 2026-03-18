import { detectBreadcrumbType } from "../detectBreadcrumbType";

test("should detect heading levels", () => {
  expect(detectBreadcrumbType("# Title")).toEqual({
    kind: "heading",
    level: 1,
  });
  expect(detectBreadcrumbType("## Title")).toEqual({
    kind: "heading",
    level: 2,
  });
  expect(detectBreadcrumbType("### Title")).toEqual({
    kind: "heading",
    level: 3,
  });
  expect(detectBreadcrumbType("#### Title")).toEqual({
    kind: "heading",
    level: 4,
  });
  expect(detectBreadcrumbType("##### Title")).toEqual({
    kind: "heading",
    level: 5,
  });
  expect(detectBreadcrumbType("###### Title")).toEqual({
    kind: "heading",
    level: 6,
  });
});

test("should detect unchecked task", () => {
  expect(detectBreadcrumbType("- [ ] Todo item")).toEqual({
    kind: "task",
    checked: false,
  });
});

test("should detect checked task", () => {
  expect(detectBreadcrumbType("- [x] Done item")).toEqual({
    kind: "task",
    checked: true,
  });
  expect(detectBreadcrumbType("- [X] Done item")).toEqual({
    kind: "task",
    checked: true,
  });
});

test("should detect unordered list", () => {
  expect(detectBreadcrumbType("- Item")).toEqual({ kind: "list" });
  expect(detectBreadcrumbType("* Item")).toEqual({ kind: "list" });
  expect(detectBreadcrumbType("+ Item")).toEqual({ kind: "list" });
});

test("should detect numbered list", () => {
  expect(detectBreadcrumbType("1. Item")).toEqual({ kind: "numbered-list" });
  expect(detectBreadcrumbType("42. Item")).toEqual({ kind: "numbered-list" });
});

test("should detect indented items", () => {
  expect(detectBreadcrumbType("\t\t- Item")).toEqual({ kind: "list" });
  expect(detectBreadcrumbType("    - [x] Done")).toEqual({
    kind: "task",
    checked: true,
  });
});

test("should return root for unrecognized lines", () => {
  expect(detectBreadcrumbType("plain text")).toEqual({ kind: "root" });
});
