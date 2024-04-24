<template>
  <div class="adp-management">
    <div class="adp-management-operation">
      <a-input-search
        class="adp-management-operation-filter"
        placeholder="请输入"
        enterButton
        v-model="inputSearch"
        v-focus="true"
        @search="onSearch"
      ></a-input-search>
      <a-button type="primary" icon="plus" @click="openAddEnvironmentModal">添加</a-button>
      <div class="adp-management-counter">
        共
        <span class="adp-management-counter-num">{{ totalCount }}</span>
        个环境
      </div>
    </div>

    <div class="adp-management-list">
      <a-table
        class="adp-management-table"
        :columns="tableColumns"
        :dataSource="environmentList"
        :rowKey="record => record.id"
        :pagination="paginationConfig"
        @change="onPageChange"
        :scroll="{ x: 1744, y: 'calc(100vh)' }"
        bordered
      >
        <span class="adp-management-table-operation-item" slot="status" slot-scope="status">
          {{ status == 'start' ? '在线环境' : '离线环境' }}
        </span>
        <div class="adp-management-table-operation" slot="operation" slot-scope="text, record">
          <!-- <span class="adp-management-table-operation-item" v-if="record.status === `start`" @click="handleDeactivate(record)">停用</span> -->
          <!-- <span class="adp-management-table-operation-item" v-else @click="handleActivate(record)">启用</span> -->
          <span class="adp-management-table-operation-item" @click="handleEdit(record)">编辑</span>
          <span class="adp-management-table-operation-item" @click="handleDelete(record)">删除</span>
        </div>
      </a-table>
    </div>

    <a-modal
      title="新增环境"
      :maskClosable="false"
      :visible="addModalVisible"
      @ok="addEnvironment"
      :confirmLoading="confirmLoading"
      @cancel="handleCancel"
      width="50%"
    >
      <a-form :form="form">
        <a-form-item label="环境名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入环境名称!' }] }]" />
        </a-form-item>
        <a-form-item label="环境状态" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-radio-group 
            v-decorator="['status', { rules: [{required: true}]}]"
            default-value="start"
            
          >
            <a-radio value="start">
              在线环境
            </a-radio>
            <a-radio value="stop">
              离线环境
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="GPU类型(卡的使用方式)" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-checkbox-group 
            v-decorator="['gpu_type_by_card', { rules: [{required: true}]}]"
            option.initialValue=""
            :options="gpuTypeCardList"
            @change="changeGpuTypeCardState"
          >
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="GPU类型(显存的使用方式)" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
          <a-checkbox-group 
            v-decorator="['gpu_type_by_mem', { rules: [{required: true}] }]"
            option.initialValue=""
            :options="gpuTypeMemList"
            @change="changeGpuTypeMemState"
          >
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-passwd-check></a-passwd-check>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Getter, Action, Mutation, namespace } from 'vuex-class';
import { Button, Icon, Input, Form, Modal, Select, Table, message, Radio, Col, Row, Checkbox } from 'ant-design-vue';
import moment from 'moment';
import EnvironmentService from '@/service/environment';
import PasswdCheck from '@/components/Passwd.vue';
import { sleep } from '@/const';

const passwdModule = namespace('Passwd');
const environmentService = EnvironmentService.getEnvironmentService();

