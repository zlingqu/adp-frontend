<template>
  <div class="adp-management">
    <div class="adp-management-operation">
      <a-input-search
        class="adp-management-operation-filter"
        placeholder="模糊搜索：应用名"
        v-focus="true"
        enterButton
        v-model="inputSearch"
        @search="onSearch"
      ></a-input-search>
      <a-button type="primary" icon="plus" @click="openAddProjectModal">添加</a-button>
      <div class="adp-management-counter">
        共
        <span class="adp-management-counter-num">{{ totalCount }}</span>
        个应用
      </div>
    </div>
    <div id="adp-table-search">
      <a-form class="adp-table-search-form" :form="tableSearchForm">
        <a-row :gutter="24" :style="{ display: adpTableSearchFromExpand ? 'block' : 'none' }">
          <a-col :span="8" :style="{ display: 'block' }">
            <a-form-item :label="`产品空间`" :wrapper-col="{ span: 15, offset: 1 }">
              <a-select
                v-decorator="['owned_product', { rules: [{ required: false, message: '请选择服务所属产品空间!' }], initialValue: [] }]"
                mode="tags"
                style="width: 100%"
                :tokenSeparators="[',']"
                @search="value => handleSpaceSearch(value)"
                @change="value => adpTableSearchFromOwnedProductChange(value)"
              >
                <a-select-option v-for="space in spaceList" :key="space.name" :value="space.name">{{ space.name }} </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8" :style="{ display: 'block' }">
            <a-form-item :label="`环境类型`" :wrapper-col="{ span: 15, offset: 1 }">
              <a-select
                v-decorator="['deploy_env_type', { rules: [{ required: false, message: '请选择部署环境类型' }], initialValue: [] }]"
                mode="tags"
                style="width: 100%"
                :tokenSeparators="[',']"
                @change="value => adpTableSearchFromOwnedDeployEnvTypeChange(value)"
              >
                <a-select-option value="gpu">Gpu</a-select-option>
                <a-select-option value="cpu">Cpu</a-select-option>
                <a-select-option value="arm">Arm</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8" :style="{ display: 'block' }">
            <a-form-item :label="`语言类型`" :wrapper-col="{ span: 15, offset: 1 }">
              <a-select
                v-decorator="['language_type', { rules: [{ required: false, message: '请选择语言类型!' }], initialValue: [] }]"
                mode="tags"
                style="width: 100%"
                :tokenSeparators="[',']"
                @change="value => adpTableSearchFromOwnedDeployLanguageTypeChange(value)"
              >
                <a-select-option value="node">Node</a-select-option>
                <a-select-option value="nodets">NodeTs</a-select-option>
                <a-select-option value="js">Js</a-select-option>
                <a-select-option value="golang">Golang</a-select-option>
                <a-select-option value="android">Android</a-select-option>
                <a-select-option value="unity">Unity</a-select-option>
                <a-select-option value="java">Java</a-select-option>
                <a-select-option value="python">Python</a-select-option>
                <a-select-option value="c">C</a-select-option>
                <a-select-option value="c++">C++</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24" :style="{ textAlign: 'right' }">
            <a-button :style="{ marginLeft: '8px' }" @click="adpTableSearchFromHandleReset">
              Clear
            </a-button>
            <a :style="{ marginLeft: '8px', fontSize: '12px' }" @click="adpTableSearchFromToggle">
              Collapse
              <a-icon :type="adpTableSearchFromExpand ? 'up' : 'down'" />
            </a>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="adp-management-list">
      <a-table
        class="adp-management-table"
        :columns="tableColumns"
        :dataSource="projectList"
        :rowKey="record => record.id"
        :pagination="paginationConfig"
        :scroll="{ x: 1744, y: 'calc(100vh)' }"
        @change="onPageChange"
        bordered
      >
        <div class="status" slot="status" slot-scope="status">{{ statusText[status] ? statusText[status] : status }}</div>

        <div class="adp-management-table-operation" slot="operation" slot-scope="text, record">
          <!-- <span class="adp-management-table-operation-item" @click="handleManageMember(record)">成员管理</span> -->
          <span class="adp-management-table-operation-item" @click="handleEdit(record)">编辑</span>
          <span class="adp-management-table-operation-item" @click="handleCopy(record)">复制</span>
          <!-- <span class="adp-management-table-operation-item" @click="handleView(record)">查看</span> -->
          <span class="adp-management-table-operation-item" @click="openDeleteProject(record)">删除</span>
        </div>
      </a-table>
    </div>
    <a-modal title="新增应用"
      :maskClosable="false"
      :visible="addModalVisible"
      @ok="addProject"
      :confirmLoading="confirmLoading"
      @cancel="handleCancelAddModal"
      width="50%"
      :bodyStyle="{ padding: '0' }"
    >
      <a-form :form="form">
        <div class="adp-project-form-label">基本配置</div>
        <a-form-item label="应用名称" :label-col="{ span: 8 }" :wrapper-col="{ span: 12 }">
          <a-input
            v-decorator="['name', { rules: [{ required: true, message: '请输入应用名称!' }, { validator: appNameValidator }] }]"
            :disabled="isEditorAppName"
          />
        </a-form-item>
        <a-form-item label=" 服务所属产品空间" :label-col="{ span: 8 }" :wrapper-col="{ span: 12 }">
          <a-select
            v-decorator="['owned_product', { rules: [{ required: true, message: '请选择服务所属产品空间!' }] }]"
            showSearch
            optionFilterProp="children"
            :filterOption="findOwner"
            placeholder="请输入"
            @search="value => handleSpaceSearch(value)"
          >
            <a-select-option v-for="space in spaceList" :key="space.name" :value="space.name">{{ space.name }} </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Git Repository" :label-col="{ span: 8 }" :wrapper-col="{ span: 12 }">
          <a-input
            placeholder="https://gitlab.dm-ai.cn/xxxxxx.git"
            v-decorator="['git_repository', { rules: [{ required: true, message: '请输入Git Repository!' }] }]"
            @blur="appRepositoryValidator"
          />
        </a-form-item>
        <a-form-item label="状态" :label-col="{ span: 8 }" :wrapper-col="{ span: 12 }">
          <a-select
            v-decorator="['status', { rules: [{ required: true, message: '请选择环境状态!' }], initialValue: 'running' }]"
            showSearch
            optionFilterProp="children"
            :filterOption="findOwner"
          >
            <a-select-option value="running">启用</a-select-option>
            <a-select-option value="stopped">停止</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="应用描述" :label-col="{ span: 8 }" :wrapper-col="{ span: 12 }">
          <a-textarea
            v-decorator="['description', { rules: [{ required: true, message: '请输入应用描述!' }] }]"
            placeholder="请输入应用描述"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="开发语言" :label-col="{ span: 8 }" :wrapper-col="{ span: 12 }">
          <a-select
            v-decorator="['language_type', { rules: [{ required: true, message: '请选择语言类型!' }] }]"
            showSearch
            optionFilterProp="children"
            :filterOption="findOwner"
            @select="
              value => {
                if (['python'].indexOf(value) != -1) {
                  this.form.setFieldsValue({ if_compile: false });
                } else {
                  this.form.setFieldsValue({ if_compile: true });
                }
                this.$nextTick(() => {
                  let formData = this.form.getFieldsValue();
                  this.form.resetFields();
                  this.form.setFieldsValue({
                    language_type: value,
                    name: formData.name,
                    owned_product: formData.owned_product,
                    git_repository: formData.git_repository,
                    status: formData.status,
                    description: formData.description,
                  });
                  //this.form.setFieldsValue(record);
                });
              }
            "
          >
            <a-select-option value="node">Node</a-select-option>
            <a-select-option value="nodets">NodeTs</a-select-option>
            <a-select-option value="js">Js</a-select-option>
            <a-select-option value="golang">Golang</a-select-option>
            <a-select-option value="android">Android</a-select-option>
            <a-select-option value="unity">Unity</a-select-option>
            <a-select-option value="java">Java</a-select-option>
            <a-select-option value="python">Python</a-select-option>
            <a-select-option value="c">C</a-select-option>
            <a-select-option value="c++">C++</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          :label="'是否编译' + (form.getFieldValue('if_use_custom_dockerfile') ? '(使用自定义Dockerfile可关闭)' : '')"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="pythonNotIn(['python'], form.getFieldValue('language_type'))"
        >
          <a-switch
            v-decorator="[
              'if_compile',
              { valuePropName: 'checked', initialValue: pythonNotIn(['python'], form.getFieldValue('language_type')) },
            ]"
            @change="switchIfCompile"
          ></a-switch>
        </a-form-item>
        <a-form-item
          label="是否关联unity"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="pythonIn(['android'], form.getFieldValue('language_type'))"
        >
          <a-switch v-decorator="['if_add_unity_project', { valuePropName: 'checked', initialValue: false }]"></a-switch>
        </a-form-item>
        <a-form-item
          label="关联unity应用"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="form.getFieldValue('if_add_unity_project')"
        >
          <a-select
            v-decorator="[
              'unity_app_id',
              { rules: [{ required: form.getFieldValue('if_add_unity_project'), message: '请选择上线应用!' }] },
            ]"
            showSearch
            optionFilterProp="children"
            :filterOption="false"
            placeholder="请输入"
            @search="value => projectListV1Computed(value)"
          >
            <a-select-option v-for="app in projectListV1" :key="app.id" :value="app.id">{{ app.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <div class="adp-project-form-label" v-show="pythonNotIn(['android', 'unity'], form.getFieldValue('language_type'))">
          镜像制作描述
        </div>
        <a-form-item
          label="是否制作镜像"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="pythonNotIn(['android', 'unity'], form.getFieldValue('language_type'))"
        >
          <a-switch
            v-decorator="[
              'if_make_image',
              {
                valuePropName: 'checked',
                rules: [{ required: pythonNotIn(['android', 'unity'], form.getFieldValue('language_type')) }],
                initialValue: true,
              },
            ]"
          ></a-switch>
        </a-form-item>

        <a-form-item
          label="是否使用自定义Dockerfile制作镜像"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="pythonNotIn(['android', 'unity'], form.getFieldValue('language_type')) && form.getFieldValue('if_make_image')"
        >
          <a-switch
            v-decorator="[
              'if_use_custom_dockerfile',
              {
                valuePropName: 'checked',
                rules: [{ required: form.getFieldValue('if_make_image') }],
                initialValue: pythonIn(['python'], form.getFieldValue('language_type')),
              },
            ]"
            @change="switchIfUseDeckerfile"
          ></a-switch>
        </a-form-item>
        <a-form-item
          label="使用代码根目录下的Dockerfile制作镜像"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="form.getFieldValue('if_use_custom_dockerfile') && form.getFieldValue('if_make_image')"
        >
          <a-switch
            v-decorator="[
              'if_use_root_dockerfile',
              {
                valuePropName: 'checked',
                rules: [{ required: form.getFieldValue('if_use_custom_dockerfile') && form.getFieldValue('if_make_image') }],
                initialValue: false,
              },
            ]"
          ></a-switch>
        </a-form-item>
        <a-form-item
          label="请输入Dockerfile内容"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="
            form.getFieldValue('if_use_custom_dockerfile') &&
              !form.getFieldValue('if_use_root_dockerfile') &&
              form.getFieldValue('if_make_image')
          "
        >
          <a-textarea
            v-decorator="[
              'dockerfile_content',
              {
                rules: [
                  {
                    required:
                      form.getFieldValue('if_use_custom_dockerfile') &&
                      !form.getFieldValue('if_use_root_dockerfile') &&
                      form.getFieldValue('if_make_image'),
                    message: '请输入Dockerfile!',
                  },
                ],
              },
            ]"
            placeholder="请输入Dockerfile内容"
            :rows="4"
          />
        </a-form-item>
        <div class="adp-project-form-label" v-show="pythonNotIn(['android', 'unity'], form.getFieldValue('language_type'))">
          模型设置描述
        </div>
        <a-form-item
          label="是否使用模型"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="pythonNotIn(['android', 'unity'], form.getFieldValue('language_type'))"
        >
          <a-switch
            v-decorator="[
              'if_use_model',
              {
                valuePropName: 'checked',
                rules: [{ required: pythonNotIn(['android', 'unity'], form.getFieldValue('language_type')) }],
                initialValue: false,
              },
            ]"
          ></a-switch>
        </a-form-item>
        <a-form-item
          label="使用 Git Repository 管理模型"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="form.getFieldValue('if_use_model')"
        >
          <a-switch
            v-decorator="[
              'if_use_git_manager_model',
              { valuePropName: 'checked', rules: [{ required: form.getFieldValue('if_use_model') }], initialValue: true },
            ]"
            @change="
              value => {
                if (value) {
                  this.form.setFieldsValue({ if_save_model_build_computer: false });
                } else {
                  this.form.setFieldsValue({ if_save_model_build_computer: true });
                }
              }
            "
          ></a-switch>
        </a-form-item>
        <a-form-item
          label="模型 Git Repository"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="form.getFieldValue('if_use_git_manager_model') && form.getFieldValue('if_use_model')"
        >
          <a-input
            v-decorator="[
              'model_git_repository',
              {
                rules: [
                  {
                    required: form.getFieldValue('if_use_git_manager_model') && form.getFieldValue('if_use_model'),
                    message: '请输入模型 Git Repository!',
                  },
                ],
              },
            ]"
            placeholder="https://gitlab.dm-ai.cn/xxxxxx.git"
            @blur="appRepositoryValidator"
          />
        </a-form-item>
        <a-form-item
          label="模型存放构建服务器-管理员上传"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="form.getFieldValue('if_use_git_manager_model') == false && form.getFieldValue('if_use_model')"
        >
          <a-switch
            v-decorator="[
              'if_save_model_build_computer',
              {
                valuePropName: 'checked',
                rules: [{ required: form.getFieldValue('if_use_git_manager_model') == false && form.getFieldValue('if_use_model') }],
                initialValue: false,
              },
            ]"
            @change="
              value => {
                if (value) {
                  this.form.setFieldsValue({ if_use_git_manager_model: false });
                } else {
                  this.form.setFieldsValue({ if_use_git_manager_model: true });
                }
              }
            "
          ></a-switch>
        </a-form-item>
        <div class="adp-project-form-label" v-show="pythonNotIn(['android', 'unity'], form.getFieldValue('language_type'))">
          部署设置描述
        </div>
        <a-form-item
          label="是否部署到k8s"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 12 }"
          v-show="pythonNotIn(['android', 'unity'], form.getFieldValue('language_type'))"
        >
          <a-switch
            v-decorator="[
              'if_deploy',
              {
                valuePropName: 'checked',
                rules: [{ required: pythonNotIn(['android', 'unity'], form.getFieldValue('language_type')) }],
                initialValue: false,
              },
            ]"
            @change="switchIfDeploy"
          ></a-switch>
        </a-form-item>

        <div v-show="form.getFieldValue('if_deploy')">
          <a-form-item
            label="是否使用自定义部署文件"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 12 }"
          >
            <a-switch
              v-decorator="['if_use_auto_deploy_file', { valuePropName: 'checked', rules: [{required: true}], initialValue: false }]"
              @change="switchIfUseAutoDeployFile"
            ></a-switch>
          </a-form-item>
          <div v-show="!form.getFieldValue('if_use_auto_deploy_file')">
              <a-form-item
                label="运行环境类型"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 12 }"
              >
                <a-radio-group 
                      v-decorator="['deploy_env_type', { initialValue:'cpu', rules: [{required: form.getFieldValue('if_deploy') }]}]"

                    >
                  <a-radio value="cpu">
                    CPU环境
                  </a-radio>
                  <a-radio value="gpu">
                    GPU环境
                  </a-radio>
                  <a-radio value="arm">
                    Arm64环境
                  </a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item
                label="部署服务ReplicationController类型"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 12 }"
              >
                <a-select
                  v-decorator="[
                    'replication_controller_type',
                    { rules: [{ required: checkDeploy, message: '请选择ReplicationController类型!' }], initialValue: 'Deployment' },
                  ]"
                  showSearch
                  optionFilterProp="children"
                  :filterOption="findOwner"
                >
                  <a-select-option value="Deployment">Deployment</a-select-option>
                  <a-select-option value="StatefulSet">StatefulSet</a-select-option>
                </a-select>
              </a-form-item>
            <div class="adp-project-form-label" v-show="pythonNotIn(['android', 'unity'], form.getFieldValue('language_type'))">
              服务暴露
            </div>
              <a-form-item
                label="部署服务service类型"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 12 }"
              >
                <a-select
                  v-decorator="['serve_type', { rules: [{ required: checkDeploy, message: '请选择服务类型!' }], initialValue: 'ClusterIP' }]"
                  showSearch
                  optionFilterProp="children"
                  :filterOption="findOwner"
                >
                  <a-select-option value="ClusterIP">ClusterIP</a-select-option>
                  <a-select-option value="NodePort">NodePort</a-select-option>
                  <a-select-option value="None">不监听端口,不需要svc</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="服务监听端口" 
                :label-col="{ span: 8 }" 
                :wrapper-col="{ span: 12 }"
                v-show="form.getFieldValue('serve_type')!='None'"
              >
                <a-input
                  readonly="true"
                  @click="
                    () => {
                      let portList = this.form.getFieldValue('service_listen_port').split(',');
                      let initialValue = [];
                      let initRecord = {};
                      portList.forEach((value, index) => {
                        initialValue.push(index);
                        initRecord['names_' + index] = value;
                      });
                      this.portSetform.getFieldDecorator('keys', { initialValue: initialValue, preserve: true });
                      this.portId = 2;
                      this.portDrawerVisible = true;
                      this.$nextTick(() => {
                        this.portSetform.setFieldsValue(initRecord);
                      });
                    }
                  "
                  v-decorator="[
                    'service_listen_port',
                    {
                      rules: [{ required: checkDeploy && form.getFieldValue('serve_type')!='None', message: '请点击我设置服务的监听端口' }],
                      initialValue: '80',
                    },
                  ]"
                />
              </a-form-item>
              <a-form-item
                label="外部域名是否使用支持grpc"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 12 }"
                v-show="form.getFieldValue('if_deploy') && form.getFieldValue('serve_type')!='None'"
              >
                <a-switch
                  v-decorator="['if_use_grpc', { valuePropName: 'checked', rules: [{ required: checkDeploy && form.getFieldValue('serve_type')!='None' }], initialValue: false, }]"
                  @change="switchIfUseGrpc"
                ></a-switch>
              </a-form-item>
              <a-form-item
                label="是否支持sticky会话保持"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 12 }"
                v-show="form.getFieldValue('if_deploy') && form.getFieldValue('serve_type') != 'None'"
              >
                <a-switch
                  v-decorator="['if_use_sticky', { valuePropName: 'checked', rules: [{ required: checkDeploy && form.getFieldValue('serve_type')!='None' }], initialValue: false, }]"
                  @change="switchIfUseSticky"
                ></a-switch>
              </a-form-item>
              <div class="adp-project-form-label">istio设置</div>
              <a-form-item label="是否接入istio" :label-col="{ span: 8 }" :wrapper-col="{ span: 12 }">
                <a-switch
                  v-decorator="['if_use_istio', { valuePropName: 'checked', rules: [{ required: checkDeploy }], initialValue: false, }]"
                ></a-switch>
              </a-form-item>
              <div class="adp-project-form-label">应用发布后检查</div>
              <a-form-item
                label="是否进行服务pods状态检查"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 12 }"
                v-show="form.getFieldValue('if_deploy')"
              >
                <a-switch
                  v-decorator="['if_check_pods_status', { valuePropName: 'checked', rules: [{ required: checkDeploy }], initialValue: true, }]"
                ></a-switch>
              </a-form-item>
              <div class="adp-project-form-label" >计费相关</div>
              <a-form-item label="是否对此服务计费" :label-col="{ span: 8 }" :wrapper-col="{ span: 12 }">
                <a-switch
                  v-decorator="[
                    'if_use_gbs',
                    { valuePropName: 'checked', rules: [{ required: form.getFieldValue('if_deploy') }], initialValue: false, },
                  ]"
                ></a-switch>
              </a-form-item>
          </div>
        </div>
        <div class="adp-project-form-label">审核</div>
        <a-form-item label="上线单是否开启审核" :label-col="{ span: 8 }" :wrapper-col="{ span: 12 }">
          <a-switch v-decorator="['if_need_check', { valuePropName: 'checked' }]"></a-switch>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      title="成员管理"
      :maskClosable="false"
      :visible="manageMemberModalVisible"
      @ok="updateMember"
      :confirmLoading="confirmLoading"
      @cancel="handleCancelManageMember"
    >
    </a-modal>

    <a-drawer
      title="设置使用多个端口(单端口任意，多端口情况下前端域名转发强制80)："
      :width="720"
      @close="onCloseDrawer"
      :visible="portDrawerVisible"
      :wrapStyle="{ height: 'calc(100% - 108px)', overflow: 'auto', paddingBottom: '108px' }"
    >
      <a-form :form="portSetform" layout="vertical" hideRequiredMark>
        <a-form-item
          v-for="(k, index) in portSetform.getFieldValue('keys')"
          :key="k"
          v-bind="index === 0 ? formItemLayout : formItemLayoutWithOutLabel"
          :label="index === 0 ? '端口列表：' : ''"
          :required="false"
        >
          <a-input
            v-decorator="[
              `names_${k}`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [
                  {
                    required: true,
                    message: '请输入port的值，大于0,小于65535的整数',
                  },
                  { validator: portValidator },
                ],
              },
            ]"
            placeholder="请输入port的值，大于0的整型数值"
            style="width: 60%; margin-right: 8px"
          />
          <a-icon
            v-if="portSetform.getFieldValue('keys').length > 1"
            class="dynamic-delete-button"
            type="minus-circle-o"
            :disabled="portSetform.getFieldValue('keys').length === 1"
            @click="() => remove(k)"
          />
        </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel">
          <a-button type="dashed" style="width: 60%" @click="add">
            <a-icon type="plus" />
            继续添加其他端口
          </a-button>
        </a-form-item>
      </a-form>
      <div
        :style="{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
        }"
      >
        <a-button :style="{ marginRight: '8px' }" @click="onCloseDrawer">
          取消
        </a-button>
        <a-button @click="savePortInfo" type="primary">保存</a-button>
      </div>
    </a-drawer>

    <a-passwd-check></a-passwd-check>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import Cookies from 'js-cookie';
