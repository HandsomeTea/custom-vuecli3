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
