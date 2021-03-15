declare interface HttpArgument {
    params?: Record<string, any>;// eslint-disable-line @typescript-eslint/no-explicit-any
    data?: Record<string, unknown>;
    headers?: Record<string, string | string[] | undefined>;
}

declare interface ExceptionInstance {
    info: string;
    [key: string]: unknown;
}

declare interface HttpException {
    httpInfo: string;
    status: number;
    type?: string;
    error: ExceptionInstance;
}

declare interface ApiResult {
    data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    error?: HttpException;
}

type SupportLanguageType = 'zh-cn' | 'zh-tw' | 'en';