import { namespace } from 'vuex-class';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Icon,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Switch,
  Table,
  Radio,
} from 'ant-design-vue';
import moment from 'moment';
import EnvironmentService from '@/service/environment';
import ProjectService from '@/service/project';
import SpaceService from '@/service/space';
import UserService from '@/service/user';
import PasswdCheck from '@/components/Passwd.vue';
import { pythonIn, pythonNotIn, sleep } from '@/const';

const passwdModule = namespace('Passwd');
const spaceService = SpaceService.getSpaceService();
const projectService = ProjectService.getProjectService();
const userService = UserService.getUserService();
const environmentService = EnvironmentService.getEnvironmentService();

@Component({
  components: {
    AButton: Button,
    ARadioGroup: Radio.Group,
    ARadio: Radio,
    AIcon: Icon,
    AInput: Input,
    AInputSearch: Input.Search,
    AForm: Form,
    AFormItem: Form.Item,
    AModal: Modal,
    ASelect: Select,
    ASelectOption: Select.Option,
    ASwitch: Switch,
    ATable: Table,
    ATextarea: Input.TextArea,
    ADrawer: Drawer,
    APasswdCheck: PasswdCheck,
    ARow: Row,
    ACol: Col,
    ADatePicker: DatePicker,
    AInputNumber: InputNumber,
  },
})
export default class AdpProjectManagement extends Vue {
  @passwdModule.Getter('show') private deleteModalVisible!: boolean;
  @passwdModule.Getter('res') private resPasswd!: boolean;
  @passwdModule.Getter('userAction') private userAction!: string;
  @passwdModule.Action('UPDATE_STATE_ASYN') private updatePasswdStatus;
  // 分页相关
  paginationConfig!: any; // 表单分页器的配置项
  totalCount: number = 0; // 总条目
  size: number = 15; // 每页条目数
  page: number = 1; // 当前页码
  isSpinning: boolean = false;
  portId: number = 0;

