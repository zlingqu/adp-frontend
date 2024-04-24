import API from '@/api/apis';

class ProjectService {
  public static getProjectService(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  private static instance: ProjectService;

  /**
   * 根据project的id，获取project的namespaece，供
   */

  public async getProjectById(id: any) {
    try {
      const projectResponse = await API.getProjectById(id);
      if (projectResponse.data && projectResponse.data.code === 0) {
        return projectResponse.data as IProject;
      } else {
        throw new Error(projectResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 获取全部环境，需要根据id添加key属性，以供antd-table使用
   */
  public async getProjectList(params: any) {
    try {
      const projectResponse = await API.getProjectList(params);
      if (projectResponse.data && projectResponse.data.code === 0) {
        return projectResponse.data as IProject[];
      } else {
        throw new Error(projectResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async getProjectIdNameList(params: any) {
    try {
      const projectResponse = await API.getProjectIdNameList(params);
      if (projectResponse.data && projectResponse.data.code === 0) {
        return projectResponse.data as IProjectV1[];
      } else {
        throw new Error(projectResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async getProjectV2IdNameGitLangProductList(params: any) {
    try {
      const projectResponse = await API.getProjectV2IdNameGitLangProductList(params);
      if (projectResponse.data && projectResponse.data.code === 0) {
        return projectResponse.data as IProjectV2[];
      } else {
        throw new Error(projectResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 获取全部环境，需要根据id添加key属性，以供antd-table使用
   */
  public async getProject(params: any) {
    try {
      const projectResponse = await API.getProject(params);
      if (projectResponse.data && projectResponse.data.code === 0) {
        return projectResponse.data as IProject[];
      } else {
        throw new Error(projectResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 新增部署
   */
  public async addProjectItem(params: any) {
    try {
      const projectResponse = await API.addProjectItem(params);
      if (projectResponse.data && projectResponse.data.code === 0) {
        return projectResponse.data as IProject[];
      } else {
        throw new Error(projectResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 删除部署
   */
  public async deleteProjectItem(id: any) {
    try {
      const projectResponse = await API.deleteProjectItem(id);
      if (projectResponse.data && projectResponse.data.code === 0) {
        return projectResponse.data as IProject[];
      } else {
        throw new Error(projectResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 修改部署
   */
  public async updateProjectItem(params: any) {
    try {
      const projectResponse = await API.updateProjectItem(params);
      if (projectResponse.data && projectResponse.data.code === 0) {
        return projectResponse.data as IProject[];
      } else {
        throw new Error(projectResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 通过后台的服务，查询项目的分支信息
   */
  public async getProjectBranches(params: any) {
    try {
      const projectResponse = await API.getGitlabBranches(params);
      if (projectResponse.data && projectResponse.data.code === 0) {
        return projectResponse.data as IProject[];
      } else {
        throw new Error(projectResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 获取gitlab项目列表
   */
  public async getGitlabProjects(params: any) {
    try {
      const projectResponse = await API.getGitlabProjects(params);
      if (projectResponse.data && projectResponse.data.code === 0) {
        return projectResponse.data as IProject[];
      } else {
        throw new Error(projectResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 获取gitlab项目明显
   */
  public async getGitlabProject(params: any) {
    try {
      const projectResponse = await API.getGitlabProject(params);
      return projectResponse.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 获取gitlab项目明显
   */
  public async getGitlabProjectTags(params: any) {
    try {
      const projectResponse = await API.getGitlabProjectTags(params);
      if (projectResponse.data && projectResponse.data.code === 0) {
        return projectResponse.data;
      } else {
        throw new Error(projectResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }


}

export default ProjectService;
