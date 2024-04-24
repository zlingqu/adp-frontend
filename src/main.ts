import Vue from 'vue';
import App from './App.vue';
import router from '@/router';
import store from '@/store';
import directives from '@/utils/directives';

import '@/theme/index.scss'; // 主题下的其他页面、组件样式
import '../config';
import '@/api/mock';

Vue.use(directives);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
