'use strict';

const obsidian = require('obsidian');

// Default settings for the plugin
const DEFAULT_SETTINGS = {
    selectedCategory: 'arrows'
};

// The folder name for symbol definition files within the plugin directory
const SYMBOL_FOLDER = 'symbols';

class SymbolModal extends obsidian.Modal {
    constructor(app, editor, plugin) {
        super(app);
        this.editor = editor;
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass('symbol-inserter-modal');
        contentEl.createEl('h2', { text: 'Insert a Symbol' });

        // --- Category Selector Dropdown ---
        const categorySelectorEl = contentEl.createDiv({ cls: 'symbol-category-selector' });
        categorySelectorEl.createEl('span', { text: 'Category: ' });
        const dropdown = categorySelectorEl.createEl('select');

        const categories = Object.keys(this.plugin.loadedCategories);
        categories.forEach(category => {
            dropdown.createEl('option', {
                text: category,
                value: category
            });
        });

        dropdown.value = this.plugin.settings.selectedCategory;

        dropdown.addEventListener('change', async (evt) => {
            const newCategory = evt.target.value;
            this.plugin.settings.selectedCategory = newCategory;
            await this.plugin.saveSettings();
            this.renderSymbols(newCategory);
        });

        // --- Symbol Container ---
        this.symbolContainer = contentEl.createDiv({ cls: 'symbol-container' });
        this.renderSymbols(this.plugin.settings.selectedCategory);
    }

    renderSymbols(category) {
        this.symbolContainer.empty();
        const symbols = this.plugin.loadedCategories[category] || [];

        symbols.forEach(symbol => {
            const symbolButton = this.symbolContainer.createEl('button', {
                text: symbol,
                cls: 'symbol-button'
            });
            symbolButton.addEventListener('click', () => {
                this.editor.replaceSelection(symbol);
                this.close();
            });
        });
    }

    onClose() {
        this.contentEl.empty();
    }
}

class SymbolInserterPlugin extends obsidian.Plugin {
    async onload() {
        await this.loadSettings();
        await this.loadSymbolCategories();

        this.addCommand({
            id: 'insert-special-symbol',
            name: 'Insert special symbol',
            editorCallback: (editor) => new SymbolModal(this.app, editor, this).open()
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async loadSymbolCategories() {
        this.loadedCategories = {};
        const symbolsPath = `${this.manifest.dir}/${SYMBOL_FOLDER}`;
        const adapter = this.app.vault.adapter;

        if (!await adapter.exists(symbolsPath)) {
            await adapter.mkdir(symbolsPath);
        }

        const result = await adapter.list(symbolsPath);
        const mdFiles = result.files.filter(file => file.endsWith('.md'));

        if (mdFiles.length === 0) {
            const defaultSymbols = '→ ← ↑ ↓ ↔ ↕ ↗ ↘ ↖ ↙ ⇒ ⇐ ⇑ ⇓ ⇔ ⇕ ⟷ ⟶ ⟵ mapsto ⟼ ↩ ↪ ↬ ↫ ⇀ ⇁ ⇂ ↽ ▲ ▼ ◄ ► ▶ ◀ ➔ ➡ ⬅ ⬆ ⬇';
            const defaultFilePath = `${symbolsPath}/arrows.md`;
            await adapter.write(defaultFilePath, defaultSymbols);
            mdFiles.push(defaultFilePath);
        }

        for (const filePath of mdFiles) {
            const categoryName = obsidian.parsePath(filePath).basename;
            const content = await adapter.read(filePath);
            const symbols = content.split(/\s+/).filter(s => s.length > 0);
            if (symbols.length > 0) {
                this.loadedCategories[categoryName] = symbols;
            }
        }

        const availableCategories = Object.keys(this.loadedCategories);
        if (availableCategories.length > 0 && !this.loadedCategories[this.settings.selectedCategory]) {
            this.settings.selectedCategory = availableCategories[0];
            await this.saveSettings();
        }
    }
}

module.exports = SymbolInserterPlugin;