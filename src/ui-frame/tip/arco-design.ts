import { Tips } from './tips-typing';
import { Message, Modal, Notification } from '@arco-design/web-vue';

export default new class UITool extends Tips {
	private allNoticing = new Set<() => void>();

	public success(message: string): void {
		Message.success({
			showIcon: true,
			content: this.t(message),
			position: 'top'
		});
	}

	public warn(message: string): void {
		Message.warning({
			showIcon: true,
			content: this.t(message),
			position: 'top'
		});
	}

	public error(message: string): void {
		Message.error({
			showIcon: true,
			content: this.t(message),
			position: 'top'
		});
	}

	public async alert(message: string, title?: string): Promise<true> {
		return new Promise((resolve) => {
			Modal.info({
				title: title ? this.t(title) : undefined,
				content: this.t(message),
				titleAlign: 'start',
				hideCancel: true,
				escToClose: false,
				maskClosable: false,
				simple: false,
				closable: false,
				onOk: () => resolve(true)
			});
		});
	}

	public async confirm(message: string, title?: string): Promise<boolean> {
		return new Promise((resolve) => {
			Modal.info({
				title: title ? this.t(title) : undefined,
				content: this.t(message),
				titleAlign: 'start',
				hideCancel: false,
				escToClose: false,
				maskClosable: false,
				simple: false,
				closable: false,
				onOk: () => resolve(true),
				onCancel: () => resolve(false)
			});
		});
	}

	public noticing(title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') {
		const noticing = Notification[type]({
			title: this.t(title),
			content: this.t(message),
			closable: true,
			showIcon: true,
			duration: 8 * 1000
		});

		this.allNoticing.add(noticing.close);
		return noticing;
	}

	public noticed(title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') {
		const noticed = Notification[type]({
			title: this.t(title),
			content: this.t(message),
			closable: false,
			showIcon: true
		});

		this.allNoticing.add(noticed.close);
		return noticed;
	}

	public closeAllNotice(): void {
		this.allNoticing.forEach(a => a());
	}
};
