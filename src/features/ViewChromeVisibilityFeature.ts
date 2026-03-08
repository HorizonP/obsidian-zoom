import { EditorView } from "@codemirror/view";

import { Feature } from "./Feature";

import { LoggerService } from "../services/LoggerService";
import { SettingsService } from "../services/SettingsService";
import {
  buildHiddenElementSelectors,
  compileScopedHiddenElementsCss,
} from "../utils/zoomVisibility";

export interface NotifyAfterZoomIn {
  notifyAfterZoomIn(cb: (view: EditorView, pos: number) => void): void;
}

export interface NotifyAfterZoomOut {
  notifyAfterZoomOut(cb: (view: EditorView) => void): void;
}

interface RootState {
  id: string;
  styleEl: HTMLStyleElement;
}

const ZOOM_ROOT_ATTR = "data-zoom-plugin-root-id";
const ZOOM_ROOT_CLASS = "zoom-plugin-hide-view-chrome";

export class ViewChromeVisibilityFeature implements Feature {
  private activeRoots = new Map<HTMLElement, RootState>();
  private nextRootId = 0;

  constructor(
    private logger: LoggerService,
    private settings: SettingsService,
    private notifyAfterZoomIn: NotifyAfterZoomIn,
    private notifyAfterZoomOut: NotifyAfterZoomOut
  ) {}

  async load() {
    this.notifyAfterZoomIn.notifyAfterZoomIn((view) => {
      this.applyToView(view);
    });

    this.notifyAfterZoomOut.notifyAfterZoomOut((view) => {
      this.clearView(view);
    });

    this.settings.onChange("hideInlineTitle", this.onSettingsChanged);
    this.settings.onChange("hideProperties", this.onSettingsChanged);
    this.settings.onChange("hideEmbeddedBacklinks", this.onSettingsChanged);
    this.settings.onChange("customHiddenSelectors", this.onSettingsChanged);
  }

  async unload() {
    this.settings.removeCallback("hideInlineTitle", this.onSettingsChanged);
    this.settings.removeCallback("hideProperties", this.onSettingsChanged);
    this.settings.removeCallback(
      "hideEmbeddedBacklinks",
      this.onSettingsChanged
    );
    this.settings.removeCallback(
      "customHiddenSelectors",
      this.onSettingsChanged
    );

    for (const root of Array.from(this.activeRoots.keys())) {
      this.clearRoot(root);
    }
  }

  private onSettingsChanged = () => {
    for (const root of Array.from(this.activeRoots.keys())) {
      if (!root.isConnected) {
        this.activeRoots.delete(root);
        continue;
      }

      this.applyToRoot(root);
    }
  };

  private applyToView(view: EditorView) {
    const root = this.findMarkdownRoot(view);

    if (!root) {
      return;
    }

    this.applyToRoot(root);
  }

  private clearView(view: EditorView) {
    const root = this.findMarkdownRoot(view);

    if (!root) {
      return;
    }

    this.clearRoot(root);
  }

  private applyToRoot(root: HTMLElement) {
    const selectors = buildHiddenElementSelectors(this.settings);

    if (selectors.length === 0) {
      this.clearRoot(root);
      return;
    }

    const state = this.getOrCreateRootState(root);
    const scopeSelector = `.workspace-leaf-content[${ZOOM_ROOT_ATTR}="${state.id}"]`;
    const { cssText, invalidSelectors } = compileScopedHiddenElementsCss(
      root.ownerDocument,
      scopeSelector,
      selectors
    );

    for (const selector of invalidSelectors) {
      this.logger.log(
        "ViewChromeVisibilityFeature:applyToRoot",
        "invalid selector",
        selector
      );
    }

    if (!cssText) {
      this.clearRoot(root);
      return;
    }

    root.classList.add(ZOOM_ROOT_CLASS);
    root.setAttribute(ZOOM_ROOT_ATTR, state.id);
    state.styleEl.textContent = cssText;

    if (!state.styleEl.isConnected) {
      root.appendChild(state.styleEl);
    }
  }

  private clearRoot(root: HTMLElement) {
    const state = this.activeRoots.get(root);

    root.classList.remove(ZOOM_ROOT_CLASS);
    root.removeAttribute(ZOOM_ROOT_ATTR);

    if (state) {
      state.styleEl.remove();
      this.activeRoots.delete(root);
    }
  }

  private getOrCreateRootState(root: HTMLElement): RootState {
    const existing = this.activeRoots.get(root);

    if (existing) {
      return existing;
    }

    const state = {
      id: String(++this.nextRootId),
      styleEl: root.ownerDocument.createElement("style"),
    };

    state.styleEl.classList.add("zoom-plugin-view-chrome-style");
    this.activeRoots.set(root, state);

    return state;
  }

  private findMarkdownRoot(view: EditorView): HTMLElement | null {
    return view.dom.closest<HTMLElement>(
      '.workspace-leaf-content[data-type="markdown"]'
    );
  }
}
