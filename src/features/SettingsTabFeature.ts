import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

import { Feature } from "./Feature";

import { SettingsService } from "../services/SettingsService";
import { normalizeCustomHiddenSelectors } from "../utils/zoomVisibility";

class ObsidianZoomPluginSettingTab extends PluginSettingTab {
  constructor(app: App, plugin: Plugin, private settings: SettingsService) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Zooming in when clicking on the bullet")
      .addToggle((toggle) => {
        toggle.setValue(this.settings.zoomOnClick).onChange(async (value) => {
          this.settings.zoomOnClick = value;
          await this.settings.save();
        });
      });

    new Setting(containerEl)
      .setName("Debug mode")
      .setDesc(
        "Open DevTools (Command+Option+I or Control+Shift+I) to copy the debug logs."
      )
      .addToggle((toggle) => {
        toggle.setValue(this.settings.debug).onChange(async (value) => {
          this.settings.debug = value;
          await this.settings.save();
        });
      });

    containerEl.createEl("h3", { text: "Visibility while zoomed in" });

    new Setting(containerEl)
      .setName("Hide inline title")
      .setDesc("Hide the note title shown above the editor while zoomed in.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.settings.hideInlineTitle)
          .onChange(async (value) => {
            this.settings.hideInlineTitle = value;
            await this.settings.save();
          });
      });

    new Setting(containerEl)
      .setName("Hide properties")
      .setDesc("Hide the properties section while zoomed in.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.settings.hideProperties)
          .onChange(async (value) => {
            this.settings.hideProperties = value;
            await this.settings.save();
          });
      });

    new Setting(containerEl)
      .setName("Hide embedded backlinks")
      .setDesc("Hide the in-document backlinks section while zoomed in.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.settings.hideEmbeddedBacklinks)
          .onChange(async (value) => {
            this.settings.hideEmbeddedBacklinks = value;
            await this.settings.save();
          });
      });

    new Setting(containerEl)
      .setName("Custom hidden selectors")
      .setDesc(
        "One CSS selector per line. Matching elements inside the current markdown pane will be hidden while zoomed in."
      )
      .addTextArea((textArea) => {
        textArea
          .setPlaceholder(".my-plugin-panel")
          .setValue(this.settings.customHiddenSelectors.join("\n"))
          .onChange(async (value) => {
            this.settings.customHiddenSelectors =
              normalizeCustomHiddenSelectors(value);
            await this.settings.save();
          });

        textArea.inputEl.rows = 4;
        textArea.inputEl.cols = 40;
      });
  }
}

export class SettingsTabFeature implements Feature {
  constructor(private plugin: Plugin, private settings: SettingsService) {}

  async load() {
    this.plugin.addSettingTab(
      new ObsidianZoomPluginSettingTab(
        this.plugin.app,
        this.plugin,
        this.settings
      )
    );
  }

  async unload() {}
}
