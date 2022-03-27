declare module 'tinymce' {
	interface ButtonOptions {
		tooltip: string;
		icon: string;
		onAction: () => void;
	}

	interface MenuItemOptions {
		text: string;
		icon: string;
		onAction: () => void;
	}

	export interface TinyMceEditor {
		focus(): void;

		execCommand(command: string): void;

		selection: {
			getContent(options: { format: string }): string;
			setContent(content: string): void;
		}

		ui: {
			registry: {
				addButton(id: string, options: ButtonOptions): void;

				addMenuItem(id: string, options: MenuItemOptions): void;
			}
		}

		undoManager: {
			add(): void;
			transact(action: () => void): void;
		}
	}
}
