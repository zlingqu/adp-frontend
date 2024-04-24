import { AxiosPromise } from 'axios';
import fetch from '@/api/fetch';
import qs from 'qs';

const version = '/v1';
// const host = (window as IWindow).config.server.host + '/api' + version;
const host = '/api' + version;

const getDeploymentList = (params: any): AxiosPromise => {
  return fetch.post(`${host}/deployments/list`, params);
};

const getDeploy = (params: any): AxiosPromise => {
  return fetch.get(`/api/v2/deploy`, { params: params });
};

const addDeploymentItem = (params: any): AxiosPromise => {
  return fetch.post(`${host}/deployments/create`, params);
};

const multiDeploy = (params: any): AxiosPromise => {
  return fetch.post(`${host}/deploy/onlines`, params);
};

const deleteDeploymentItem = (id: any): AxiosPromise => {
  return fetch.delete(`${host}/deploy/${id}`);
};
const copyDeploymentItem = (id: any): AxiosPromise => {
  return fetch.get(`${host}/deployments/copy/${id}`);
};

const updateDeploymentItem = (id: any, params: any): AxiosPromise => {
  return fetch.post(`${host}/deployments/update`, {
    ...params,
    id: id,
  });
};

const itemOnline = (params: any): AxiosPromise => {
  return fetch.get(`${host}/deploy/online/${params}`);
};
export default {
  getDeploymentList,
  getDeploy,
  multiDeploy,
  addDeploymentItem,
  deleteDeploymentItem,
  updateDeploymentItem,
  itemOnline,
  copyDeploymentItem,
};
