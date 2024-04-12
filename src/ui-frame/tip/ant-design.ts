import { Tips } from './tips-typing';
import { message as Message, Modal } from 'ant-design-vue';

export default new class UITool extends Tips {

	public success(message: string): void {
		Message.success(this.t(message));
	}

	public error(message: string): void {
		Message.error(this.t(message));
	}

	public warn(message: string): void {
		Message.warn(this.t(message));
	}

	public alert(message: string, title?: string) {
		Modal.info({
			title,
			content: this.t(message)
		});
	}

	public async confirm(message: string, title?: string): Promise<boolean> {
		return new Promise(resolve => {
			Modal.confirm({
				title,
				content: this.t(message),
				onOk() {
					resolve(true);
				},
				onCancel() {
					resolve(false);
				}
			});
		});
	}
};
