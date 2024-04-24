import { AxiosPromise } from 'axios';
import fetch from '@/api/fetch';

const version = '/v1';
// const host = (window as IWindow).config.server.host + '/api';
const host = '/api' + version;

const getSpaceList = (params: any): AxiosPromise => {
  return fetch.get(`${host}/space`, { params: params });
};
const addSpaceItem = (params: any): AxiosPromise => {
  return fetch.post(`${host}/space`, params);
};
const deleteSpaceItem = (id: number): AxiosPromise => {
  return fetch.delete(`${host}/space/${id}`);
};
const updateSpaceItem = (id: number, params: any): AxiosPromise => {
  return fetch.put(`${host}/space/${id}`, params);
};

export default {
  getSpaceList,
  addSpaceItem,
  deleteSpaceItem,
  updateSpaceItem,
};
