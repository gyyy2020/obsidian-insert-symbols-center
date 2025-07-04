"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
/**
 * Special Symbols Insert Plugin for Obsidian
 * Adds a command to insert special symbols through a user-friendly modal interface
 */
// Define symbol categories with their respective symbols
// Each symbol has a display name and value (the actual character to insert)
const SYMBOL_CATEGORIES = {
    'Arrows': [
        { name: 'Right Arrow', value: '→' },
        { name: 'Left Arrow', value: '←' },
        { name: 'Up Arrow', value: '↑' },
        { name: 'Down Arrow', value: '↓' },
        { name: 'Right Double Arrow', value: '⇒' },
        { name: 'Left Double Arrow', value: '⇐' },
        { name: 'Up Double Arrow', value: '⇧' },
        { name: 'Down Double Arrow', value: '⇩' },
        // Diagonal arrows
        { name: 'Northeast Arrow', value: '↗' },
        { name: 'Southeast Arrow', value: '↘' },
        { name: 'Northwest Arrow', value: '↖' },
        { name: 'Southwest Arrow', value: '↙' },
        // Harpoons
        { name: 'Right Harpoon', value: '⇀' },
        { name: 'Left Harpoon', value: '↽' },
        { name: 'Right Harpoon Up', value: '⇁' },
        { name: 'Left Harpoon Up', value: '↼' },
        // Long arrows
        { name: 'Long Right Arrow', value: '⟶' },
        { name: 'Long Left Arrow', value: '⟵' },
        { name: 'Long Left Right Arrow', value: '⟷' },
        // Arrowheads
        { name: 'Right Triangle Arrowhead', value: '▶' },
        { name: 'Left Triangle Arrowhead', value: '◀' },
        { name: 'Up Triangle Arrowhead', value: '▲' },
        { name: 'Down Triangle Arrowhead', value: '▼' },
        // Mathematical arrows
        { name: 'Implies Arrow', value: '⇒' },
        { name: 'Equivalent Arrow', value: '⇔' },
        { name: 'Long Implies Arrow', value: '⟹' },
        { name: 'Long Equivalent Arrow', value: '⟺' },
    ],
    'Greek Letters': [
        { name: 'Alpha (α)', value: 'α' },
        { name: 'Beta (β)', value: 'β' },
        { name: 'Gamma (γ)', value: 'γ' },
        { name: 'Delta (δ)', value: 'δ' },
        { name: 'Epsilon (ε)', value: 'ε' },
        { name: 'Zeta (ζ)', value: 'ζ' },
        { name: 'Eta (η)', value: 'η' },
        { name: 'Theta (θ)', value: 'θ' },
        { name: 'Iota (ι)', value: 'ι' },
        { name: 'Kappa (κ)', value: 'κ' },
        { name: 'Lambda (λ)', value: 'λ' },
        { name: 'Mu (μ)', value: 'μ' },
        { name: 'Nu (ν)', value: 'ν' },
        { name: 'Xi (ξ)', value: 'ξ' },
        { name: 'Omicron (ο)', value: 'ο' },
        { name: 'Pi (π)', value: 'π' },
        { name: 'Rho (ρ)', value: 'ρ' },
        { name: 'Sigma (σ)', value: 'σ' },
        { name: 'Tau (τ)', value: 'τ' },
        { name: 'Upsilon (υ)', value: 'υ' },
        { name: 'Phi (φ)', value: 'φ' },
        { name: 'Chi (χ)', value: 'χ' },
        { name: 'Psi (ψ)', value: 'ψ' },
        { name: 'Omega (ω)', value: 'ω' },
    ],
    'Math Symbols': [
        { name: 'Plus-Minus (±)', value: '±' },
        { name: 'Multiplication (×)', value: '×' },
        { name: 'Division (÷)', value: '÷' },
        { name: 'Infinity (∞)', value: '∞' },
        { name: 'Integral (∫)', value: '∫' },
        { name: 'Sum (∑)', value: '∑' },
        { name: 'Product (∏)', value: '∏' },
        { name: 'Square Root (√)', value: '√' },
        { name: 'Less Than or Equal (≤)', value: '≤' },
        { name: 'Greater Than or Equal (≥)', value: '≥' },
        { name: 'Not Equal (≠)', value: '≠' },
    ]
};
/**
 * Main plugin class for Special Symbols Insert
 * Manages plugin lifecycle and command registration
 */
