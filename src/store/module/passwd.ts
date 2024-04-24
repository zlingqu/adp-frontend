// import { IndexState } from '@/types/views/index.interface'
import { GetterTree, MutationTree, ActionTree } from 'vuex';
// import * as IndexApi from '@/api/index'

// 使用userAction 来标注用户按了 确认还是取消按钮。
const state: Passwd = {
  passwd: '147258',
  res: false,
  show: false,
  userAction: 'no',
};

// 强制使用getter获取state
const getters: GetterTree<Passwd, any> = {
  passwd: (state: Passwd) => state.passwd,
  show: (state: Passwd) => state.show,
  res: (state: Passwd) => state.res,
  userAction: (state: Passwd) => state.userAction,
};

// 更改state
const mutations: MutationTree<Passwd> = {
  // 更新state都用该方法
  UPDATE_STATE(state: Passwd, data: Passwd) {
    for (const key in data) {
      if (!data.hasOwnProperty(key)) {
        return;
      }
      state[key] = data[key];
    }
  },
};

const actions: ActionTree<Passwd, any> = {
  UPDATE_STATE_ASYN({ commit }, data: Passwd) {
    commit('UPDATE_STATE', data);
  },

  //   GET_DATA_ASYN() {
  //     IndexApi.getData()
  //   }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
