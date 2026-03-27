import { editorEditorField } from "obsidian";

import { foldEffect, foldedRanges } from "@codemirror/language";
import { EditorSelection, StateField } from "@codemirror/state";
import { EditorView, runScopeHandlers } from "@codemirror/view";

import EnhancedZoomPlugin from "./ObsidianZoomPlugin";
import { zoomOutEffect } from "./logic/utils/effects";
import {
  buildHiddenElementSelectors,
  compileScopedHiddenElementsCss,
} from "./utils/zoomVisibility";

const keysMap: { [key: string]: number } = {
  Backspace: 8,
  Enter: 13,
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  Delete: 46,
  KeyA: 65,
};

function getTestPort() {
  const parsedPort = Number.parseInt(
    process.env.ENHANCED_ZOOM_TEST_PORT || "",
    10
  );

  if (Number.isInteger(parsedPort) && parsedPort > 0) {
    return parsedPort;
  }

  return 8080;
}

interface IHeaderItemState {
  text: string;
  title: string;
  headingLevel?: string;
  kind: string;
  textOverflow: string;
  whiteSpace: string;
  overflow: string;
  maxInlineSize: string;
}

interface IHeaderState {
  active: boolean;
  justifyContent: string;
  paddingTop: string;
  items: IHeaderItemState[];
}

interface ISharedIndentationState {
  active: boolean;
  sharedPrefix: string;
}

interface ITestEnvironmentState {
  bodyClasses?: string[];
  cssVariables?: Record<string, string>;
}

function readStyleValue(
  styles: CSSStyleDeclaration,
  camelCaseName: keyof CSSStyleDeclaration,
  cssName: string,
  fallback = ""
) {
  const value = styles[camelCaseName];

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return styles.getPropertyValue(cssName) || fallback;
}

export default class ObsidianZoomPluginWithTests extends EnhancedZoomPlugin {
  private editorView: EditorView;
  private appliedTestBodyClasses = new Set<string>();
  private appliedTestCssVariables = new Set<string>();

  wait(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  executeCommandById(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.app as any).commands.executeCommandById(id);
  }

  replaceSelection(char: string) {
    this.editorView.dispatch(this.editorView.state.replaceSelection(char));
  }

  async applySettings(settings: Partial<IZoomVisibilitySettings>) {
    if ("hideInlineTitle" in settings) {
      this.settings.hideInlineTitle = Boolean(settings.hideInlineTitle);
    }
    if ("hideProperties" in settings) {
      this.settings.hideProperties = Boolean(settings.hideProperties);
    }
    if ("hideEmbeddedBacklinks" in settings) {
      this.settings.hideEmbeddedBacklinks = Boolean(
        settings.hideEmbeddedBacklinks
      );
    }
    if ("customHiddenSelectors" in settings) {
      this.settings.customHiddenSelectors = Array.isArray(
        settings.customHiddenSelectors
      )
        ? settings.customHiddenSelectors
        : [];
    }

    await this.settings.save();
    await this.wait(10);
  }

  async applyTestEnvironment(state: ITestEnvironmentState) {
    const body = this.editorView.dom.ownerDocument.body;

    for (const className of this.appliedTestBodyClasses) {
      body.classList.remove(className);
    }
    this.appliedTestBodyClasses.clear();

    for (const variableName of this.appliedTestCssVariables) {
      body.style.removeProperty(variableName);
    }
    this.appliedTestCssVariables.clear();

    for (const className of state.bodyClasses ?? []) {
      body.classList.add(className);
      this.appliedTestBodyClasses.add(className);
    }

    for (const [variableName, value] of Object.entries(
      state.cssVariables ?? {}
    )) {
      body.style.setProperty(variableName, value);
      this.appliedTestCssVariables.add(variableName);
    }

    await this.wait(10);
  }

  simulateKeydown(keys: string) {
    const e = {
      type: "keydown",
      code: "",
      keyCode: 0,
      shiftKey: false,
      metaKey: false,
      altKey: false,
      ctrlKey: false,
      defaultPrevented: false,
      returnValue: true,
      cancelBubble: false,
      preventDefault: function () {
        e.defaultPrevented = true;
        e.returnValue = true;
      },
      stopPropagation: function () {
        e.cancelBubble = true;
      },
    };

    for (const key of keys.split("-")) {
      switch (key.toLowerCase()) {
        case "cmd":
          e.metaKey = true;
          break;
        case "ctrl":
          e.ctrlKey = true;
          break;
        case "alt":
          e.altKey = true;
          break;
        case "shift":
          e.shiftKey = true;
          break;
        default:
          e.code = key;
          break;
      }
    }

    if (e.code in keysMap) {
      e.keyCode = keysMap[e.code];
    }

    if (e.keyCode == 0) {
      throw new Error("Unknown key: " + e.code);
    }

    runScopeHandlers(this.editorView, e as KeyboardEvent, "editor");
  }

