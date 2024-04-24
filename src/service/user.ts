import API from '@/api/apis';

class UserService {
  public static getUserService(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private static instance: UserService;

  /**
   * 获取全部用户，需要根据id添加key属性，以供antd-table使用
   */
  public async getUserList(params: any) {
    try {
      const userResponse = await API.getUserList(params);
      if (userResponse.data) {
        return userResponse.data as IUser[];
      } else {
        throw new Error(userResponse.data.message);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   *  从mis-ldap-service 服务获得所有用户信息，存与前端，供查询调度使用
   */

  public async getUserInfoV1(params: any) {
    try {
      const userResponse = await API.getUserInfoV1(params);
      if (userResponse.data) {
        return userResponse.data as IUserV1[];
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async getUserInfoV2(params: any) {
    try {
      const userResponse = await API.getUserInfoV2(params);
      if (userResponse.data) {
        return userResponse.data as IUserV2[];
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export default UserService;
