<template>
  <div class="adp-management">
    <div class="adp-management-operation">
      <a-input-search
        class="adp-management-operation-filter"
        placeholder="请输入"
        v-focus="true"
        enterButton
        v-model="inputSearch"
        @search="onSearch"
      ></a-input-search>
      <a-button type="primary" icon="plus" @click="openAddSpaceModal">添加</a-button>
      <div class="adp-management-counter">
        共
        <span class="adp-management-counter-num">{{ totalCount }}</span>
        个空间
      </div>
    </div>

    <div class="adp-management-list">
      <a-table
        class="adp-management-table"
        :columns="tableColumns"
        :dataSource="spaceList"
        :rowKey="record => record.id"
        :pagination="paginationConfig"
        @change="onPageChange"
        :scroll="{ x: 1744, y: 'calc(100vh)' }"
        bordered
      >
        <div class="time" slot="create_date" slot-scope="create_date">{{ create_date }}</div>

        <div class="adp-management-table-operation" slot="operation" slot-scope="text, record">
          <span class="adp-management-table-operation-item" @click="handleDelete(record)">删除</span>
          <span class="adp-management-table-operation-item" @click="handleEdit(record)">编辑</span>
        </div>
      </a-table>
    </div>

    <a-modal
      title="新增空间"
      :maskClosable="false"
      :visible="addModalVisible"
      @ok="addSpace"
      :confirmLoading="confirmLoading"
      @cancel="handleCancel"
      width="50%"
    >
      <a-form :form="form" ref="addSpaceForm">
        <a-form-item label="空间名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入空间名称!' }] }]" />
        </a-form-item>
        <a-form-item label="所属人" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-select
            v-decorator="['owner', { rules: [{ required: true, message: '请选择空间所属人!' }] }]"
            showSearch
            optionFilterProp="children"
            :filterOption="false"
            placeholder="请输入"
            @search="value => handleSelectSearch(value)"
          >
            <a-select-option v-for="user in userList" :key="user.key" :value="user.key">{{ user.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-passwd-check></a-passwd-check>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Getter, Action, Mutation, namespace } from 'vuex-class';
import { Button, Icon, Input, Form, Modal, Select, Table, message } from 'ant-design-vue';
import moment from 'moment';
import SpaceService from '@/service/space';
import UserService from '@/service/user';
import PasswdCheck from '@/components/Passwd.vue';
import { sleep } from '@/const';

const passwdModule = namespace('Passwd');
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
    APasswdCheck: PasswdCheck,
  },
})
export default class AdpSpaceManagement extends Vue {
  @passwdModule.Getter('show') private deleteModalVisible!: boolean;
  @passwdModule.Getter('res') private resPasswd!: boolean;
  @passwdModule.Action('UPDATE_STATE_ASYN') private updatePasswdStatus;
  // 分页相关
  paginationConfig!: any; // 表单分页器的配置项
  totalCount: number = 0; // 总条目
  size: number = 15; // 每页条目数
  page: number = 1; // 当前页码
  isSpinning: boolean = false;
  editId: number = 0;
  postData: any = {};
  userPostData: any = {};
  timeout: any = null;
  inputSearch = '';
  searchTimeOut: any = null;

