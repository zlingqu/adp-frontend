import { AxiosPromise } from 'axios';
import fetch from '@/api/fetch';

const version = '/v1';
// const host = (window as IWindow).config.server.host + '/api' + version;
const host = '/api' + version;

const getEnvironmentList = (params: any): AxiosPromise => {
  return fetch.get(`${host}/env`, { params: params });
};

const addEnvironmentItem = (params: any): AxiosPromise => {
  return fetch.post(`${host}/env`, params);
};

const deleteEnvironmentItem = (id: number): AxiosPromise => {
  return fetch.delete(`${host}/env/${id}`);
};

const updateEnvironmentItem = (params: any): AxiosPromise => {
  return fetch.put(`${host}/env`, params);
};

export default {
  getEnvironmentList,
  addEnvironmentItem,
  deleteEnvironmentItem,
  updateEnvironmentItem,
};
