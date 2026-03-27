import { BreadcrumbType } from "./detectBreadcrumbType";

export function renderHeader(
  doc: Document,
  ctx: {
    breadcrumbs: Array<{
      title: string;
      pos: number | null;
      type: BreadcrumbType;
    }>;
    onClick: (pos: number | null) => void;
    setIcon?: (el: HTMLElement, iconId: string) => void;
  }
) {
  const { breadcrumbs, onClick, setIcon } = ctx;

  const h = doc.createElement("div");
  h.classList.add("enhanced-zoom-header");

  const resolveBreadcrumbTarget = (event: Event) =>
    (event.target as HTMLElement | null)?.closest(
      ".enhanced-zoom-title"
    ) as HTMLElement | null;

  const suppressEditorInteraction = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  for (let i = 0; i < breadcrumbs.length; i++) {
    if (i > 0) {
      const d = doc.createElement("span");
      d.classList.add("enhanced-zoom-delimiter");
      d.innerText = ">";
      h.append(d);
    }

    const breadcrumb = breadcrumbs[i];
    const b = doc.createElement("a");
    b.classList.add("enhanced-zoom-title");
    b.dataset.pos = String(breadcrumb.pos);
    b.dataset.kind = breadcrumb.type.kind;
    b.title = breadcrumb.title;

    // Add icon
    const iconEl = doc.createElement("span");
    iconEl.classList.add("enhanced-zoom-icon");

    switch (breadcrumb.type.kind) {
      case "root":
        if (setIcon) {
          setIcon(iconEl, "file-text");
        } else {
          iconEl.textContent = "\u{1F4C4}";
        }
        break;
      case "heading":
        iconEl.textContent = `H${breadcrumb.type.level}`;
        iconEl.classList.add("enhanced-zoom-heading-badge");
        b.dataset.headingLevel = String(breadcrumb.type.level);
        break;
      case "list":
        if (setIcon) {
          setIcon(iconEl, "list");
        } else {
          iconEl.textContent = "\u2022";
        }
        break;
      case "numbered-list":
        if (setIcon) {
          setIcon(iconEl, "list-ordered");
        } else {
          iconEl.textContent = "1.";
        }
        break;
      case "task":
        if (setIcon) {
          setIcon(iconEl, breadcrumb.type.checked ? "check-square" : "square");
        } else {
          iconEl.textContent = breadcrumb.type.checked ? "\u2611" : "\u2610";
        }
        break;
    }

    const textEl = doc.createElement("span");
    textEl.classList.add("enhanced-zoom-title-text");
    textEl.textContent = breadcrumb.title;

    let ignoreNextClick = false;
    const activateBreadcrumb = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      const t = resolveBreadcrumbTarget(event);
      if (!t) return;

      const pos = t.dataset.pos;
      onClick(pos === "null" ? null : Number(pos));
    };

    b.appendChild(iconEl);
    b.appendChild(textEl);

    b.addEventListener("mousedown", suppressEditorInteraction);
    b.addEventListener("pointerdown", suppressEditorInteraction);
    b.addEventListener("touchstart", suppressEditorInteraction, {
      passive: false,
    });
    b.addEventListener(
      "touchend",
      (event) => {
        ignoreNextClick = true;
        activateBreadcrumb(event);
      },
      { passive: false }
    );
    b.addEventListener("click", (e) => {
      if (ignoreNextClick) {
        ignoreNextClick = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      activateBreadcrumb(e);
    });
    h.appendChild(b);
  }

  return h;
}