  async load() {
    await super.load();

    if (process.env.TEST_PLATFORM) {
      setImmediate(async () => {
        await this.wait(1000);
        this.connect();
      });
    }
  }

  async prepareForTests() {
    const filePath = `test.md`;
    let file = this.app.vault
      .getMarkdownFiles()
      .find((f) => f.path === filePath);
    if (!file) {
      file = await this.app.vault.create(filePath, "");
    }
    for (let i = 0; i < 10; i++) {
      await this.wait(1000);
      if (this.app.workspace.activeLeaf) {
        this.app.workspace.activeLeaf.openFile(file);
        break;
      }
    }
    await this.wait(1000);

    this.registerEditorExtension(
      StateField.define({
        create: (state) => {
          this.editorView = state.field(editorEditorField);
        },
        update: () => {},
      })
    );
  }

  async connect() {
    const ws = new WebSocket(`ws://127.0.0.1:${getTestPort()}/`);
    await this.prepareForTests();
    ws.send("ready");

    ws.addEventListener("message", async (event) => {
      const { id, type, data } = JSON.parse(event.data);

      let result;
      let error;

      try {
        switch (type) {
          case "applyState":
            this.applyState(data);
            break;
          case "applySettings":
            await this.applySettings(data);
            break;
          case "applyTestEnvironment":
            await this.applyTestEnvironment(data);
            break;
          case "simulateKeydown":
            this.simulateKeydown(data);
            break;
          case "replaceSelection":
            this.replaceSelection(data);
            break;
          case "executeCommandById":
            this.executeCommandById(data);
            break;
          case "parseState":
            result = this.parseState(data);
            break;
          case "getCurrentState":
            result = this.getCurrentState();
            break;
          case "getCurrentViewChromeState":
            result = this.getCurrentViewChromeState();
            break;
          case "getCurrentHeaderState":
            result = this.getCurrentHeaderState();
            break;
          case "getCurrentSharedIndentationState":
            result = this.getCurrentSharedIndentationState();
            break;
        }
      } catch (e) {
        error = String(e);
        if (e.stack) {
          error += "\n" + e.stack;
        }
      }

      ws.send(JSON.stringify({ id, data: result, error }));
    });
  }

  applyState(state: string[]): void;
  applyState(state: string): void;
  applyState(state: IState): void;
  applyState(state: IState | string | string[]) {
    if (typeof state === "string") {
      state = state.split("\n");
    }

    if (Array.isArray(state)) {
      state = this.parseState(state);
    }

    this.editorView.dispatch({
      effects: [zoomOutEffect.of()],
    });
    this.editorView.dispatch({
      changes: [{ from: 0, to: this.editorView.state.doc.length, insert: "" }],
    });
    this.editorView.dispatch({
      changes: [{ from: 0, insert: state.value }],
    });
    this.editorView.dispatch({
      selection: EditorSelection.create(
        state.selections.map((s) => EditorSelection.range(s.anchor, s.head))
      ),
    });
    this.editorView.dispatch({
      effects: state.folds.map((f) =>
        foldEffect.of({ from: f.from, to: f.to })
      ),
    });
  }

  getCurrentState(): IState {
    const hidden: number[] = [];

    const hiddenRanges = this.zoomFeature.calculateHiddenContentRanges(
      this.editorView.state
    );
    for (const i of hiddenRanges) {
      const lineFrom = this.editorView.state.doc.lineAt(i.from).number - 1;
      const lineTo = this.editorView.state.doc.lineAt(i.to).number - 1;
      for (let lineNo = lineFrom; lineNo <= lineTo; lineNo++) {
        hidden.push(lineNo);
      }
    }

    const folds: IFold[] = [];
    const iter = foldedRanges(this.editorView.state).iter();
    while (iter.value !== null) {
      folds.push({ from: iter.from, to: iter.to });
      iter.next();
    }

    return {
      hidden,
      folds,
      selections: this.editorView.state.selection.ranges.map((r) => ({
        anchor: r.anchor,
        head: r.head,
      })),
      value: this.editorView.state.doc.sliceString(0),
    };
  }