  private moment: any = moment;
  private spaceList: ISpace[] = [];
  private userList: IUser[] = [];
  private tableColumns: IAntTableColumn[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '空间名',
      dataIndex: 'name',
      key: 'name',
      width: 300,
    },
    {
      title: '空间所属人',
      dataIndex: 'owner',
      key: 'owner',
      width: 140,
      sorter: (a, b) => a.owner.localeCompare(b.owner),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      slots: { title: 'customCreatedAt' },
      scopedSlots: { customRender: 'created_at' },
    },
    {
      title: '修改时间',
      dataIndex: 'updated_at',
      // key: 'create_at',
      // slots: { title: 'customCreatedAt' },
      // scopedSlots: { customRender: 'create_at' },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 400,
      fixed: 'right',
      scopedSlots: { customRender: 'operation' },
    },
  ];
  private addModalVisible: boolean = false;
  private form: any;
  private confirmLoading: boolean = false;

  private async fetchData() {
    await this.fetchSpaceList();
    // this.fetchUserList();
  }

  @Watch('inputSearch')
  handleInputSearchChange(data: any, or: any) {
    if (this.searchTimeOut) {
      clearTimeout(this.searchTimeOut);
      this.searchTimeOut = null;
    }
    this.searchTimeOut = setTimeout(() => {
      this.onSearch(data);
    }, 300);
  }

  private async fetchSpaceList() {
    this.isSpinning = true;
    try {
      let res: any = await spaceService.getSpaceList({
        ...this.postData,
        page: this.page,
        size: this.size,
      });
      console.log(res);
      this.spaceList = res.data;
      this.totalCount = res.count;
      this.paginationConfig.total = this.totalCount;
      console.log(this.paginationConfig);
      this.paginationConfig = JSON.parse(JSON.stringify(this.paginationConfig));
      this.isSpinning = false;
      this.$forceUpdate();
      return res;
    } catch (error) {
      console.error(error);
    }
  }
  async searchUserCandidate(value: any) {
    let res: any = await userService.getUserList({
      name: value,
    });
    console.log(res);
    this.userList = res.map((item: any) => {
      let newItem = JSON.parse(JSON.stringify(item));
      newItem.owner = item.username;
      newItem.key = item.username;
      newItem.label = item.name;
      return newItem;
    });
    console.log(this.userList);
    this.$nextTick(() => this.$forceUpdate());
  }
  handleSelectSearch(value: any) {
    console.log(value);
    this.userList = [];
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(() => {
      this.searchUserCandidate(value);
    }, 300);
  }

  private handleEdit(record) {
    this.addModalVisible = true;
    this.editId = record.id;
    this.$nextTick(() => {
      this.form.setFieldsValue({ name: record.name, owner: record.owner });
    });
  }

  async deleteOneItem(record) {
    try {
      await spaceService.deleteSpaceItem(record.id);
      return this.fetchSpaceList();
    } catch (err) {
      console.log(err);
      message.error(err.message);
    }
  }

  private async handleDelete(record) {
    this.updatePasswdStatus({ show: true, res: false });
    await sleep(100);
    while (this.deleteModalVisible) {
      await sleep(200);
      console.log('deleteModalVisible is true');
    }
    if (!this.resPasswd) return;
    try {
      let res: any = await this.deleteOneItem(record);
    } catch (err) {
      console.log(err);
      message.error(String(err));
    }
  }

  private onSearch(text) {
    if (this.searchTimeOut) {
      // 防止计时器重复
      clearTimeout(this.searchTimeOut);
      this.searchTimeOut = null;
    }
    // TODO search api
    console.log('search', text);
    this.postData = {
      name: text,
    };
    this.page = 1;
    this.fetchSpaceList();
  }

  private openAddSpaceModal() {
    this.addModalVisible = true;
  }

  private handleCancel() {
    this.addModalVisible = false;
    this.form.resetFields();
  }

  private addSpace() {
    this.confirmLoading = true;
    this.form.validateFields(async err => {
      if (!err) {
        console.log('success', this.form.getFieldsValue());
        try {
          if (this.editId) {
            await spaceService.updateSpaceItem(this.editId, {
              ...this.form.getFieldsValue(),
            });
            this.editId = 0;
          } else {
            await spaceService.addSpaceItem({
              ...this.form.getFieldsValue(),
              create_date: moment().format('YYYY-MM-DD HH:mm'),
            });
          }
          this.confirmLoading = false;
          this.handleCancel();
          return this.fetchSpaceList();
        } catch (err) {
          this.editId = 0;
          this.confirmLoading = false;
          console.log(err);
          message.error(err.message);
          this.handleCancel();
        }
      }
      this.confirmLoading = false;
    });
  }

  private findOwner(input, option) {
    return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) > -1;
  }

  onPageChange(data: any) {
    console.log(data);
    this.page = data.current;
    this.paginationConfig.current = this.page;
    this.fetchSpaceList();
  }

  created() {
    // 初始化分页器
    this.paginationConfig = {
      showTotal: (total: any) => `共 ${total} 个空间`,
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
    console.log(this.form);
  }

  private beforeCreate() {
    this.form = this.$form.createForm(this);
  }
}
</script>