class SpecialSymbolsPlugin extends obsidian_1.Plugin {
    /**
     * Called when the plugin is loaded
     * Registers the command to open the symbol selection modal
     */
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Loading Special Symbols Insert plugin');
            // Register command to trigger symbol insertion modal
            this.addCommand({
                id: 'insert-special-symbol',
                name: 'Insert special symbol',
                editorCallback: (editor) => {
                    // Open modal with access to app, editor, symbols, and plugin instance
                    new SymbolModal(this.app, editor, SYMBOL_CATEGORIES, this).open();
                }
            });
        });
    }
    /**
     * Called when the plugin is unloaded
     */
    onunload() {
        console.log('Unloading Special Symbols Insert plugin');
    }
    /**
     * Inserts a symbol into the active editor
     * @param editor - The active editor instance
     * @param symbol - The symbol character to insert
     */
    insertSymbol(editor, symbol) {
        editor.replaceSelection(symbol);
    }
}
exports.default = SpecialSymbolsPlugin;
/**
 * Modal for selecting and inserting special symbols
 * Provides a user interface with category selection and symbol grid
 */
class SymbolModal extends obsidian_1.Modal {
    /**
     * Create a new SymbolModal
     * @param app - Obsidian app instance
     * @param editor - Active editor instance
     * @param categories - Symbol categories to display
     * @param plugin - Main plugin instance
     */
    constructor(app, editor, categories, plugin) {
        super(app);
        this.editor = editor;
        this.categories = categories;
        this.selectedCategory = Object.keys(categories)[0]; // Default to first category
        this.plugin = plugin;
    }
    /**
     * Called when the modal is opened
     * Renders the UI with category selector and symbol grid
     */
    onOpen() {
        const { contentEl } = this;
        contentEl.addClass('symbol-modal'); // Apply CSS class for styling
        contentEl.createEl('h2', { text: 'Insert Special Symbol' }); // Modal title
        // Create category selector dropdown
        const categoryContainer = contentEl.createDiv({ cls: 'category-selector' });
        categoryContainer.createEl('span', { text: 'Category: ' });
        const categorySelect = categoryContainer.createEl('select');
        // Populate dropdown with available categories
        Object.keys(this.categories).forEach(category => {
            const option = categorySelect.createEl('option', { text: category });
            option.value = category;
        });
        // Create grid container for symbols
        const symbolGrid = contentEl.createDiv({ cls: 'symbol-grid' });
        /**
         * Updates the symbol grid with symbols from the selected category
         */
        const updateSymbols = () => {
            symbolGrid.empty(); // Clear existing symbols
            // Add buttons for each symbol in the selected category
            this.categories[this.selectedCategory].forEach(symbol => {
                const button = symbolGrid.createEl('button', { text: symbol.value, cls: 'symbol-button' });
                button.setAttr('title', symbol.name); // Show symbol name on hover
                button.addEventListener('click', () => {
                    this.close(); // Close modal after selection
                    this.plugin.insertSymbol(this.editor, symbol.value); // Insert symbol
                });
            });
        };
        // Update symbols when category selection changes
        categorySelect.addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            updateSymbols();
        });
        updateSymbols(); // Initial symbol grid render
    }
    /**
     * Called when the modal is closed
     * Cleans up the modal content
     */
    onClose() {
        this.contentEl.empty(); // Remove all elements from modal
    }
}
