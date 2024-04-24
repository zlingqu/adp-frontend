<template>
  <div class="adp-management">
    <div class="adp-management-operation">
      <a-input-search class="adp-management-operation-filter" placeholder="请输入" enterButton @search="onSearch"></a-input-search>
      <a-button type="primary" icon="plus" @click="openAddUserModal">添加</a-button>
      <div class="adp-management-counter">
        共
        <span class="adp-management-counter-num">{{ userList.length }}</span>
        个用户
      </div>
    </div>

    <div class="adp-management-list">
      <a-table
        class="adp-management-table"
        :columns="tableColumns"
        :dataSource="userList"
        :pagination="{
          showSizeChanger: true,
          showQuickJumper: true,
        }"
      >
        <div class="adp-management-table-operation" slot="operation" slot-scope="text, record">
          <span class="adp-management-table-operation-item" v-if="record.status === `正常`" @click="handleDeactivate(record)">停用</span>
          <span class="adp-management-table-operation-item" v-else @click="handleActivate(record)">启用</span>
          <span class="adp-management-table-operation-item" @click="handleEdit(record)">编辑</span>
        </div>
      </a-table>
    </div>

    <a-modal
      title="新增用户"
      :maskClosable="false"
      :visible="addModalVisible"
      @ok="addUser"
      :confirmLoading="confirmLoading"
      @cancel="handleCancel"
    >
      <a-form :form="form">
        <a-form-item label="用户名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入用户名称!' }] }]" />
        </a-form-item>
        <a-form-item label="用户角色" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-select
            v-decorator="['role', { rules: [{ required: true, message: '请选择用户角色!' }] }]"
            showSearch
            optionFilterProp="children"
            :filterOption="findOwner"
          >
            <a-select-option v-for="role in roleList" :key="role.value" :value="role.value">
              {{ role.value }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所属空间" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-select
            v-decorator="['belongSpaceId', { rules: [{ required: true, message: '请选择所属空间!' }] }]"
            showSearch
            optionFilterProp="children"
            :filterOption="findOwner"
          >
            <a-select-option v-for="space in spaceList" :key="space.id" :value="space.id">
              {{ space.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Button, Icon, Input, Form, Modal, Select, Table } from 'ant-design-vue';
import moment from 'moment';
import roleList from '@/const/roleConst';
import SpaceService from '@/service/space';
import UserService from '@/service/user';

const spaceService = SpaceService.getSpaceService();
const userService = UserService.getUserService();

@Component({
  components: {
    AButton: Button,
    AIcon: Icon,
    AInput: Input,
    AInputSearch: Input.Search,
    AForm: Form,
    AFormItem: Form.Item,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ATable: Table,
  },
})
export default class AdpUserManagement extends Vue {
  // 分页相关
  paginationConfig!: any; // 表单分页器的配置项
  totalCount: number = 0; // 总条目
  size: number = 10; // 每页条目数
  page: number = 1; // 当前页码
  isSpinning: boolean = false;
  editId: number = 0;
  postData: any = {};

  private moment: any = moment;
  private spaceList: ISpace[] = [];
  private userList: IUser[] = [];
  private tableColumns: IAntTableColumn[] = [
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: '20%',
    },
    {
      title: '空间名称',
      dataIndex: 'belongSpace',
      key: 'belongSpace',
      width: '25%',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: '20%',
      scopedSlots: { customRender: 'operation' },
    },
  ];
  private addModalVisible: boolean = false;
  private form: any;
  private confirmLoading: boolean = false;
  private roleList: { value: string }[] = roleList;

  private fetchData() {
    this.fetchSpaceList();
    this.fetchUserList();
  }

  private async fetchSpaceList() {
    try {
      let res: any = await spaceService.getSpaceList({});
      console.log(res);
      this.spaceList = res.data;
    } catch (error) {
      console.error(error);
    }
  }

  private fetchUserList() {
    // TODO real api fetch
    // userService
    //   .getUserList()
    //   .then(success => {
    //     this.userList = success;
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });
  }

  onPageChange(data: any) {
    console.log(data);
    this.page = data.current;
    this.paginationConfig.current = this.page;
    this.fetchUserList();
  }
  private handleEdit(record) {
    this.addModalVisible = true;
    this.$nextTick(() => {
      this.form.setFieldsValue({ name: record.name, role: record.role, belongSpaceId: record.belongSpaceId });
    });
  }

  private handleDeactivate(record) {
    // TODO delete api
    console.log('停用', record);
  }

  private handleActivate(record) {
    // TODO delete api
    console.log('启用', record);
  }

  private onSearch(text) {
    // TODO search api
    console.log('search', text);
  }

  private openAddUserModal() {
    this.addModalVisible = true;
  }

  private handleCancel() {
    this.addModalVisible = false;
    this.form.resetFields();
  }

  private addUser() {
    this.form.validateFields(err => {
      if (!err) {
        console.log('success', this.form.getFieldsValue());
        // TODO add user api
        // post api success cb, do: this.handleCancel();
        // handleCancel(), then fetchUserList again!
      }
    });
  }

  private findOwner(input, option) {
    return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) > -1;
  }

  created() {
    // 初始化分页器
    this.paginationConfig = {
      showTotal: (total: any) => `共 ${total} 个班级`,
      showQuickJumper: true,
      defaultCurrent: 1,
      defaultPageSize: this.size,
      current: this.page,
      class: 'ta-pagination',
      pageSize: this.size,
      hideOnSinglePage: true,
      // pageSize.sync : this.size,
      total: this.totalCount,
      change: this.onPageChange,
      // showSizeChange : true,
    };
  }

  private mounted() {
    this.fetchData();
  }

  private beforeCreate() {
    this.form = this.$form.createForm(this);
  }
}
</script>
