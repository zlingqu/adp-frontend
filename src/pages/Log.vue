<template>
  <div class="adp-management">
    <div class="adp-management-operation">
      <a-input-search class="adp-management-operation-filter" placeholder="请输入" enterButton @search="onSearch"></a-input-search>
      <div class="adp-management-counter">
        共
        <span class="adp-management-counter-num">{{ logList.length }}</span>
        条日志
      </div>
    </div>

    <div class="adp-management-list">
      <a-table
        class="adp-management-table"
        :columns="tableColumns"
        :dataSource="logList"
        :pagination="{
          showSizeChanger: true,
          showQuickJumper: true,
        }"
      >
      </a-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Button, Icon, Input, Form, Modal, Select, Table } from 'ant-design-vue';
import moment from 'moment';
import EnvironmentService from '@/service/environment';

const environmentService = EnvironmentService.getEnvironmentService();

@Component({
  components: {
    AButton: Button,
    AIcon: Icon,
    AInput: Input,
    AInputSearch: Input.Search,
    ATable: Table,
  },
})
export default class AdpEnvironmentManagement extends Vue {
  private moment: any = moment;
  private logList: any = []; // TODO add interface
  private tableColumns: IAntTableColumn[] = [
    {
      title: '日志类型',
      dataIndex: 'type',
      key: 'type',
      width: '20%',
    },
    {
      title: '操作人',
      dataIndex: 'user',
      key: 'user',
      width: '20%',
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '20%',
    },
    {
      title: '详情',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
    },
  ];

  private fetchData() {
    this.fetchLogList();
  }

  private fetchLogList() {
    // TODO log api
    this.logList = [{ type: '登录', user: 'zuosheng', createdAt: '2019-07-29 01:05:33', description: '登录', key: '1' }];
  }

  private onSearch(text) {
    // TODO search api
    console.log('search', text);
  }

  private created() {
    this.fetchData();
  }
}
</script>