  getCurrentViewChromeState(): IViewChromeState {
    const root = this.editorView.dom.closest<HTMLElement>(
      '.workspace-leaf-content[data-type="markdown"]'
    );

    if (!root) {
      return {
        active: false,
        rootAttrPresent: false,
        rootClassPresent: false,
        selectors: [],
      };
    }

    const rootAttrPresent = root.hasAttribute("data-enhanced-zoom-root-id");
    const rootClassPresent = root.classList.contains(
      "enhanced-zoom-hide-view-chrome"
    );
    const styleEl = root.querySelector<HTMLStyleElement>(
      "style.enhanced-zoom-view-chrome-style"
    );
    const rootId = root.getAttribute("data-enhanced-zoom-root-id");

    if (
      !rootAttrPresent ||
      !rootClassPresent ||
      !styleEl?.isConnected ||
      !rootId
    ) {
      return {
        active: false,
        rootAttrPresent,
        rootClassPresent,
        selectors: [],
      };
    }

    const scopeSelector = `.workspace-leaf-content[data-enhanced-zoom-root-id="${rootId}"]`;
    const { validSelectors } = compileScopedHiddenElementsCss(
      root.ownerDocument,
      scopeSelector,
      buildHiddenElementSelectors(this.settings)
    );

    return {
      active: validSelectors.length > 0,
      rootAttrPresent,
      rootClassPresent,
      selectors: validSelectors.map((selector) =>
        selector.replace(`${scopeSelector} `, "")
      ),
    };
  }

  getCurrentHeaderState(): IHeaderState {
    const header = this.editorView.dom.ownerDocument.querySelector<HTMLElement>(
      ".enhanced-zoom-header"
    );

    if (!header) {
      return {
        active: false,
        justifyContent: "",
        paddingTop: "0px",
        items: [],
      };
    }

    const headerStyles = getComputedStyle(header);
    const items = Array.from(
      header.querySelectorAll<HTMLAnchorElement>(".enhanced-zoom-title")
    ).map((item) => {
      const textEl = item.querySelector<HTMLElement>(
        ".enhanced-zoom-title-text"
      );
      const textStyles = textEl ? getComputedStyle(textEl) : null;

      return {
        text: textEl?.textContent ?? "",
        title: item.title,
        headingLevel: item.dataset.headingLevel,
        kind: item.dataset.kind ?? "",
        textOverflow: textStyles
          ? readStyleValue(textStyles, "textOverflow", "text-overflow")
          : "",
        whiteSpace: textStyles
          ? readStyleValue(textStyles, "whiteSpace", "white-space")
          : "",
        overflow: textStyles
          ? readStyleValue(textStyles, "overflow", "overflow")
          : "",
        maxInlineSize: textEl?.classList.contains("enhanced-zoom-title-text")
          ? "24ch"
          : "",
      };
    });

    return {
      active: true,
      justifyContent: readStyleValue(
        headerStyles,
        "justifyContent",
        "justify-content",
        "center"
      ),
      paddingTop: readStyleValue(
        headerStyles,
        "paddingTop",
        "padding-top",
        "0px"
      ),
      items,
    };
  }

  getCurrentSharedIndentationState(): ISharedIndentationState {
    return this.zoomFeature.calculateSharedIndentationState(
      this.editorView.state
    );
  }

  parseState(content: string[]): IState;
  parseState(content: string): IState;
  parseState(content: string | string[]): IState {
    if (typeof content === "string") {
      content = content.split("\n");
    }

    const acc = content.reduce(
      (acc, line, lineNo) => {
        if (acc.foldFrom === null) {
          const arrowIndex = line.indexOf(">");
          if (arrowIndex >= 0) {
            acc.foldFrom = acc.chars + arrowIndex;
            line =
              line.substring(0, arrowIndex) + line.substring(arrowIndex + 1);
          }
        } else {
          const arrowIndex = line.indexOf("<");
          if (arrowIndex >= 0) {
            acc.folds.push({ from: acc.foldFrom, to: acc.chars + arrowIndex });
            acc.foldFrom = null;
            line =
              line.substring(0, arrowIndex) + line.substring(arrowIndex + 1);
          }
        }

        if (line.includes("#hidden")) {
          line = line.replace("#hidden", "").trim();
          acc.hidden.push(lineNo);
        }

        if (acc.anchor === null) {
          const dashIndex = line.indexOf("|");
          if (dashIndex >= 0) {
            acc.anchor = acc.chars + dashIndex;
            line = line.substring(0, dashIndex) + line.substring(dashIndex + 1);
          }
        }

        if (acc.head === null) {
          const dashIndex = line.indexOf("|");
          if (dashIndex >= 0) {
            acc.head = acc.chars + dashIndex;
            line = line.substring(0, dashIndex) + line.substring(dashIndex + 1);
          }
        }

        acc.chars += line.length;
        acc.chars += 1;
        acc.lines.push(line);

        return acc;
      },
      {
        lines: [] as string[],
        chars: 0,
        anchor: null as number | null,
        head: null as number | null,
        foldFrom: null as number | null,
        folds: [] as IFold[],
        hidden: [] as number[],
      }
    );
    if (acc.anchor === null) {
      acc.anchor = 0;
    }
    if (acc.head === null) {
      acc.head = acc.anchor;
    }

    return {
      hidden: acc.hidden,
      folds: acc.folds,
      selections: [{ anchor: acc.anchor, head: acc.head }],
      value: acc.lines.join("\n"),
    };
  }
}
