import API from '@/api/apis';

class SpaceService {
  public static getSpaceService(): SpaceService {
    if (!SpaceService.instance) {
      SpaceService.instance = new SpaceService();
    }
    return SpaceService.instance;
  }

  private static instance: SpaceService;

  /**
   * 获取全部空间，需要根据id添加key属性，以供antd-table使用
   */
  public async getSpaceList(params: any) {
    try {
      const spaceResponse = await API.getSpaceList(params);
      if (spaceResponse.data) {
        return spaceResponse.data as ISpace[];
      } else {
        throw new Error(spaceResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
  /**
   * 新增空间
   */
  public async addSpaceItem(params: any) {
    try {
      const spaceResponse = await API.addSpaceItem(params);
      if (spaceResponse.data) {
        return spaceResponse.data as ISpace[];
      } else {
        throw new Error(spaceResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
  /**
   * 删除空间
   */
  public async deleteSpaceItem(id: number) {
    try {
      const spaceResponse = await API.deleteSpaceItem(id);
      if (spaceResponse.data) {
        return spaceResponse.data as ISpace[];
      } else {
        throw new Error(spaceResponse.data.mes);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
  /**
   * 更新空间
   */
  public async updateSpaceItem(id: number, params: any) {
    try {
      const spaceResponse = await API.updateSpaceItem(id, params);
      if (spaceResponse.data) {
        return spaceResponse.data as ISpace[];
      } else {
        throw new Error(spaceResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export default SpaceService;
