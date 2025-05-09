import axios from 'axios';

const provider = axios.create({ baseURL: process.env.GRAFANA_ENDPOINT ?? 'http://localhost:3000', timeout: 3000 });
provider.interceptors.response.use(undefined, (e) => {
    throw Error(e.response?.data?.message ?? e.message);
});

export async function userBySession(token: string): Promise<{
    id: number;
    email: string;
    name?: string;
    login: string;
    theme?: string;
    orgId: number;
    isGrafanaAdmin: boolean;
    isDisabled: boolean;
    isExternal: boolean;
    authLabels: string[];
    updatedAt: string;
    createdAt: string;
    avatarUrl: string;
}> {
    return (await provider.get('/api/user', { headers: { Cookie: `grafana_session=${token}` } })).data;
}
