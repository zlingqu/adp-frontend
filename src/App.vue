<template>
  <a-locale-provider :locale="locale">
    <div id="app">
      <adp-layout v-if="!isLogin">
        <router-view slot="content" />
      </adp-layout>
      <router-view v-else />
    </div>
  </a-locale-provider>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { LocaleProvider } from 'ant-design-vue';
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';
import AdpLayout from '@/components/AdpLayout.vue';
@Component({
  components: {
    AdpLayout,
    ALocaleProvider: LocaleProvider,
  },
})
export default class AdpApp extends Vue {
  private isLogin: boolean = true;
  private locale: any = zhCN;

  @Watch('$route')
  onRouteChange(to, from) {
    this.isLogin = to.name === 'login';
  }
}
</script>
