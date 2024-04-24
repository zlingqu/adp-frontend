import API from '@/api/apis';

class DeploymentService {
  public static getDeploymentService(): DeploymentService {
    if (!DeploymentService.instance) {
      DeploymentService.instance = new DeploymentService();
    }
    return DeploymentService.instance;
  }

  private static instance: DeploymentService;

  /**
   * 获取全部环境，需要根据id添加key属性，以供antd-table使用
   */
  public async getDeploymentList(params: any) {
    try {
      const deploymentResponse = await API.getDeploymentList(params);
      if (deploymentResponse.data.code === 0) {
        return deploymentResponse.data as IDeployment[];
      } else {
        throw new Error(deploymentResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async getDeploy(params: any) {
    try {
      const deploymentResponse = await API.getDeploy(params);
      if (deploymentResponse.data.code === 0) {
        return deploymentResponse.data as IDeployment[];
      } else {
        throw new Error(deploymentResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 新增部署
   */
  public async addDeploymentItem(params: any) {
    try {
      const deploymentResponse = await API.addDeploymentItem(params);
      if (deploymentResponse.data) {
        return deploymentResponse.data as IDeployment[];
      } else {
        throw new Error(deploymentResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 批量构建
   */
  public async multiDeploy(params: any) {
    try {
      const deploymentResponse = await API.multiDeploy(params);
      if (deploymentResponse.data) {
        return deploymentResponse.data as IDeployment[];
      } else {
        throw new Error(deploymentResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 删除部署
   */
  public async deleteDeploymentItem(id: any) {
    try {
      const deploymentResponse = await API.deleteDeploymentItem(id);
      if (deploymentResponse.data) {
        return deploymentResponse.data as IDeployment[];
      } else {
        throw new Error(deploymentResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * 修改部署
   */
  public async updateDeploymentItem(id: any, params: any) {
    try {
      const deploymentResponse = await API.updateDeploymentItem(id, params);
      if (deploymentResponse.data) {
        return deploymentResponse.data as IDeployment[];
      } else {
        throw new Error(deploymentResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
  /**
   * 获取全部环境，需要根据id添加key属性，以供antd-table使用
   */
  public async itemOnline(params: any) {
    try {
      const deploymentResponse = await API.itemOnline(params);
      if (deploymentResponse.data.code === 0) {
        return deploymentResponse.data as any;
      } else {
        throw new Error(deploymentResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
  public async copyDeploymentItem(id: any) {
    try {
      const deploymentResponse = await API.copyDeploymentItem(id);
      if (deploymentResponse.data) {
        return deploymentResponse.data as any;
      } else {
        throw new Error(deploymentResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export default DeploymentService;
