import { Platform } from "obsidian";

import { normalizeCustomHiddenSelectors } from "../utils/zoomVisibility";

export interface ObsidianZoomPluginSettings {
  debug: boolean;
  zoomOnClick: boolean;
  hideInlineTitle: boolean;
  hideProperties: boolean;
  hideEmbeddedBacklinks: boolean;
  customHiddenSelectors: string[];
}

interface ObsidianZoomPluginSettingsJson {
  debug: boolean;
  zoomOnClick: boolean;
  zoomOnClickMobile: boolean;
  hideInlineTitle: boolean;
  hideProperties: boolean;
  hideEmbeddedBacklinks: boolean;
  customHiddenSelectors: string[];
}

const DEFAULT_SETTINGS: ObsidianZoomPluginSettingsJson = {
  debug: false,
  zoomOnClick: true,
  zoomOnClickMobile: false,
  hideInlineTitle: false,
  hideProperties: false,
  hideEmbeddedBacklinks: false,
  customHiddenSelectors: [],
};

export interface Storage {
  loadData(): Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  saveData(settigns: any): Promise<void>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

type K = keyof ObsidianZoomPluginSettings;
type V<T extends K> = ObsidianZoomPluginSettings[T];
type Callback<T extends K> = (cb: V<T>) => void;
type JsonValue =
  ObsidianZoomPluginSettingsJson[keyof ObsidianZoomPluginSettingsJson];

const zoomOnClickProp = Platform.isDesktop
  ? "zoomOnClick"
  : "zoomOnClickMobile";

const mappingToJson = {
  zoomOnClick: zoomOnClickProp,
  debug: "debug",
  hideInlineTitle: "hideInlineTitle",
  hideProperties: "hideProperties",
  hideEmbeddedBacklinks: "hideEmbeddedBacklinks",
  customHiddenSelectors: "customHiddenSelectors",
} as {
  [key in keyof ObsidianZoomPluginSettings]: keyof ObsidianZoomPluginSettingsJson;
};

export class SettingsService implements ObsidianZoomPluginSettings {
  private storage: Storage;
  private values: ObsidianZoomPluginSettingsJson;
  private handlers: Map<K, Set<Callback<K>>>;

  constructor(storage: Storage) {
    this.storage = storage;
    this.handlers = new Map();
  }

  get debug() {
    return this.values.debug;
  }
  set debug(value: boolean) {
    this.set("debug", value);
  }

  get zoomOnClick() {
    return this.values[zoomOnClickProp];
  }
  set zoomOnClick(value: boolean) {
    this.set("zoomOnClick", value);
  }

  get hideInlineTitle() {
    return this.values.hideInlineTitle;
  }
  set hideInlineTitle(value: boolean) {
    this.set("hideInlineTitle", value);
  }

  get hideProperties() {
    return this.values.hideProperties;
  }
  set hideProperties(value: boolean) {
    this.set("hideProperties", value);
  }

  get hideEmbeddedBacklinks() {
    return this.values.hideEmbeddedBacklinks;
  }
  set hideEmbeddedBacklinks(value: boolean) {
    this.set("hideEmbeddedBacklinks", value);
  }

  get customHiddenSelectors() {
    return this.values.customHiddenSelectors;
  }
  set customHiddenSelectors(value: string[]) {
    this.set("customHiddenSelectors", normalizeCustomHiddenSelectors(value));
  }

  onChange<T extends K>(key: T, cb: Callback<T>) {
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }

    this.handlers.get(key).add(cb);
  }

  removeCallback<T extends K>(key: T, cb: Callback<T>): void {
    const handlers = this.handlers.get(key);

    if (handlers) {
      handlers.delete(cb);
    }
  }

  async load() {
    this.values = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.storage.loadData()
    );
    this.values.customHiddenSelectors = normalizeCustomHiddenSelectors(
      this.values.customHiddenSelectors
    );
  }

  async save() {
    await this.storage.saveData(this.values);
  }

  private set<T extends K>(key: T, value: V<T>): void {
    const jsonKey = mappingToJson[key];
    (this.values as Record<keyof ObsidianZoomPluginSettingsJson, JsonValue>)[
      jsonKey
    ] = value as JsonValue;
    const callbacks = this.handlers.get(key) as Set<Callback<T>> | undefined;

    if (!callbacks) {
      return;
    }

    for (const cb of callbacks.values()) {
      cb(value);
    }
  }
}
