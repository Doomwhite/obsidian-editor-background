import { Plugin, WorkspaceWindow } from 'obsidian';
import { UrlSettingsTab } from './PluginSettingsTab';

interface PluginSettings {
	imageUrl: string;
	inputContrast: boolean;
	opacity?: number;
	bluriness?: string;
	brightness?: number;  // New setting for brightness
	hue?: number;         // New setting for hue
	saturation?: number;  // New setting for saturation
}

export const DEFAULT_SETTINGS: Partial<PluginSettings> = {
	imageUrl: 'protocol://domain.tld/path/to/image.png',
	opacity: 0.3,
	bluriness: 'low',
	inputContrast: false,
	brightness: 28.5,   // Default brightness as a decimal (0.055 = 5.5%)
	hue: 0,              // Default hue as a degree (0deg for no change)
	saturation: 1.0      // Default saturation (1.0 = 100% original saturation)
};

export default class BackgroundPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new UrlSettingsTab(this.app, this));
		this.app.workspace.onLayoutReady(() => this.UpdateBackground(document));
		this.app.workspace.on('window-open', (win: WorkspaceWindow) => this.UpdateBackground(win.doc));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.UpdateBackground();
	}

	UpdateBackground(doc: Document = activeDocument) {
		const filterValue = `
      brightness(${this.settings.brightness}%) 
      hue-rotate(${this.settings.hue}deg) 
      saturate(${this.settings.saturation})
    `;
		doc.body.style.setProperty('--obsidian-editor-background-image', `url('${this.settings.imageUrl}')`);
		doc.body.style.setProperty('--obsidian-editor-background-bluriness', filterValue);
		doc.body.style.setProperty('--obsidian-editor-background-opacity', `${this.settings.opacity}`);
		doc.body.style.setProperty('--obsidian-editor-background-input-contrast', this.settings.inputContrast ? '#ffffff17' : 'none');
	}
}
