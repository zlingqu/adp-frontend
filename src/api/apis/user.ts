import { AxiosPromise } from 'axios';
import fetch from '@/api/fetch';

const version = '/open';
// const host = (window as IWindow).config.server.host + '/api' + version;
const host = '/api' + version;
// http://192.168.3.140:31500/api/open/staff/search?name=zhang
const getUserList = (params: any): AxiosPromise => {
  return fetch.get(`/mis-advanced-admin-backend/v1/people/search`, { params: params });
};

const getUserInfoV1 = (params: any): AxiosPromise => {
  return fetch.post('/api/v1/mis-ldap-service/search', params);
};

const getUserInfoV2 = (params: any): AxiosPromise => {
  return fetch.get('/api/v1/get-user-for-name', { params: params });
};

const addUserItem = (): AxiosPromise => {
  return fetch.post(`${host}/user`);
};
const updateUserItem = (): AxiosPromise => {
  return fetch.put(`${host}/user`);
};
const deleteUserItem = (): AxiosPromise => {
  return fetch.delete(`${host}/user`);
};

export default {
  getUserList,
  getUserInfoV1,
  getUserInfoV2,
  addUserItem,
  updateUserItem,
  deleteUserItem,
};
