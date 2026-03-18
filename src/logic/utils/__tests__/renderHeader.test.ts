/**
 * @jest-environment jsdom
 */
import { renderHeader } from "../renderHeader";

test("should render html with icons and heading styles", () => {
  const h = renderHeader(document, {
    breadcrumbs: [
      { title: "Document", pos: null, type: { kind: "root" } },
      { title: "header 1", pos: 10, type: { kind: "heading", level: 1 } },
    ],
    onClick: () => {},
  });

  // Root breadcrumb should have icon with fallback text
  const titles = h.querySelectorAll<HTMLAnchorElement>(".enhanced-zoom-title");
  expect(titles.length).toBe(2);

  // Root icon
  const rootIcon = titles[0].querySelector(".enhanced-zoom-icon");
  expect(rootIcon).not.toBeNull();
  expect(rootIcon!.textContent).toBe("\u{1F4C4}");

  // Heading icon with badge
  const headingIcon = titles[1].querySelector(".enhanced-zoom-icon");
  expect(headingIcon).not.toBeNull();
  expect(headingIcon!.textContent).toBe("H1");
  expect(headingIcon!.classList.contains("enhanced-zoom-heading-badge")).toBe(
    true
  );

  // Heading data attribute
  expect(titles[1].dataset.headingLevel).toBe("1");
});

test("should render list and task icons", () => {
  const h = renderHeader(document, {
    breadcrumbs: [
      { title: "Document", pos: null, type: { kind: "root" } },
      { title: "item", pos: 5, type: { kind: "list" } },
      { title: "todo", pos: 10, type: { kind: "task", checked: false } },
      { title: "done", pos: 15, type: { kind: "task", checked: true } },
      { title: "step 1", pos: 20, type: { kind: "numbered-list" } },
    ],
    onClick: () => {},
  });

  const icons = h.querySelectorAll(".enhanced-zoom-icon");
  expect(icons[1].textContent).toBe("\u2022"); // bullet
  expect(icons[2].textContent).toBe("\u2610"); // unchecked
  expect(icons[3].textContent).toBe("\u2611"); // checked
  expect(icons[4].textContent).toBe("1."); // numbered
});

test("should handle click on document link", () => {
  const onClick = jest.fn();
  const h = renderHeader(document, {
    breadcrumbs: [
      { title: "Document", pos: null, type: { kind: "root" } },
      { title: "header 1", pos: 10, type: { kind: "heading", level: 1 } },
    ],
    onClick,
  });

  h.querySelectorAll<HTMLSpanElement>(".enhanced-zoom-title")[0].click();

  expect(onClick).toHaveBeenCalledWith(null);
});

test("should handle click on header link", () => {
  const onClick = jest.fn();
  const h = renderHeader(document, {
    breadcrumbs: [
      { title: "Document", pos: null, type: { kind: "root" } },
      { title: "header 1", pos: 10, type: { kind: "heading", level: 1 } },
    ],
    onClick,
  });

  h.querySelectorAll<HTMLSpanElement>(".enhanced-zoom-title")[1].click();

  expect(onClick).toHaveBeenCalledWith(10);
});

test("should handle click on icon within breadcrumb", () => {
  const onClick = jest.fn();
  const h = renderHeader(document, {
    breadcrumbs: [
      { title: "Document", pos: null, type: { kind: "root" } },
      { title: "header 1", pos: 10, type: { kind: "heading", level: 1 } },
    ],
    onClick,
  });

  // Click on the icon element inside the second breadcrumb
  const icon = h
    .querySelectorAll<HTMLSpanElement>(".enhanced-zoom-title")[1]
    .querySelector(".enhanced-zoom-icon") as HTMLElement;
  icon.click();

  expect(onClick).toHaveBeenCalledWith(10);
});
