import HTTP from './http';

class Base {
    public errorHandle(error: HttpException): Promise<ApiResult> {
        return Promise.resolve({ error });
    }

    public successHandle(data: unknown): Promise<ApiResult> {
        return Promise.resolve({ data });
    }
}

class Accounts extends Base {
    constructor() {
        super();
    }

    public async test(body?: Record<string, unknown>): Promise<ApiResult> {
        return HTTP.get('/api/v1/users/search', { data: body }).then(r => this.successHandle(r)).catch(e => this.errorHandle(e));
    }

    public async login(type: 'pwd' | 'resume', payload: { account?: string, password?: string, token?: string }) {
        return HTTP.send('/api/cemetapub/ops/v1/account/login', 'post', { data: { type, payload } }).then(r => this.successHandle(r)).catch(e => this.errorHandle(e));
    }

    public async getUserPermissions(userId: string) {
        return HTTP.send('/api/cemetapub/ops/v1/account/login', 'post', { data: { userId } }).then(r => this.successHandle(r)).catch(e => this.errorHandle(e));
    }
}

export default {
    Account: new Accounts()
};