@Component({
  components: {
    AButton: Button,
    ARadioGroup: Radio.Group,
    ACol: Col,
    ARow: Row,
    ACheckbox: Checkbox,
    ACheckboxGroup: Checkbox.Group,
    ARadio: Radio,
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
export default class AdpEnvironmentManagement extends Vue {
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
  inputSearch = '';
  searchTimeOut: any = null;
  

  private gpuTypeCardList: any =[
    {label:"没有gpu卡" ,value: "该环境没有gpu卡" },
    {label:"Nvidia 1080Ti" ,value: "nvidia_1080ti", disabled: false},
    {label:"Nvidia 2080Ti" ,value: "nvidia_2080ti", disabled: false },
    {label:"Nvidia Tesla T4" ,value: "nvidia_tesla_t4", disabled: false},
    {label:"Nvidia TITAN V" ,value: "nvidia_titan_v", disabled: false },
    {label:"Nvidia 3090" ,value: "nvidia_3090", disabled: false },

  ];
  private gpuTypeMemList: any =[
    {label:"没有gpu卡" ,value: "该环境没有gpu卡" },
    {label:"Nvidia 1080Ti" ,value: "nvidia_1080ti", disabled: false},
    {label:"Nvidia 2080Ti" ,value: "nvidia_2080ti", disabled: false },
    {label:"Nvidia Tesla T4" ,value: "nvidia_tesla_t4", disabled: false},
    {label:"Nvidia TITAN V" ,value: "nvidia_titan_v", disabled: false },
    {label:"Nvidia 3090" ,value: "nvidia_3090", disabled: false },
  ];
  private async changeGpuTypeCardState(checkedValues){
    console.log(checkedValues)
    if(checkedValues.includes("该环境没有gpu卡")){
        for(var i=1;i<this.gpuTypeCardList.length;i++){
            this.gpuTypeCardList[i].disabled = true
        }
    }else{
      for(var i=1;i<this.gpuTypeCardList.length;i++){
          this.gpuTypeCardList[i].disabled = false
      }
    }
  }
  private async changeGpuTypeMemState(checkedValues){
    console.log(checkedValues)
    if(checkedValues.includes("该环境没有gpu卡")){
        for(var i=1;i<this.gpuTypeMemList.length;i++){
            this.gpuTypeMemList[i].disabled = true
        }
    }else{
      for(var i=1;i<this.gpuTypeMemList.length;i++){
          this.gpuTypeMemList[i].disabled = false
      }
    }
  }
  private moment: any = moment;
  private environmentList: any = [];
  private tableColumns: IAntTableColumn[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '环境名',
      dataIndex: 'name',
      key: 'name',
      width: 300,
    },
    {
      title: 'GPU类型(卡的使用方式)',
      dataIndex: 'gpu_type_by_card',
      key: 'gpu_type_by_card',
      width: 300,
    },
    {
      title: 'GPU类型(显存的使用方式)',
      dataIndex: 'gpu_type_by_mem',
      key: 'gpu_type_by_mem',
      width: 300,
    },
    {
      title: '环境状态',
      dataIndex: 'status',
      scopedSlots: { customRender: 'status' },
      // key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at'
    },
    {
      title: '修改时间',
      dataIndex: 'updated_at'
    },
    {
      title: '操作',
      dataIndex: 'operation',
      // key: 'operation',
      width: 400,
      fixed: 'right',
      scopedSlots: { customRender: 'operation' },
    },
  ];
  private addModalVisible: boolean = false;
  private form: any;
  private confirmLoading: boolean = false;

  private fetchData() {
    this.fetchEnvironmentList();
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

  onPageChange(data: any) {
    console.log(data);
    this.page = data.current;
    this.paginationConfig.current = this.page;
    this.fetchEnvironmentList();
  }

  private async fetchEnvironmentList() {
    this.isSpinning = true;
    try {
      let res: any = await environmentService.getEnvironmentList({
        ...this.postData,
        page: this.page,
        size: this.size,
      });
      console.log(res);
      this.environmentList = res.data;
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

  private handleEdit(record) {
    this.addModalVisible = true;
    this.editId = record.id;
    console.log(this.editId);
    this.$nextTick(() => {
      this.form.setFieldsValue(
        { 
          name: record.name, 
          status: record.status,
          gpu_type_by_mem:  record.gpu_type_by_mem.split(','),
          gpu_type_by_card: record.gpu_type_by_card.split(','),
        }
      );
      this.changeGpuTypeMemState(this.form.getFieldValue('gpu_type_by_mem')) //动作和选择gpuType相同
      this.changeGpuTypeCardState(this.form.getFieldValue('gpu_type_by_card')) //动作和选择gpuType相同
    });
  }

  async deleteOneItem(record) {
    try {
      await environmentService.deleteEnvironmentItem(record.id);
      return this.fetchEnvironmentList();
    } catch (err) {
      console.log(err);
      message.error(String(err));
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

  async changeStatus(record, status) {
    try {
      await environmentService.updateEnvironmentItem({
        status: status,
        id: record.id,
      });
      record.status = status;
    } catch (err) {
      console.log(err);
      message.error(err.message);
    }
  }

  private async handleDeactivate(record) {
    // TODO delete api
    console.log('停用', record);
    this.changeStatus(record, 'stop');
  }

  private async handleActivate(record) {
    console.log('启用', record);
    this.changeStatus(record, 'start');
  }

  private async onSearch(text) {
    if (this.searchTimeOut) {
      // 防止计时器重复
      clearTimeout(this.searchTimeOut);
      this.searchTimeOut = null;
    }
    // TODO search api
    console.log('search', text);
    this.postData.name = text;
    this.page = 1;
    await this.fetchEnvironmentList();
    this.postData = {};
  }

  private openAddEnvironmentModal() {
    this.addModalVisible = true;
  }

  private handleCancel() {
    this.addModalVisible = false;
    this.form.resetFields();
  }

  private addEnvironment() {
    this.confirmLoading = true;
    this.form.validateFields(async err => {
      if (!err) {
        console.log('success', this.form.getFieldsValue());
        try {
          if(this.form.getFieldValue('gpu_type_by_mem').includes("该环境没有gpu卡")){
              this.form.setFieldsValue(
                {
                'gpu_type_by_mem': ["该环境没有gpu卡"],
                }
              )
          }
          if(this.form.getFieldValue('gpu_type_by_card').includes("该环境没有gpu卡")){
              this.form.setFieldsValue(
                {
                'gpu_type_by_card': ["该环境没有gpu卡"],
                }
              )
          }
          this.form.setFieldsValue( //数组转换为字符串
            {
              gpu_type_by_mem: this.form.getFieldValue('gpu_type_by_mem').toString(),
            }
          );

          this.form.setFieldsValue( //数组转换为字符串
            {
              gpu_type_by_card: this.form.getFieldValue('gpu_type_by_card').toString(),
            }
          );

          
          if (this.editId) {
            await environmentService.updateEnvironmentItem({
              ...this.form.getFieldsValue(),
              id: this.editId,
            });
            this.editId = 0;
          } else {
            await environmentService.addEnvironmentItem(this.form.getFieldsValue());
          }
          this.confirmLoading = false;
          this.handleCancel();
          return this.fetchEnvironmentList();
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