  // isEditorAppName : boolean = false;
  editId: number = 0;
  resCount: number = 0;
  postData: any = {};
  userPostData: any = {};
  timeout: any = null;
  inputSearch = '';
  searchTimeOut: any = null;
  // 是否显示抽屉，用来修改复杂得表单数据
  drawerVisible: boolean = false;
  // port drawerVisible
  portDrawerVisible: boolean = false;
  storageDrawerVisible: boolean = false;

  needToParseInt = [
    'copy_count',
    'container_port',
  ];

  private projectListAllV1: IProjectV1[] = [];
  private projectListV1: IProjectV1[] = [];

  private pythonIn: any = pythonIn;
  private pythonNotIn: any = pythonNotIn;
  private moment: any = moment;
  private projectList: IProject[] = [];
  private spaceList: ISpace[] = [];
  private userList: IUser[] = [];
  private statusText: any = {
    pending: '未审核',
    reviewed: '等待上线',
    building: '构建中',
    online: '已上线',
    offline: '下线',
    failed: '失败',
    running: '启用',
    stopped: '停用',
  };
  private tableColumns: IAntTableColumn[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      // key: 'name',
      width: 50,
    },
    {
      title: '应用名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '所属空间',
      dataIndex: 'owned_product',
      key: 'owned_product',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      sorter: (a, b) => a.status.localeCompare(b.status),
      slots: { title: 'customStatus' },
      scopedSlots: { customRender: 'status' },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
    },
    {
      title: '修改时间',
      dataIndex: 'updated_at',
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
  private manageMemberModalVisible: boolean = false;
  private deleteForm: any;
  private form: any;
  private portSetform: any;
  private storageForm: any;
  private subFormType: any;
  private tableSearchForm: any;
  private confirmLoading: boolean = false;
  private adpTableSearchFromExpand: boolean = false;
  private envList: any[] = [];
  checkAutoDeployContent: boolean = false;
  checkCompile: boolean = false;
  checkDeploy: boolean = false;
  checkDockerfileContent: boolean = false;
  validGitlabUrl: any = {};

  formItemLayoutWithOutLabel: any = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 20, offset: 4 },
    },
  };

  formItemLayout: any = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  };

  private adpTableSearchFromHandleReset() {
    this.removeCookie();
    this.tableSearchForm.resetFields();
    this.page = 1;
    this.$nextTick(() => {
      this.fetchProjectList();
    });
  }

  private adpTableSearchFromToggle() {
    this.adpTableSearchFromExpand = !this.adpTableSearchFromExpand;
    Cookies.set('adpTableSearchFromExpand', this.adpTableSearchFromExpand);
    if (!this.adpTableSearchFromExpand) {
      this.readCookie();
      this.tableSearchForm.resetFields();
    }
    this.page = 1;
    this.$nextTick(() => {
      this.fetchProjectList();
    });
  }

  private removeCookie() {
    Cookies.set('adpTableSearchFromOwnedProduct', []);
    Cookies.set('adpTableSearchFromOwnedDeployEnvType', []);
    Cookies.set('adpTableSearchFromOwnedDeployLanguageType', []);
  }

  private adpTableSearchFromOwnedProductChange(value: any) {
    console.log(value);
    Cookies.set('adpTableSearchFromOwnedProduct', value);
    this.page = 1;
    this.$nextTick(() => {
      this.fetchProjectList();
    });
  }

  private adpTableSearchFromOwnedDeployEnvTypeChange(value: any) {
    Cookies.set('adpTableSearchFromOwnedDeployEnvType', value);
    this.page = 1;
    this.$nextTick(() => {
      this.fetchProjectList();
    });
  }

  private adpTableSearchFromOwnedDeployLanguageTypeChange(value: any) {
    this.page = 1;
    this.$nextTick(() => {
      this.fetchProjectList();
    });
    Cookies.set('adpTableSearchFromOwnedDeployLanguageType', value);
  }

  private fetchData() {
    this.fetchProjectList();
    this.fetchSpaceList('');
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

  get isEditorAppName() {
    return this.editId != 0;
  }

  private remove(k) {
    const { portSetform, storageForm } = this;
    let tempForm = this.subFormType === 'storage' ? storageForm : portSetform;
    // can use data-binding to get
    const keys = tempForm.getFieldValue('keys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    tempForm.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  private add() {
    const { portSetform, storageForm } = this;
    let tempForm = this.subFormType === 'storage' ? storageForm : portSetform;
    // can use data-binding to get
    const keys = tempForm.getFieldValue('keys');
    let nextKeys;
    if (this.subFormType === 'storage') {
      nextKeys = keys.concat(keys.length);
    } else {
      this.portId = this.portId + 1;
      nextKeys = keys.concat(this.portId);
    }
    console.log(nextKeys);
    // can use data-binding to set
    // important! notify form to detect changes
    tempForm.setFieldsValue({
      keys: nextKeys,
    });
  }

  private async fetchEnvlist() {
    try {
      let res: any = await environmentService.getEnvironmentList({});
      this.envList = [];
      res.data.forEach((value, index) => {
        this.envList.push(value);
      });
    } catch (error) {
      message.error(String(error));
    }
  }

  private async fetchprojectListAllV1() {
    await sleep(300);
    let res: any = await projectService.getProjectIdNameList({
      name: '',
      language_type: 'unity',
    });
    this.projectListAllV1 = res.data;
    this.projectListV1 = this.projectListAllV1.slice(0, 15);
  }

  private async projectListV1Computed(val: string) {
    await sleep(300);
    let patt = new RegExp(val, 'i');
    this.projectListV1 = this.projectListAllV1.filter((value: IProjectV1) => {
      if (patt.test(value.name)) {
        return true;
      } else {
        return false;
      }
    });
    this.projectListV1 = this.projectListV1.slice(0, 15);
  }

  private async fetchProjectList() {
    this.isSpinning = true;
    try {
      let res: any = await projectService.getProject({
        ...this.postData,
        owned_product: this.tableSearchForm.getFieldValue('owned_product').join(','),
        deploy_env_type: this.tableSearchForm.getFieldValue('deploy_env_type').join(','),
        language_type: this.tableSearchForm.getFieldValue('language_type').join(','),
        page: this.page,
        size: this.size,
      });
      console.log(res);
      this.projectList = res.data;
      this.totalCount = res.count;
      this.paginationConfig.total = this.totalCount;
      console.log(this.paginationConfig);
      this.paginationConfig = JSON.parse(JSON.stringify(this.paginationConfig));
      this.isSpinning = false;
      this.$forceUpdate();
      return res.data;
    } catch (error) {
      console.error(error);
      message.error(error.message);
    }
  }

  handleSpaceSearch(value: any) {
    this.spaceList = [];
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(() => {
      this.fetchSpaceList(value);
    }, 300);
    console.log(this.timeout);
  }

  private async fetchSpaceList(searchName: any) {
    try {
      let res: any = await spaceService.getSpaceList({
        name: searchName,
        page: 1,
        size: this.size,
      });
      console.log(res);
      this.spaceList = res.data;
      return res;
    } catch (error) {
      console.error(error);
      message.error(error.message);
    }
  }

  appNameValidator(r, v, cb) {
    console.log(v);
    if (!v) {
      cb(false);
    } else {
      console.log(typeof v);
      let pattAppName = new RegExp('^[a-zA-Z0-9-]*$', 'i');
      if (pattAppName.test(v)) {
        cb();
      } else {
        cb('应用名称支持大小写英文字母,数字和-，其他字符不支持');
      }
    }
  }

  // 在新建app的时候，校验app的名称是否具有唯一性，通过后端的db table查询校验。
  private async getAppNameIfOnlyOne() {
    try {
      let res: any = await projectService.getProjectList({
        name: this.form.getFieldsValue()['name'],
        page: 1,
      });
      console.log(res.count);
      this.resCount = res.count;
      return res.count;
    } catch (error) {
      console.error(error);
      message.error(error.message);
    }
  }

  private onCloseDrawer() {
    this.drawerVisible = false;
    this.portDrawerVisible = false;
    this.storageDrawerVisible = false;
  }

  // 失去焦点校验 v-decorator不支持异步校验且输入变化就校验发送请求比较频繁
  async appRepositoryValidator(e) {
    const id = e.target.id;
    const v = e.target.value;
    console.log(id, v);
    if (v) {
      let msg;
      let pattAppName = new RegExp('^https.*$', 'i');
      if (pattAppName.test(v)) {
        const res = (await projectService.getGitlabProject({ http_url_to_repo: v })) as any;
        if (res.msg) {
          msg = res.msg.toString();
        }
      } else {
        msg = 'git地址支持https://模式，不支持git@模式';
      }
      if (msg) {
        this.validGitlabUrl[id] = {
          value: v,
          errors: [
            {
              message: msg,
              field: id,
            },
          ],
        };
        this.form.setFields(this.validGitlabUrl);
        return;
      }
    }
    delete this.validGitlabUrl[id];
  }


  portValidator(r, v, cb) {
    console.log(v);
    if (!v) {
      cb(false);
    } else {
      console.log(typeof v);
      v = parseFloat(v);
      console.log(v);
      if (v < 1 || v > 65535) {
        cb('请输入正整数, 大于0，小于65535');
      } else {
        if (Number.isInteger(v)) {
          cb();
        } else {
          cb('请输入正整数');
        }
      }
    }
  }

  private handleManageMember(record) {
    this.manageMemberModalVisible = true;
    console.log('成员管理', record);
  }

  private updateMember() {
    console.log('更新成员管理');
  }

  private handleCancelManageMember() {
    this.manageMemberModalVisible = false;
  }

  private handleEdit(record) {
    this.fetchprojectListAllV1();
    this.addModalVisible = true;
    this.editId = record.id;
    this.$nextTick(() => {
      this.form.setFieldsValue(record);
    });
  }

  private handleCopy(record) {
    this.addModalVisible = true;
    this.editId = 0;
    this.fetchSpaceList('');
    record.name = record.name + '-' + moment().format();
    this.$nextTick(() => {
      this.form.setFieldsValue(record);
      this.fetchProjectList();
    });
  }

  private handleView(record) {
    console.log('查看表单，edit的只读模式', record);
  }

  async deleteOneItem(record) {
    try {
      await projectService.deleteProjectItem(record.id);
      return this.fetchProjectList();
    } catch (err) {
      console.log(err);
      message.error(err.message);
    }
  }

  @Watch('userAction')
  private async deleteOneProject() {
    if (this.userAction != 'yes') return;
    if (this.userAction == 'yes' && this.editId != 0) {
      try {
        let res: any = await projectService.deleteProjectItem(this.editId);
        if (res.res == 'ok') {
          this.handleCancelDeleteModal();
          return this.fetchProjectList();
        } else {
          message.error(res.mes);
        }
      } catch (err) {
        console.log(err);
        message.error(String(err));
        this.handleCancelDeleteModal();
      }
    }
  }

  private async openDeleteProject(record) {
    this.editId = record.id;
    this.updatePasswdStatus({ show: true, res: false, userAction: 'wait' });
  }

  private project(record) {
    message.warning('删除功能，暂停使用，等待cum，防止出错！');
    return;
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
    this.fetchProjectList();
  }

  private openAddProjectModal() {
    this.addModalVisible = true;
    this.editId = 0;
    this.fetchSpaceList('');
    this.fetchprojectListAllV1();
  }

  private handleCancelAddModal() {
    this.addModalVisible = false;
    this.editId = 0;
    this.form.resetFields();
  }

  private handleCancelDeleteModal() {
    this.editId = 0;
    this.deleteForm.resetFields();
  }

  private savePortInfo() {
    let portInfo: any = [];
    this.portSetform.validateFields(async err => {
      if (!err) {
        let formData = this.portSetform.getFieldsValue();
        console.log(formData);
        for (let k in formData) {
          if (k != 'keys' && portInfo.indexOf(formData[k].toString()) == -1) {
            portInfo.push(formData[k].toString());
          }
        }
        console.log(portInfo);
        this.form.setFieldsValue({ service_listen_port: portInfo.join(',') });
        this.portDrawerVisible = false;
      }
    });
  }

  private addProject() {
    console.log(this.form.getFieldsValue());
    if (Object.keys(this.validGitlabUrl).length) {
      this.form.setFields(this.validGitlabUrl);
      return;
    }
    this.confirmLoading = true;
    this.form.validateFields(async err => {
      if (!err) {
        console.log('success', this.form.getFieldsValue());
        try {
          let postDataTemp = JSON.parse(JSON.stringify(this.form.getFieldsValue()));
          for (let i of this.needToParseInt) {
            console.log(i);
            console.log(postDataTemp[i]);
            postDataTemp[i] = postDataTemp[i] ? parseInt(postDataTemp[i]) : postDataTemp[i];
          }
          if (this.editId) {
            // await projectService.updateProjectItem(this.editId, postDataTemp);
            await projectService.updateProjectItem({
              ...postDataTemp,
              id: this.editId,
            });
            this.editId = 0;
          } else {
            await projectService.addProjectItem({
              ...postDataTemp,
              create_date: moment().format('YYYY-MM-DD HH:mm'),
            });
          }
          this.confirmLoading = false;
          this.handleCancelAddModal();
          return this.fetchProjectList();
        } catch (err) {
          this.editId = 0;
          this.confirmLoading = false;
          console.log(err);
          message.error(err.message);
          this.handleCancelAddModal();
        }
      }
      this.confirmLoading = false;
    });
  }

  private findOwner(input, option) {
    return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) > -1;
  }


  private switchIfUseGrpc(checked) {
    this.form.resetFields(['if_use_grpc']);
  }

  private switchIfUseSticky(checked) {
    this.form.resetFields(['if_use_sticky']);
  }

  private switchIfUseAutoDeployFile(checked) {
    this.checkAutoDeployContent = checked;
    this.form.resetFields(['auto_deploy_content']);
  }

  private switchIfCompile(checked) {
    this.checkCompile = checked;
    this.form.resetFields(['if_compile']);
  }

  private switchIfDeploy(checked) {
    this.checkDeploy = checked;
    this.form.resetFields(['if_deploy']);
  }
  private switchIfUseDeckerfile(checked) {
    this.checkDockerfileContent = checked;
    this.form.resetFields(['dockerfile_content']);
    this.form.setFieldsValue({ if_compile: false });
  }
  onPageChange(data: any) {
    console.log(data);
    this.page = data.current;
    this.paginationConfig.current = this.page;
    this.fetchProjectList();
  }
  created() {
    // 初始化分页器
    this.paginationConfig = {
      showTotal: (total: any) => `共 ${total} 个应用`,
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
    this.readCookie();
    this.fetchData();
  }
  private readCookie() {
    if (Cookies.get('adpTableSearchFromExpand') == undefined) {
      Cookies.set('adpTableSearchFromExpand', true);
    }
    let adpTableSearchFromExpand = Cookies.get('adpTableSearchFromExpand');
    if (adpTableSearchFromExpand == 'false') {
      this.adpTableSearchFromExpand = false;
      this.removeCookie();
    } else {
      this.adpTableSearchFromExpand = true;
    }
    // init
    this.tableSearchForm.setFieldsValue({
      owned_product: Cookies.get('adpTableSearchFromOwnedProduct') ? JSON.parse(Cookies.get('adpTableSearchFromOwnedProduct')) : [],
      deploy_env_type: Cookies.get('adpTableSearchFromOwnedDeployEnvType')
        ? JSON.parse(Cookies.get('adpTableSearchFromOwnedDeployEnvType'))
        : [],
      language_type: Cookies.get('adpTableSearchFromOwnedDeployLanguageType')
        ? JSON.parse(Cookies.get('adpTableSearchFromOwnedDeployLanguageType'))
        : [],
    });
  }

  private beforeCreate() {
    this.form = this.$form.createForm(this);
    this.deleteForm = this.$form.createForm(this);
    this.portSetform = this.$form.createForm(this);
    this.storageForm = this.$form.createForm(this);
    this.tableSearchForm = this.$form.createForm(this);

    // this.portSetform.getFieldDecorator('keys', { initialValue: [0,1,2,3], preserve: true });
  }
}
</script>
<style lang="scss" scoped>
.adp-management-operation {
  margin-bottom: 20px;
}

.adp-table-search-form {
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 5px;
  padding-bottom: 5px;
  background: #fbfbfb;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
}

.adp-table-search-form .ant-form-item {
  display: flex;
}

.adp-table-search-form .ant-form-item-control-wrapper {
  flex: 1;
}

#adp-table-search .ant-form {
  max-width: none;
}

#adp-table-search {
  margin-bottom: 20px;
}
</style>
<style lang="scss">
.adp-management-list .ant-table-thead > tr > th,
.ant-table-tbody > tr > td {
  padding-left: 4px;
  padding-right: 4px;
  padding-top: 16px;
  padding-bottom: 16px;
  // white-space:nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
</style>
