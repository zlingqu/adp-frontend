import { AxiosPromise } from 'axios';
import fetch from '@/api/fetch';

const version = '/v1';
// const host = (window as IWindow).config.server.host + '/api' + version;
const host = '/api' + version;

const getProjectList = (params: any): AxiosPromise => {
  return fetch.get(`${host}/project`, { params: params });
};

const getProjectIdNameList = (params: any): AxiosPromise => {
  return fetch.get(`/api/v2/project-id-name`, { params: params });
};

const getProjectV2IdNameGitLangProductList = (params: any): AxiosPromise => {
  return fetch.get(`/api/v2/project-id-name-git-lang-product`, { params: params });
};

const getProject = (params: any): AxiosPromise => {
  return fetch.get(`/api/v2/project`, { params: params });
};

const addProjectItem = (params: any): AxiosPromise => {
  return fetch.post(`${host}/project`, params);
};

const deleteProjectItem = (id: any): AxiosPromise => {
  return fetch.delete(`${host}/project/${id}`);
};

const updateProjectItem = (params: any): AxiosPromise => {
  return fetch.put(`${host}/project`, params);
};

const getProjectById = (id: any): AxiosPromise => {
  return fetch.get(`${host}/project/${id}`);
};

const getGitlabBranches = (params: any): AxiosPromise => {
  return fetch.get(`${host}/gitlab/branchs`, { params: params });
};

const getGitlabProjects = (params: any): AxiosPromise => {
  return fetch.get(`${host}/gitlab/projects`, { params: params });
};

const getGitlabProject = (params: any): AxiosPromise => {
  return fetch.get(`${host}/gitlab/project`, { params: params });
};

const getGitlabProjectTags = (params: any): AxiosPromise => {
  return fetch.get(`${host}/gitlab/tags`, { params: params });
};

export default {
  getProjectList,
  getProjectIdNameList,
  getProjectV2IdNameGitLangProductList,
  getProject,
  addProjectItem,
  deleteProjectItem,
  updateProjectItem,
  getProjectById,
  getGitlabBranches,
  getGitlabProjects,
  getGitlabProject,
  getGitlabProjectTags
};
