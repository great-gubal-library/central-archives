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
			setContent(content: string): void;
		}

		ui: {
			registry: {
				addButton(id: string, options: ButtonOptions): void;

				addMenuItem(id: string, options: MenuItemOptions): void;
			}
		}
	}
}
