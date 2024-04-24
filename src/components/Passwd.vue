<template>
  <div class="adp-passwd">
    <a-modal
      title="操作校验"
      :maskClosable="false"
      :visible="deleteModalVisible"
      @ok="confirmHandle"
      :confirmLoading="confirmLoading"
      @cancel="cancelHandle"
      width="700px"
      :bodyStyle="{ padding: '0' }"
    >
      <a-form :form="deleteForm">
        <a-form-item label="校验密码：" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
          <a-input-password
            v-decorator="['delete_password', { rules: [{ required: true, message: '请输入校验密码' }, { validator: passrdValidator }] }]"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Getter, Action, Mutation, namespace } from 'vuex-class';
import { Button, Icon, Input, Form, Modal, Select, Switch, Table, message } from 'ant-design-vue';

const passwdModule = namespace('Passwd');

@Component({
  components: {
    AButton: Button,
    AIcon: Icon,
    AInputPassword: Input.Password,
    AInputSearch: Input.Search,
    AForm: Form,
    AFormItem: Form.Item,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASwitch: Switch,
    ATable: Table,
    ATextarea: Input.TextArea,
  },
})
export default class PasswdCheck extends Vue {
  @passwdModule.Getter('passwd') private passwd!: string;
  @passwdModule.Getter('show') private deleteModalVisible!: boolean;
  @passwdModule.Getter('userAction') private userAction!: string;
  @passwdModule.Action('UPDATE_STATE_ASYN') private updatePasswdStatus;
  // @Prop({ default: '198538', type: Boolean }) passwd!: string;
  private deleteForm: any;
  private confirmLoading: boolean = false;
  private beforeCreate() {
    this.deleteForm = this.$form.createForm(this);
  }

  private confirmHandle() {
    this.deleteForm.validateFields(async err => {
      if (!err) {
        this.confirmLoading = false;
        this.updatePasswdStatus({ show: false, res: true, userAction: 'yes' });
        this.deleteForm.resetFields();
      }
      this.confirmLoading = false;
    });
  }

  private cancelHandle() {
    this.updatePasswdStatus({ show: false, res: false, userAction: 'no' });
    this.deleteForm.resetFields();
  }

  passrdValidator(r, v, cb) {
    console.log(v);
    if (!v) {
      cb(false);
    } else {
      console.log(typeof v);
      console.log(v == this.passwd);
      if (v == this.passwd) {
        cb();
      } else {
        cb('密码校验错误，无法操作，请找管理员！');
      }
    }
  }

  private created() {
    console.log(this.passwd);
    console.log(this.deleteModalVisible);
  }
}
</script>
