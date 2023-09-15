import { PermissionType } from '@/store/stateModel';
import HTTP from './http';

class Base {
    public errorHandle(error: HttpException): Promise<ApiResult> {
        return Promise.resolve({ error });
    }

    public successHandle(data: unknown): Promise<ApiResult> {
        return Promise.resolve({ data });
    }
}

export const Account = new class Accounts extends Base {
    constructor() {
        super();
    }

    public async test(body?: Record<string, unknown>): Promise<ApiResult> {
        return HTTP.get('/api/v1/users/search', { data: body }).then(r => this.successHandle(r)).catch(e => this.errorHandle(e));
    }

    public async login(type: 'pwd' | 'resume', payload: { account?: string, password?: string, token?: string }) {
        return HTTP.send('/api/projectpub/service/v1/account/login', 'post', { data: { type, payload } }).then(r => this.successHandle(r)).catch(e => this.errorHandle(e));
    }

    public async getUserPermissions(userId: string) {
        return HTTP.send('/api/project/service/v1/account/login', 'post', { data: { userId } }).then(r => this.successHandle(r)).catch(e => this.errorHandle(e));
    }
};

export const Role = new class Roles extends Base {
    constructor() {
        super();
    }

    async getList(option?: { keyword?: string, skip?: number, limit?: number }) {
        return HTTP.send('/api/project/service/v1/role', 'get', { params: option }).then(r => this.successHandle(r)).catch(e => this.errorHandle(e));
    }

    async delete(id: string | Array<string>) {
        return HTTP.send('/api/project/service/v1/role', 'delete', { data: { id } }).then(r => this.successHandle(r)).catch(e => this.errorHandle(e));
    }

    async addOrUpdate(role: { name: string, data: Record<string, Array<PermissionType>>, id?: string }) {
        return HTTP.send('/api/project/service/v1/role', 'post', { data: role }).then(r => this.successHandle(r)).catch(e => this.errorHandle(e));
    }

    async getPermissions(id: string) {
        return HTTP.send(`/api/project/service/v1/role/${id}`, 'get').then(r => this.successHandle(r)).catch(e => this.errorHandle(e));
    }
};
