import { Tips } from './tips-typing';
import { ElMessage, ElMessageBox, ElLoading, ElNotification, ElMessageBoxOptions, MessageBoxData, LoadingOptions, NotificationProps } from 'element-plus';

import 'element-plus/theme-chalk/el-message.css';
import 'element-plus/theme-chalk/el-message-box.css';
import 'element-plus/theme-chalk/el-button.css';
import 'element-plus/theme-chalk/el-loading.css';
import 'element-plus/theme-chalk/el-notification.css';

interface CloseNotificationFn {
	(): void;
}

export default new class EleUITool extends Tips {
	private allNoticing: Set<CloseNotificationFn>;

	constructor() {
		super();
		this.allNoticing = new Set();
	}

	public success(message: string): void {
		ElMessage({
			showClose: true,
			message: this.t(message),
			type: 'success'
		});
	}

	public error(message: string): void {
		ElMessage({
			showClose: true,
			message: this.t(message),
			type: 'error'
		});
	}

	public warn(message: string): void {
		ElMessage({
			showClose: true,
			message: this.t(message),
			type: 'warning'
		});
	}

	public async alert(message: string, title?: string, option?: ElMessageBoxOptions): Promise<true> {
		return await ElMessageBox.alert(this.t(message), this.t(title || ''), {
			...option,
			confirmButtonText: this.t(option?.confirmButtonText || 'yes'),
			type: option?.type || 'info',
			showClose: false,
			showCancelButton: false,
			closeOnClickModal: false,
			closeOnPressEscape: false,
			showInput: false
		}).then(() => true);
	}

	public async confirm(message: string, title?: string, option?: ElMessageBoxOptions): Promise<boolean> {
		return await ElMessageBox.alert(this.t(message), this.t(title || ''), {
			...option,
			confirmButtonText: this.t(option?.confirmButtonText || '确认'),
			cancelButtonText: this.t(option?.cancelButtonText || '取消'),
			type: option?.type || 'info',
			showClose: false,
			showCancelButton: true,
			closeOnClickModal: false,
			closeOnPressEscape: false,
			showInput: false
		}).then(() => true).catch(() => false);
	}

	public async prompt(message: string, title: string, option?: ElMessageBoxOptions): Promise<string | false> {
		return await ElMessageBox.alert(this.t(message), this.t(title), {
			...option,
			confirmButtonText: this.t(option?.confirmButtonText || 'yes'),
			cancelButtonText: this.t(option?.cancelButtonText || 'cancel'),
			type: 'info',
			showClose: false,
			showCancelButton: true,
			closeOnClickModal: false,
			closeOnPressEscape: false,
			showInput: true,
			inputErrorMessage: this.t(option?.inputErrorMessage || 'it_is_illegal')
		}).then((data: MessageBoxData) => {
			if (data.action === 'cancel' || data.action === 'close' || data.action === 'confirm') {
				return false;
			} else {
				return data.value;
			}
		}).catch(() => false);
	}

	public loading(text?: string, option?: LoadingOptions) {
		return ElLoading.service({
			...option,
			text: this.t(text || '')
		});
	}

	public noticing(title: string, message: string, option?: NotificationProps) {
		const noticing = ElNotification({
			...option,
			title: this.t(title),
			message: this.t(message)
		});

		this.allNoticing.add(noticing.close);
		return noticing;
	}

	public noticed(title: string, message: string, option?: NotificationProps) {
		const noticed = ElNotification({
			...option,
			title: this.t(title),
			message: this.t(message)
		});

		this.allNoticing.add(noticed.close);
		return noticed;
	}

	public closeAllNotice(): void {
		this.allNoticing.forEach(a => a());
	}
};
