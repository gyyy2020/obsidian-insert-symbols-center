import { App, Editor, MarkdownView, Plugin, Modal } from 'obsidian';

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
    { name: 'Lambda (λ)', value: 'λ' },
    { name: 'Pi (π)', value: 'π' },
    { name: 'Sigma (σ)', value: 'σ' },
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
export default class SpecialSymbolsPlugin extends Plugin {
  /**
   * Called when the plugin is loaded
   * Registers the command to open the symbol selection modal
   */
  async onload() {
    console.log('Loading Special Symbols Insert plugin');

    // Register command to trigger symbol insertion modal
    this.addCommand({
      id: 'insert-special-symbol',
      name: 'Insert special symbol',
      editorCallback: (editor: Editor) => {
        // Open modal with access to app, editor, symbols, and plugin instance
        new SymbolModal(this.app, editor, SYMBOL_CATEGORIES, this).open();
      }
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
  insertSymbol(editor: Editor, symbol: string) {
    editor.replaceSelection(symbol);
  }
}

/**
 * Modal for selecting and inserting special symbols
 * Provides a user interface with category selection and symbol grid
 */
class SymbolModal extends Modal {
  private editor: Editor; // Active editor instance
  private categories: Record<string, Array<{name: string, value: string}>>; // Symbol categories and their symbols
  private selectedCategory: string; // Currently selected category
  private plugin: SpecialSymbolsPlugin; // Reference to the main plugin instance

  /**
   * Create a new SymbolModal
   * @param app - Obsidian app instance
   * @param editor - Active editor instance
   * @param categories - Symbol categories to display
   * @param plugin - Main plugin instance
   */
  constructor(app: App, editor: Editor, categories: Record<string, Array<{name: string, value: string}>>, plugin: SpecialSymbolsPlugin) {
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
      this.selectedCategory = (e.target as HTMLSelectElement).value;
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

// Required for Obsidian plugin type checking
declare module 'obsidian' {
  interface App {
    workspace: Workspace;
  }
}