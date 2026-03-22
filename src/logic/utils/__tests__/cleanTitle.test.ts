import { cleanTitle } from "../cleanTitle";

test("should clean title", () => {
  expect(cleanTitle(" Text with spaces ")).toBe("Text with spaces");
  expect(cleanTitle("# Some header")).toBe("Some header");
  expect(cleanTitle("## Some header")).toBe("Some header");
  expect(cleanTitle("### Some header")).toBe("Some header");
  expect(cleanTitle("#### Some header")).toBe("Some header");
  expect(cleanTitle("#\tSome header")).toBe("Some header");
  expect(cleanTitle("#Some invalid header")).toBe("#Some invalid header");
  expect(cleanTitle("- Some bullet")).toBe("Some bullet");
  expect(cleanTitle("+ Some bullet")).toBe("Some bullet");
  expect(cleanTitle("* Some bullet")).toBe("Some bullet");
  expect(cleanTitle("  * Some bullet  ")).toBe("Some bullet");
  expect(cleanTitle("\t*\tSome bullet  ")).toBe("Some bullet");
  expect(cleanTitle("\t*Some invalid bullet  ")).toBe("*Some invalid bullet");
  expect(cleanTitle("# [Link](http://example.com)")).toBe("Link");
  expect(cleanTitle("- **bold text**")).toBe("bold text");
  expect(cleanTitle("## *italic*")).toBe("italic");
  expect(cleanTitle("# `code`")).toBe("code");
  expect(cleanTitle("- ~~strike~~")).toBe("strike");
  expect(cleanTitle("# ==highlight==")).toBe("highlight");
  expect(cleanTitle("# [[Some Page]]")).toBe("Some Page");
  expect(cleanTitle("# [[Page|Display]]")).toBe("Display");
  expect(cleanTitle("- ![alt](img.png)")).toBe("alt");
  expect(cleanTitle("# **bold** and *italic*")).toBe("bold and italic");
  expect(cleanTitle("## [**bold link**](http://example.com)")).toBe(
    "bold link"
  );
  expect(cleanTitle("# [[Page|`Code Display`]]")).toBe("Code Display");
});
