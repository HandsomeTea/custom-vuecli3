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
