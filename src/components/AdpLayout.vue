<template>
  <a-layout class="adp-sider">
    <a-layout-sider :trigger="null" collapsible v-model="collapsed">
      <img class="logo" :src="collapsed ? thinLogo : fatLogo" :class="collapsed ? `` : `fat-logo`" />
      <a-menu theme="dark" mode="inline" :defaultSelectedKeys="[defaultRouterKey]">
        <a-menu-item v-for="layoutItem in menuItems" :key="layoutItem.key" @click="handleJumpto(layoutItem.key)">
          <a-icon :type="layoutItem.icon" />
          <span>{{ layoutItem.name }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="adp-layout-header">
        <a-icon class="trigger" :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="() => (collapsed = !collapsed)" />
        <a-dropdown class="adp-layout-header-username">
          <span>
            <a-avatar icon="user"></a-avatar>
            <span>{{ username }}</span>
          </span>
          <a-menu slot="overlay">
            <a-menu-item @click="handleLogout">
              <a-icon type="logout"></a-icon>
              退出登录
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-layout-header>
      <a-layout-content :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }">
        <slot name="content"></slot>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Avatar, Dropdown, Icon, Layout, Menu } from 'ant-design-vue';
import LayoutMenu from '@/const/LayoutMenu';

declare var require: any;
const THINLOGO = require('@/assets/images/thin-logo.png');
const FATLOGO = require('@/assets/images/fat-logo.png');
@Component({
  components: {
    AAvatar: Avatar,
    ADropdown: Dropdown,
    AIcon: Icon,
    ALayout: Layout,
    ALayoutContent: Layout.Content,
    ALayoutHeader: Layout.Header,
    ALayoutSider: Layout.Sider,
    AMenu: Menu,
    AMenuItem: Menu.Item,
  },
})
export default class AdpLayout extends Vue {
  private collapsed: boolean = false;
  private menuItems: IMenuItem[] = LayoutMenu;
  private thinLogo: any = THINLOGO;
  private fatLogo: any = FATLOGO;
  private username: string = '用户名';

  private handleJumpto(key) {
    this.$router.push(key);
  }

  private handleLogout() {
    // TODO
    this.$router.push('login');
  }

  get defaultRouterKey() {
    return this.$route.name;
  }
}
</script>
