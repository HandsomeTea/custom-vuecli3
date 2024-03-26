import { Tips } from './tips-typing';
import { showToast, Dialog, showLoadingToast } from 'vant';

export default new class VantUITool extends Tips {
	constructor() {
		super();
	}

	public success(message: string): void {
		showToast({
			type: 'success',
			message: this.t(message),
			position: 'top'
		});
	}

	public error(message: string): void {
		showToast({
			type: 'fail',
			message: this.t(message),
			position: 'top'
		});
	}

	public warn(message: string): void {
		showToast({
			message: this.t(message),
			position: 'top'
		});
	}

	public async alert(message: string, title?: string) {
		await Dialog.alert({
			message: this.t(message),
			...title ? { title: this.t(title) } : {}
		}).then(() => true);
	}

	public async confirm(message: string, title?: string): Promise<boolean> {
		return await Dialog.confirm({
			message: this.t(message),
			...title ? { title: this.t(title) } : {}
		}).then(() => true).catch(() => false);
	}

	public loading(text?: string) {
		return showLoadingToast({
			message: this.t(text || ''),
			forbidClick: true,
			duration: 0
		});
	}
};
