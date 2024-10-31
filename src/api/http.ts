import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError, Method, ResponseType /*,isAxiosError*/ } from 'axios';
import Agent from 'agentkeepalive';
import store from '@/store';

class Exception extends Error {
	private status: number;
	private type?: string | undefined;
	private error: Record<string, unknown>;
	private httpInfo: string;

	constructor(error: HttpException) {
		super(error.httpInfo);

		this.status = error.status;
		this.type = error.type;
		this.error = error.error;
		this.httpInfo = error.httpInfo;
	}
}

class AxiosService {
	private server = axios.create();
	constructor() {
		this.init();
	}

	private init(): void {
		this.server.defaults.timeout = 10000;
		this.server.defaults.httpAgent = new Agent({
			keepAlive: true,
			timeout: 60000, // active socket keepalive for 60 seconds
			freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
			freeSocketKeepAliveTimeout: 10,
			socketActiveTTL: 100
		});

		// 请求拦截器
		this.server.interceptors.request.use(config => this.beforeSendToServer(config), this._beforeSendToServerButError);

		// 响应拦截器
		this.server.interceptors.response.use(this._receiveSuccessResponse, this._receiveResponseNotSuccess);
	}

	private beforeSendToServer(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
		const zh = config.url?.match(/[\u4e00-\u9fa5]/g);

		if (zh) {
			const _obj: Record<string, string> = {};

			for (let i = 0; i < zh.length; i++) {
				if (!_obj[zh[i]]) {
					_obj[zh[i]] = encodeURIComponent(zh[i]);
				}
			}

			for (const key in _obj) {
				config.url = config.url?.replace(new RegExp(key, 'g'), _obj[key]);
			}
		}

		if (!config.headers.get('x-auth-token')) {
			config.headers.set('x-auth-token', store.state.user.token);
		}

		if (!config.headers.get('x-user-id')) {
			config.headers.set('x-user-id', store.state.user.user?.id);
		}

		return config;
	}

	private async _beforeSendToServerButError(error: unknown): Promise<HttpException> {
		return Promise.reject(
			new Exception({
				httpInfo: `${error}`,
				status: 0,
				error: {
					info: 'request send error: not send.'
				}
			})
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private async _receiveSuccessResponse(response: AxiosResponse): Promise<any> {
		// 这里只处理 response.status >= 200 && response.status <= 207 的情况
		const { data /*, config, headers, request, status, statusText*/ } = response;

		return Promise.resolve(data);
	}

	private async _receiveResponseNotSuccess(error: AxiosError): Promise<HttpException> {
		// const { message, name, description, number, fileName, lineNumber, columnNumber, stack, code } = error.toJSON();
		const { response, config, request: { responseURL } } = error;
		// const { url, baseURL, method } = config;

		let errorResult: HttpException = {
			status: 500,
			httpInfo: ` 访问 ${config ? config.baseURL : responseURL} 失败`,
			error: { info: '' }
		};

		if (response) {
			const { status, statusText, data } = response;

			errorResult = {
				status,
				httpInfo: statusText,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				...typeof data === 'string' ? { error: { info: data } } : data
			};
		}

		return Promise.reject(new Exception(errorResult));
	}

	public async send(url: string, method: Method, options?: HttpArgument & { responseType?: ResponseType }): Promise<AxiosResponse> {
		return await this.server.request({
			url,
			method,
			...options?.responseType ? { responseType: options.responseType } : {},
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			headers: options?.headers,
			params: { ...options?.params },
			data: typeof options?.data === 'object' && !Array.isArray(options.data) ? { ...options.data } : options?.data
		});
	}

	public async post(url: string, options: HttpArgument): Promise<AxiosResponse> {
		return await this.send(url, 'post', { params: options.params, headers: options.headers, data: options.data });
	}

	public async delete(url: string, options: HttpArgument): Promise<AxiosResponse> {
		return await this.send(url, 'delete', { params: options.params, headers: options.headers, data: options.data });
	}

	public async put(url: string, options: HttpArgument): Promise<AxiosResponse> {
		return await this.send(url, 'put', { params: options.params, headers: options.headers, data: options.data });
	}

	public async get(url: string, options: HttpArgument): Promise<AxiosResponse> {
		return await this.send(url, 'get', { params: options.params, headers: options.headers, data: options.data });
	}
}

export const HTTP = new AxiosService();

interface FetchArgument {
	body?: Record<string, unknown>
	query?: Record<string, unknown>
	header?: Record<string, string>
}

class FetchBase {
	constructor() {
		//
	}

	getQueryString(query?: Record<string, unknown>) {
		const _query = {
			...query,
			t: `${Date.now()}`
		};

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return Object.keys(_query).map(key => `${key}=${encodeURIComponent(_query[key])}`).join('&');
	}

	async fetchJsonResponseHandle(response: Response) {
		const result: ApiResult = {};

		if (response.ok) {
			result.data = await response.json();
		} else {
			result.error = await response.json();
		}
		return result;
	}
}

export const FetchService = new class FetchRestApi extends FetchBase {
	constructor() {
		super();
	}

	private async send(url: string, method: Method, options?: FetchArgument) {
		const queryString = this.getQueryString(options?.query);

		return await fetch(`http://test.adela.sensetime.com${url}?${queryString}`, {
			method,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			...options?.body ? { body: JSON.stringify(options.body) } : {},
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			headers: {
				'Content-Type': 'application/json',
				...options?.header ? options.header : {}
			}
		}).then(async (response) => await this.fetchJsonResponseHandle(response));
	}

	async post(url: string, options?: FetchArgument): Promise<ApiResult> {
		return await this.send(url, 'post', options);
	}

	async delete(url: string, options?: FetchArgument): Promise<ApiResult> {
		return await this.send(url, 'delete', options);
	}

	async put(url: string, options?: FetchArgument): Promise<ApiResult> {
		return await this.send(url, 'put', options);
	}

	async get(url: string, options?: FetchArgument): Promise<ApiResult> {
		return await this.send(url, 'get', options);
	}
};


export const StreamService = new class FileRestApi extends FetchBase {
	constructor() {
		super();
	}

	async getNotice(url: string, method: Method, options?: FetchArgument): Promise<Response> {
		const queryString = this.getQueryString(options?.query);

		return await fetch(`http://test.adela.sensetime.com${url}?${queryString}`, {
			method,
			timeout: Infinity,
			...options?.body ? { body: JSON.stringify(options.body) } : {},
			headers: {
				'Content-Type': 'application/json',
				...options?.header ? options.header : {}
			},
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			responseType: 'stream'
		});
	}

	async download(url: string, query?: Record<string, unknown>, headers?: Record<string, unknown>): Promise<Response> {
		const queryString = this.getQueryString(query);

		return await fetch(`http://test.adela.sensetime.com${url}?${queryString}`, {
			method: 'get',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			timeout: Infinity,
			headers: {
				'Content-Type': 'application/json',
				...headers ? headers : {}
			}
		});
	}
};
