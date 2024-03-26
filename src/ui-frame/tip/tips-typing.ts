import i18n from '@/lang';

export abstract class Tips {

	t(message: string): string {
		return i18n.global.t(message);
	}

	abstract success(message: string): void;
	abstract error(message: string): void;
	abstract warn(message: string): void;
	abstract alert(message: string, title?: string): void;
	abstract confirm(message: string, title?: string): Promise<boolean>;

	async prompt(message: string, title: string): Promise<string | false> {
		return new Promise(resolve => {
			resolve(`${title}: ${message}`);
		});
	}

	loading(text?: string) {
		alert(text);
	}

	noticing(title: string, message: string) {
		alert(`${title}: ${message}`);
	}

	noticed(title: string, message: string) {
		alert(`${title}: ${message}`);
	}
}
