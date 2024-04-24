import API from '@/api/apis';

class EnvironmentService {
  public static getEnvironmentService(): EnvironmentService {
    if (!EnvironmentService.instance) {
      EnvironmentService.instance = new EnvironmentService();
    }
    return EnvironmentService.instance;
  }

  private static instance: EnvironmentService;

  /**
   * 获取全部环境，需要根据id添加key属性，以供antd-table使用
   */
  public async getEnvironmentList(params: any) {
    try {
      const environmentResponse = await API.getEnvironmentList(params);
      if (environmentResponse.data) {
        return environmentResponse.data as IEnvironment[];
      } else {
        throw new Error(environmentResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
  /**
   * 新建环境
   */
  public async addEnvironmentItem(params: any) {
    try {
      const environmentResponse = await API.addEnvironmentItem(params);
      if (environmentResponse.data) {
        return environmentResponse.data as IEnvironment[];
      } else {
        throw new Error(environmentResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
  /**
   * 删除环境
   */
  public async deleteEnvironmentItem(id: number) {
    try {
      const environmentResponse = await API.deleteEnvironmentItem(id);
      if (environmentResponse.data) {
        return environmentResponse.data as IEnvironment[];
      } else {
        throw new Error(environmentResponse.data.msg);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
  /**
   * 更新环境
   */
  public async updateEnvironmentItem(params: any) {
    try {
      const environmentResponse = await API.updateEnvironmentItem(params);
      if (environmentResponse.data) {
        return environmentResponse.data as IEnvironment[];
      } else {
        throw new Error(environmentResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export default EnvironmentService;
