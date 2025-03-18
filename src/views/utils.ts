import CryptoJS from 'crypto-js';

const key = CryptoJS.enc.Utf8.parse('sensetime').toString();
const iv = CryptoJS.enc.Utf8.parse('com');

export const aesCrypto = {
	/** 加密方法 */
	cryptoEncrypt: (word: string) => {
		const srcs = CryptoJS.enc.Utf8.parse(word);

		return CryptoJS.AES.encrypt(srcs, key, {
			iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7
		}).toString();
	},
	/** 解密方法 */
	cryptoDecrypt: (word: string) => CryptoJS.AES.decrypt(word, key, {
		iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString(CryptoJS.enc.Utf8)
};


import ClipboardJS from 'clipboard';

export const copyText = async (text: string, bindEleId: string): Promise<boolean> => {
	return await new Promise(resolve => {
		let clipboard: ClipboardJS | null = new ClipboardJS(`#${bindEleId}`, {
			text: () => text
		});

		clipboard.on('success', (e) => {
			e.clearSelection();
			resolve(true);
			clipboard?.destroy();
			clipboard = null;
		});
		clipboard.on('error', () => {
			resolve(false);
		});
	});
};

export const downloadContentAsFile = (content: string, fileName: string) => {
	const blob = new Blob([content], { type: 'text/plain' });
	let element: HTMLAnchorElement | null = document.createElement('a');

	element.href = URL.createObjectURL(blob);
	element.download = fileName;
	element.style.display = 'none';
	element.click();
	URL.revokeObjectURL(element.href);
	element = null;
};

export const random = () => Math.random().toString(36).substring(2);

export const getFileBase64 = async (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = error => reject(error);
	});
};

export const base64ToBlob = (base64: string, mimeType?: string): { blob: Blob, byteNumbers: Array<number> } | undefined => {
	const base64Data = base64.split(',')[1];
	const byteCharacters = atob(base64Data);
	const byteNumbers = new Array(byteCharacters.length);

	for (let i = 0; i < byteCharacters.length; i++) {
		byteNumbers[i] = byteCharacters.charCodeAt(i);
	}
	const byteArray = new Uint8Array(byteNumbers);

	if (mimeType) {
		return {
			blob: new Blob([byteArray], { type: mimeType }),
			byteNumbers
		};
	}

	const mimeMatch = base64.match(/^data:(.*);base64,/);

	if (mimeMatch) {
		return {
			blob: new Blob([byteArray], { type: mimeMatch[1] }),
			byteNumbers
		};
	}
};

export const elementScrollToBottom = (eleId: string) => {
	const ele = document.getElementById(eleId);

	if (ele && ele.scrollHeight > ele.clientHeight) {
		ele.scrollTo({
			behavior: 'auto',
			top: ele.scrollHeight + 10
		});
	}
};

export class IndexDb<TableModel extends object> {
	private dbName: string;
	private tableName: string;
	private version = 1;

	constructor(dbName: string, tableName: string, fn?: () => void) {
		this.checkStore(fn);
		this.dbName = dbName;
		this.tableName = tableName;
	}

	private async checkStore(warnFn?: () => void) {
		const { usage, quota } = await navigator.storage.estimate();

		if (typeof usage === 'undefined' || typeof quota === 'undefined') {
			return;
		}
		if (usage / quota > 0.8) {
			if (warnFn) {
				return warnFn();
			}
			// eslint-disable-next-line no-console
			console.warn(`您的indexdb存储空间[${this.dbName}:${this.tableName}]不足，请清理缓存`);
		}
	}

	private async confirmTable() {
		await new Promise((resolve, reject) => {
			const request = window.indexedDB.open(this.dbName, this.version);

			request.onsuccess = (event) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const db = event.target.result as IDBDatabase;

				if (!db.objectStoreNames.contains(this.tableName)) {
					reject(`table(${this.tableName}) was not initialized when the database was created. Please upgrade the database version and consider data migration.`);
				}
				resolve(true);
			};
			request.onerror = (event) => reject(event);
			request.onupgradeneeded = (event) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const db = event.target.result as IDBDatabase;

				db.createObjectStore(this.tableName, { keyPath: 'id', autoIncrement: true });
			};
		});
	}

	async add(data: TableModel): Promise<number> {
		await this.confirmTable();
		return await new Promise((resolve, reject) => {
			const request = window.indexedDB.open(this.dbName, this.version);

			request.onsuccess = (event) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const db = event.target.result as IDBDatabase;
				const transaction = db.transaction([this.tableName], 'readwrite');
				let resultId = 0;

				transaction.oncomplete = () => {
					resolve(resultId);
				};
				transaction.onerror = (event) => reject(event);
				const req = transaction.objectStore(this.tableName).add(data);

				req.onsuccess = (event) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					resultId = event.target.result as number;
				};
			};
			request.onerror = (event) => reject(event);
		});
	}

	async removeById(id: number) {
		await this.confirmTable();
		await new Promise((resolve, reject) => {
			const request = window.indexedDB.open(this.dbName, this.version);

			request.onsuccess = (event) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const db = event.target.result as IDBDatabase;
				const req = db.transaction([this.tableName], 'readwrite')
					.objectStore(this.tableName)
					.delete(id);

				req.onsuccess = () => resolve(true);
				req.onerror = (event) => reject(event);
			};
			request.onerror = (event) => reject(event);
		});
	}

	async updateById(id: number, update: Partial<TableModel>) {
		await this.confirmTable();
		await new Promise((resolve, reject) => {
			const request = window.indexedDB.open(this.dbName, this.version);

			request.onsuccess = (event) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const db = event.target.result as IDBDatabase;
				const objectStore = db.transaction([this.tableName], 'readwrite').objectStore(this.tableName);
				const req = objectStore.get(id);

				req.onerror = (event) => reject(event);
				req.onsuccess = (event) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					const data = event.target.result as TableModel | undefined;

					update = JSON.parse(JSON.stringify(update));
					if (data) {
						for (const key in update) {
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							data[key] = update[key];
						}
					}

					const requestUpdate = objectStore.put(data);

					requestUpdate.onerror = (event) => reject(event);
					requestUpdate.onsuccess = () => resolve(true);
				};
			};
			request.onerror = (event) => reject(event);
		});
	}

	async getById(id: number): Promise<TableModel & { id: number } | undefined> {
		await this.confirmTable();
		return await new Promise((resolve, reject) => {
			const request = window.indexedDB.open(this.dbName, this.version);

			request.onsuccess = (event) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const db = event.target.result as IDBDatabase;
				const data = db.transaction([this.tableName], 'readwrite').objectStore(this.tableName).get(id);

				data.onsuccess = () => resolve(data.result);
				data.onerror = (event) => reject(event);
			};
			request.onerror = (event) => reject(event);
		});
	}

	async get(filter?: Partial<TableModel>): Promise<Array<TableModel & { id: number }>> {
		await this.confirmTable();
		return await new Promise((resolve, reject) => {
			const request = window.indexedDB.open(this.dbName, this.version);

			request.onsuccess = (event) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const db = event.target.result as IDBDatabase;
				const data = db.transaction([this.tableName], 'readwrite').objectStore(this.tableName).getAll();

				data.onsuccess = () => {
					const all = data.result as Array<TableModel & { id: number }>;

					resolve(all.filter((item) => {
						for (const key in filter) {
							if (item[key] !== filter[key]) {
								return false;
							}
						}
						return true;
					}));
				};
				data.onerror = (event) => reject(event);
			};
			request.onerror = (event) => reject(event);
		});
	}
}
