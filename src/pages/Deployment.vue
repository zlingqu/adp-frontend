<template>
  <div class="adp-management">
    <div class="adp-management-operation">
      <a-input-search
        v-focus="true"
        class="adp-management-operation-filter"
        placeholder="模糊搜索：上线单/应用/用户名"
        enterButton
        v-model="inputSearch"
        @search="onSearch"
      ></a-input-search>
      <a-button type="primary" icon="plus" @click="openAddDeploymentModal">添加</a-button>
      <a-button type="primary" icon="plus" @click="openMultiDeploymentModal">批量构建</a-button>
      <div class="adp-management-counter">
        共
        <span class="adp-management-counter-num">{{ totalCount }}</span>
        个上线单
      </div>
    </div>
    <div id="adp-table-search">
      <a-form class="adp-table-search-form" :form="tableSearchForm">
        <a-row :gutter="24" :style="{ display: deploySearchFromExpand ? 'block' : 'none' }">
          <a-col :span="6" :style="{ display: 'block' }">
            <a-form-item :label="`部署环境`" :wrapper-col="{ span: 15, offset: 1 }">
              <a-select
                v-decorator="['env_name', { rules: [{ required: false, message: '环境名' }], initialValue: [] }]"
                mode="tags"
                style="width: 100%"
                :tokenSeparators="[',']"
                @search="value => value"
                @change="value => adpTableSearchFromHandleChange('x--1', value)"
              >
                <a-select-option v-for="env in environmentList" :key="env.name" :value="env.name">{{ env.name }} </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6" :style="{ display: 'block' }">
            <a-form-item :label="`部署空间`" :wrapper-col="{ span: 15, offset: 1 }">
              <a-select
                v-decorator="['deploy_namespace', { rules: [{ required: false, message: '请选择服务所属产品空间!' }], initialValue: [] }]"
                mode="tags"
                style="width: 100%"
                :tokenSeparators="[',']"
                @search="value => value"
                @change="value => adpTableSearchFromHandleChange('x--2', value)"
              >
                <a-select-option v-for="space in spaceList" :key="space.name" :value="space.name">{{ space.name }} </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="6" :style="{ display: 'block' }">
            <a-form-item :label="`用户`" :wrapper-col="{ span: 15, offset: 1 }">
              <a-select
                v-decorator="['owner_name', { rules: [{ required: false, message: '请选择用户' }], initialValue: [] }]"
                mode="tags"
                style="width: 100%"
                :tokenSeparators="[',']"
                :filterOption="false"
                @search="value => userListV1Computed(value)"
                @change="value => adpTableSearchFromHandleChange('x--3', value)"
                @dropdownVisibleChange="
                  open => {
                    open ? (this.userListV1 = this.userListAllV1.slice(0, 15)) : (this.userListV1 = this.userListAllV1);
                  }
                "
              >
                <a-select-option v-for="user in userListV1" :key="user.owner_english_name" :value="user.owner_china_name"
                  >{{ user.owner_china_name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6" :style="{ display: 'block' }">
            <a-form-item :label="`应用`" :wrapper-col="{ span: 15, offset: 1 }">
              <a-select
                v-decorator="['app_name', { rules: [{ required: false, message: '请选择应用名' }], initialValue: [] }]"
                mode="tags"
                style="width: 100%"
                :tokenSeparators="[',']"
                :filterOption="false"
                @change="value => adpTableSearchFromHandleChange('x--4', value)"
                @search="value => projectListV1Computed(value)"
              >
                <a-select-option v-for="app in projectListV1" :key="app.id" :value="app.name">{{ app.name }} </a-select-option>
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
              <a-icon :type="deploySearchFromExpand ? 'up' : 'down'" />
            </a>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="adp-management-list">
      <a-table
        class="adp-management-table adp-deployment-management-table"
        :rowSelection="rowSelection"
        :columns="tableColumns"
        :dataSource="deploymentList"
        :rowKey="record => record.id"
        :pagination="paginationConfig"
        :scroll="{ x: 1744, y:'calc(100vh)' }"
        @change="onPageChange"
        bordered
      >
        <div class="time" slot="updateTime" slot-scope="updateTime">{{ moment(updateTime).format('YYYY-MM-DD HH:mm') }}</div>

        <div class="status" slot="status" slot-scope="status">
          <a-icon v-if="status === 'building'" type="sync" spin />
          <a-icon v-if="status === 'reviewed' || status === 'pending'" slot="dot" type="clock-circle-o" />
          <a-icon v-if="status === 'online'" type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
          <a-icon v-if="status === 'failed'" type="close-circle" theme="twoTone" twoToneColor="#FF0000" />
          {{ statusText[status] ? statusText[status] : status }}
        </div>

        <div class="adp-management-table-operation" slot="operation" slot-scope="text, record" :style="'white-space:nowrap;'">
          <span v-if="showBuildButtonOne(record)">
            <a-button type="link" :disabled='ifEnableDeploy' @click="handleDeploy(record)">构建</a-button>
          </span>
          <span class="adp-management-table-operation-item" @click="handleViewOnline(record)">查看</span>
          <span class="adp-management-table-operation-item" @click="openEditorDeploymentModal(record)">编辑</span>
          <span class="adp-management-table-operation-item" @click="handleCopy(record)">复制</span>
          <span v-if="showReviewBUttonOne(record)" class="adp-management-table-operation-item" @click="handleReview(record)">审核</span>
          <span class="adp-management-table-operation-item" @click="handleDelete(record)">删除</span>
          <a-dropdown>
            <a-menu slot="overlay" @click="handleMenuClick($event, record)">
              <a-menu-item key="kibana">日志查询</a-menu-item>
              <a-menu-item key="grafana">性能监控</a-menu-item>
              <a-menu-item key="k8s">k8s链接</a-menu-item>
              <a-menu-item key="prometheus">基础监控</a-menu-item>
              <a-menu-item key="codeCheck">代码查看</a-menu-item>
            </a-menu>
            <a-button type="primary" size="small" style="margin-left: 8px"
              >监控
              <a-icon type="down" />
            </a-button>
          </a-dropdown>
        </div>
      </a-table>
    </div>

    <a-modal title="新增上线单"
      :maskClosable="false"
      :visible="addModalVisible"
      @ok="addDeployment"
      :confirmLoading="confirmLoading"
      @cancel="handleCancel"
      width="50%"
      :bodyStyle="{ padding: '0' }"
    >
      <a-form :form="form">
        <div class="adp-project-form-label">制作镜像相关配置( docker build ):</div>
        <a-form-item label="工单名字" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
          <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入上线单标题!' }] }]" :readOnly="readOnly" />
        </a-form-item>
        <a-form-item label="应用状态" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" v-show="false">
          <a-input v-decorator="['status', { rules: [{ required: false, message: '应用状态' }] }]" :readOnly="readOnly" />
        </a-form-item>
        <a-form-item label="选择应用" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
          <a-select
            v-decorator="['app_id', { rules: [{ required: true, message: '请选择上线应用!' }] }]"
            showSearch
            optionFilterProp="children"
            :filterOption="false"
            :disabled="isEditing"
            placeholder="请选择上线应用"
            @select="value => getK8sNamespaceFromProjectInfo(value)"
            @search="value => projectListV2Computed(value)"
            @dropdownVisibleChange="
              open => {
                open ? (this.projectListV2 = this.projectListAllV2.slice(0, 15)) : (this.projectListV2 = this.projectListAllV2);
              }
            "
          >
            <a-select-option v-for="app in projectListV2" :key="app.id" :value="app.id">{{ app.name }} </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="工单所属" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
          <a-select
            v-decorator="['owner_english_name', { rules: [{ required: true, message: '请选择上线单所属人!' }] }]"
            showSearch
            optionFilterProp="children"
            :filterOption="false"
            placeholder="请输入"
            @search="value => userListV1Computed(value)"
            @dropdownVisibleChange="
              open => {
                open ? (this.userListV1 = this.userListAllV1.slice(0, 15)) : (this.userListV1 = this.userListAllV1);
              }
            "
          >
            <a-select-option v-for="user in userListV1" :key="user.owner_english_name" :value="user.owner_english_name">
              {{ user.owner_china_name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="代码分支" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
          <a-select v-decorator="['branch', { rules: [{ required: true, message: '请选择上线分支!' }] }]">
            <a-select-option v-for="projectBranch in projectBranchList" :key="projectBranch" :value="projectBranch"
              >{{ projectBranch }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="版本控制方式" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
          <a-select
            v-decorator="[
              'version_control_mode',
              { rules: [{ required: true, message: '请选择版本控制方式' }], initialValue: 'GitCommitId' },
            ]"
            showSearch
            optionFilterProp="children"
            :filterOption="findOwner"
          >
            <a-select-option value="GitCommitId">GitCommitId</a-select-option>
            <a-select-option value="GitTags">GitTags</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="GitCommitId"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 12 }"
          v-show="form.getFieldValue('version_control_mode') == 'GitCommitId'"
        >
          <a-input
            v-decorator="[
              'git_commit_id',
              {
                rules: [{ required: form.getFieldValue('version_control_mode') == 'GitCommitId', message: '请输入上线版本GitCommitId' }],
                initialValue: 'last',
              },
            ]"
            :readOnly="readOnly"
          />
        </a-form-item>
        <a-form-item
          label="GitTag"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 12 }"
          v-show="form.getFieldValue('version_control_mode') == 'GitTags'"
        >
          <a-select
            v-decorator="[
              'git_tag',
              { rules: [{ required: form.getFieldValue('version_control_mode') == 'GitTags', message: '请选择tag!' }] },
            ]"
            placeholder="请选择"
            showSearch
            @search="
              value => {
                const reg = new RegExp(value.trim(), 'i');
                this.projectTagList = this.projectAllTagList.filter(v => reg.test(v));
              }
            "
            @dropdownVisibleChange="
              open => {
                this.projectTagList = this.projectAllTagList;
              }
            "
          >
            <a-select-option v-for="tag in projectTagList" :key="tag" :value="tag">
              {{ tag }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item 
          label="安卓编译渠道号" 
          :label-col="{ span: 7 }" 
          :wrapper-col="{ span: 12 }" 
          v-show="form.getFieldValue('language_type') === 'android'" 
        >
          <a-input 
            v-decorator="[
              'android_flavor', 
              {
                rules: [{ required: true, message: '安卓编译渠道号!'}],
                initialValue: 'default'
              },
            ]"
            :readOnly="readOnly"
          />
        </a-form-item>
        <a-form-item
          label="从apollo注入环境变量到Dockerfile"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 12 }"
        >
          <a-switch
            v-decorator="[
              'if_use_apollo_for_dockerfile',
              {
                valuePropName: 'checked',
                rules: [{ required: true }],
                initialValue: false,
              },
            ]"
            @change="switchIfUseApolloForDockerfile"
          ></a-switch>
        </a-form-item>
        <a-form-item
            label="apollo环境"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 12 }"
            v-show="form.getFieldValue('if_use_apollo_for_dockerfile')"
          >
            <a-radio-group 
                  v-decorator="['apollo_env_for_dockerfile', { initialValue:'prd', rules: [{required: this.ifUseApolloForDockerfile }]}]"
                >
              <a-radio value="dev">
                dev
              </a-radio>
              <a-radio value="test">
                test
              </a-radio>
              <a-radio value="stage">
                stage
              </a-radio>
              <a-radio value="uat">
                uat
              </a-radio>
              <a-radio value="prd">
                prd
              </a-radio>
            </a-radio-group>
        </a-form-item>
        <a-form-item label="apollo集群名" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" v-show="form.getFieldValue('if_use_apollo_for_dockerfile')">
            <a-input
              v-decorator="[
                'apollo_cluster_for_dockerfile',
                {
                  rules: [{ required: this.ifUseApolloForDockerfile, message: '请输入apollo集群名称' }],
                  initialValue: 'default',
                },
              ]"
              :readOnly="readOnly"
            />
        </a-form-item>

        <a-form-item label="apollo空间" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" v-show="form.getFieldValue('if_use_apollo_for_dockerfile')">
          <a-input
            v-decorator="[
              'apollo_namespace_for_dockerfile',
              {
                rules: [{ required: this.ifUseApolloForDockerfile, message: 'apollo命名空间' }],
                initialValue: 'application',
              },
            ]"
            :readOnly="readOnly"
          />
        </a-form-item>
        <a-form-item label="language_type" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" v-show="false">
          <a-input
            v-decorator="[
              'language_type',
              {
                rules: [{ required: true, message: 'language_type' }],
              },
            ]"
            :readOnly="readOnly"
          />
        </a-form-item>
        <a-form-item
          label="js-version"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 12 }"
          v-show="form.getFieldValue('language_type') === 'js'"
        >
          <a-input
            v-decorator="[
              'js_version',
              {
                rules: [{ required: true, message: 'js版本' }],
                initialValue: '0.0.0',
              },
            ]"
          />
        </a-form-item>
        <div v-show="this.ifDeploy">
          <div class="adp-project-form-label">部署相关配置( kubernetes yaml ):</div>
                <a-form-item label="上线环境" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
                <a-select
                  v-decorator="['env_id', { rules: [{ required: this.ifDeploy, message: '请选择上线环境!' }] }]"
                  showSearch
                  optionFilterProp="children"
                  :filterOption="false"
                  placeholder="请输入"
                  @search="value => handleEnvSearch(value)"
                  @change="value => handlerChageSomeField(value)"
                  :disabled="isEditing"
                >
                  <a-select-option v-for="env in environmentList" :key="env.id" :value="env.id">{{ env.name }} </a-select-option>
                </a-select>
              </a-form-item>
          <div v-if="this.if_use_auto_deploy_file == true">
              <a-form-item
                label="自定义yaml"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 12 }"
              >
                <a-textarea
                  v-decorator="['auto_deploy_content', { rules: [{ required: false, message: '请输入自定义部署文件!' }] }]"
                  placeholder="请输入自定义yaml,可自定义deploy、svc、ingressroute、configmap等各种资源。注意将image字段替换为：JENKINS_DEPLOY_IMAGE_ADDRESS"
                  :rows="30"
                />
              </a-form-item>
          </div>
          <div v-else>
              <a-form-item
                label="运行在专用节点"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 12 }"
              >
                  <a-input
                      v-decorator="[
                        'node_special_for',
                        { rules: [
                                    { 
                                      required: false, 
                                      message: 'label值不合法',
                                    },
                                ],
                          initialValue: 'None'
                        },
                      ]"
                      placeholder='未启用改功能，输入None'
                      addon-before="node.special.for ="
                  >
                  </a-input>
              </a-form-item>
              <a-form-item label="k8s-namespace" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
                <a-select
                  v-decorator="[
                    'k8s_namespace',
                    {
                      rules: [{ required: this.ifDeploy, message: '输入k8s的namespace' }],
                      initialValue: 'default',
                    },
                  ]"
                  showSearch
                  optionFilterProp="children"
                  :filterOption="false"
                  placeholder="请输入"
                  @search="value => handleSpaceSearch(value)"
                >
                  <a-select-option v-for="space in spaceList" :key="space.key" :value="space.key">{{ space.name }} </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="是否挂载存储" :label-col="{ span: 8 }" :wrapper-col="{ span: 12 }">
                <a-switch
                  v-decorator="['if_storage_locale', { valuePropName: 'checked', rules: [{ required: true }], initialValue: false }]"
                  @change="switchIfStorageLocale"
                ></a-switch>
              </a-form-item>
              <a-form-item
                label="存储挂载配置"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 12 }"
                v-show="form.getFieldValue('if_storage_locale')"
              >
                <a-textarea
                  v-decorator="['storage_path', { rules: [{ required: this.ifDeploy && form.getFieldValue('if_storage_locale'), message: '输入存储挂载的配置' }] }]"
                  placeholder="格式：'pvc名字:路径名'，例如mypvc:/data。多个配置使用逗号分隔。"
                  :rows="3"
                />
              </a-form-item>
              <a-form-item label="pod副本数量" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" v-show="this.ifDeploy">
                <a-input
                  v-decorator="[
                    'pod_nums',
                    { rules: [{ required: this.ifDeploy, message: '请输入pod副本数量' }, { validator: isNumber }], initialValue: 1 },
                  ]"
                  type="number"
                />
              </a-form-item>
              <a-form-item label="cpu最低需求" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" >
                <a-input
                  v-decorator="[
                    'cpu_min_require',
                    { rules: [{ required: this.ifDeploy, message: '请输入cpu最低需求!' }, { validator: cpuMinValidator }], initialValue: 100 },
                  ]"
                  type="number"
                  addon-after="m"
                />
              </a-form-item>
              <a-form-item label="cpu最高需求" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" >
                <a-input
                  v-decorator="[
                    'cpu_max_require',
                    { rules: [{ required: this.ifDeploy, message: '请输入cpu最高需求!' }, { validator: cpuMaxValidator }], initialValue: 200 },
                  ]"
                  type="number"
                  addon-after="m"
                />
              </a-form-item>
              <a-form-item label="内存最低需求" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" >
                <a-input
                  v-decorator="[
                    'memory_min_require',
                    { rules: [{ required: this.ifDeploy, message: '请选择内存最低需求!' }, { validator: cpuMinValidator }], initialValue: 200 },
                  ]"
                  type="number"
                  addon-after="MB"
                />
              </a-form-item>
              <a-form-item label="内存最高需求" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" >
                <a-input
                  v-decorator="[
                    'memory_max_require',
                    { rules: [{ required: this.ifDeploy, message: '请选择内存最高需求!' }, { validator: memMaxValidator }], initialValue: 400 },
                  ]"
                  type="number"
                  addon-after="MB"
                />
              </a-form-item>
              <a-form-item
                label="GPU资源控制方式"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 12 }"
                v-show="this.deploy_env_type == 'gpu'"
              >
                <a-select
                  v-decorator="[
                    'gpu_control_mode', 
                    { rules: [
                          { 
                            required: this.deploy_env_type == 'gpu' && this.ifDeploy, 
                            message: '请选择GPU资源控制方式' 
                          }
                      ], 
                      initialValue: 'mem' 
                      },
                  ]"
                  showSearch
                  optionFilterProp="children"
                  :filterOption="findOwner"
                  @change="changeGpuTypeState"
                >
                  <a-select-option value="pod">每个pod使用GPU卡数</a-select-option>
                  <a-select-option value="mem">每个pod使用GPU显存（单位MiB）</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                label="每个POD使用GPU卡数"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 12 }"
                v-show="this.deploy_env_type == 'gpu' && form.getFieldValue('gpu_control_mode') == 'pod'"
              >
                <a-input
                  v-decorator="[
                    'gpu_card_count',
                    { 
                      rules: [
                        { required: this.deploy_env_type == 'gpu' && this.ifDeploy && form.getFieldValue('gpu_control_mode') == 'pod', 
                          message: '请输入GPU使用卡数!'
                        },
                        
                      ], 
                      initialValue: 1
                    },
                  ]"
                  type="number"
                  addon-after="张卡"
                />
              </a-form-item>
              <a-form-item
                label="每个pod使用GPU内存"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 12 }"
                v-show="this.deploy_env_type == 'gpu' && form.getFieldValue('gpu_control_mode') == 'mem'"
              >
                <a-input
                  v-decorator="[
                    'gpu_mem_count',
                    { rules: [
                                { 
                                  required: this.deploy_env_type == 'gpu' && this.ifDeploy && form.getFieldValue('gpu_control_mode') == 'mem', 
                                  message: '每个pod使用GPU内存大小' 
                                },
                                
                            ],
                      initialValue: 2 
                    },
                  ]"
                  type="number"
                  addon-after="MiB"
                />
              </a-form-item>
              <a-form-item label="选择gpu型号" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" v-show="this.deploy_env_type == 'gpu' && form.getFieldValue('gpu_control_mode') == 'mem'">
                <a-checkbox-group
                  v-decorator="['gpu_type', { rules: [{required: this.ifDeploy && this.deploy_env_type == 'gpu' && form.getFieldValue('gpu_control_mode') == 'mem'}] }]"
                  option.initialValue="all"
                  :options="gpuTypeMemList"
                >
                </a-checkbox-group>
              </a-form-item>
              <a-form-item label="选择gpu型号" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" v-show="this.deploy_env_type == 'gpu' && form.getFieldValue('gpu_control_mode') == 'pod'">
                <a-checkbox-group 
                  v-decorator="['gpu_type', { rules: [{required: this.ifDeploy && this.deploy_env_type == 'gpu' && form.getFieldValue('gpu_control_mode') == 'pod'}] }]"
                  option.initialValue="all"
                  :options="gpuTypeCardList"
                >
                </a-checkbox-group>
              </a-form-item>
              <a-form-item
                label="k8s特殊的环境变量"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 12 }"
              >
                <a-textarea
                  v-decorator="['yaml_env', { rules: [{ required: false, message: '特殊的环境变量' }],initialValue:'None' }]"
                  placeholder="格式：'变量名=变量值'，例如port=8090。多个配置使用换行符分隔."
                  :rows="4"
                />
              </a-form-item>
              <div v-if="this.serve_type=='None' || this.env_status =='stop'">
              </div>
              <div v-else>
                <div v-if="this.env_name == 'prd'">
                    <a-form-item
                      label="域名配置"
                      :label-col="{ span: 7 }"
                      :wrapper-col="{ span: 12 }"
                    >
                        <a-input
                            v-decorator="[
                              'domain_middle',
                              { rules: [
                                          { 
                                            required: true, 
                                            message: '域名不合法',
                                          },
                                      ],
                                initialValue: 'None'
                              },
                            ]"
                            placeholder='如果不使用域名，输入None'
                            :disabled="isEditing"
                        >
                          <a-select slot="addonBefore" style="width: 90px" v-decorator="['domain_before',{ rules: [{required: true}],initialValue: 'http://' }]" >
                            <a-select-option value="http://">
                              http://
                            </a-select-option>
                            <a-select-option value="https://">
                              https://
                            </a-select-option>
                          </a-select>
                          <a-select :disabled="isEditing" slot="addonAfter"
                          v-decorator="['domain_after',{rules: [{required: true }], initialValue: '.dm-ai.com' }]" >                  
                              <a-select-option
                                v-for="env in ['.dm-ai.cn','dm-ai.com']" :key='env'>{{ env }} 
                              </a-select-option>
                          </a-select>
                        </a-input>
                        <a-input
                            v-decorator="[
                              'domain_path',
                              { rules: [
                                          { 
                                            required: false, 
                                            message: '域名URI（path）' 
                                          },
                                          
                                      ],
                                initialValue: 'None'
                              },
                            ]"
                          placeholder="子路径匹配，比如 /api/v1/storage-api"
                        >
                        </a-input>
                      
                    </a-form-item>
                </div>
                <div v-else>
                    <a-form-item
                      label="域名配置"
                      :label-col="{ span: 7 }"
                      :wrapper-col="{ span: 12 }"
                    >
                        <a-input
                            v-decorator="[
                              'domain_middle',
                              { rules: [
                                          { 
                                            required: true, 
                                            message: '域名不合法',
                                          },
                                          { validator: isDomainMiddle },
                                      ],
                                initialValue: this.app_name
                              },
                              
                            ]"
                            placeholder='如果不使用域名，输入None'
                            :disabled="isEditing"
                        >
                          <a-select slot="addonBefore" style="width: 90px" v-decorator="['domain_before',{ rules: [{required: true}],initialValue: 'http://' }]" >
                            <a-select-option value="http://">
                              http://
                            </a-select-option>
                            <a-select-option value="https://">
                              https://
                            </a-select-option>
                          </a-select>
                          <a-select :disabled="isEditing" 
                          slot="addonAfter" 
                          v-decorator="['domain_after',{rules: [{required: true}], initialValue: '-'+form.getFieldValue('k8s_namespace')+'.'+this.env_name+'.dm-ai.com'}]" >                  
                              <a-select-option 
                                v-for="env in ['-'+form.getFieldValue('k8s_namespace')+'.'+this.env_name+'.dm-ai.cn','-'+form.getFieldValue('k8s_namespace')+'.'+this.env_name+'.dm-ai.com']" :key='env' 
                              >
                              {{ env }} 
                              </a-select-option>
                          </a-select>
                          
                        </a-input>
                        <a-input
                            v-decorator="[
                              'domain_path',
                              { rules: [
                                          { 
                                            required: false, 
                                            message: '域名URI（path）' 
                                          },
                                          
                                      ],
                                  initialValue: 'None'
                              },
                            ]"
                          placeholder="子路径匹配，比如 /api/v1/storage-api"
                        >
                        </a-input>
                      
                    </a-form-item>
                </div>
              </div>
              <a-form-item
                label="是否开启pod反亲和(多副本不运行在同一节点)"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 12 }"
              >
                <a-switch
                  v-decorator="[
                    'if_use_pod_anti_affinity',
                    {
                      valuePropName: 'checked',
                      rules: [{ required: this.ifDeploy }],
                      initialValue: false,
                    },
                  ]"
                ></a-switch>
              </a-form-item>
              <a-form-item
                label="是否使用apollo配置中心"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 12 }"
              >
                <a-switch
                  v-decorator="[
                    'if_use_apollo',
                    {
                      valuePropName: 'checked',
                      rules: [{ required: this.ifDeploy }],
                      initialValue: false,
                    },
                  ]"
                  @change="switchIfUseApollo"
                ></a-switch>
              </a-form-item>
              <a-form-item label="apollo集群" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" v-show="form.getFieldValue('if_use_apollo')">
                  <a-input
                    v-decorator="[
                      'apollo_cluster_name',
                      {
                        rules: [{ required: this.ifUseApollo, message: '请输入apollo集群名称' }],
                        initialValue: 'default',
                      },
                    ]"
                    :readOnly="readOnly"
                  />
              </a-form-item>
              <a-form-item label="apollo空间" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }" v-show="form.getFieldValue('if_use_apollo')">
                <a-input
                  v-decorator="[
                    'apollo_namespace',
                    {
                      rules: [{ required: this.ifUseApollo, message: 'apollo命名空间' }],
                      initialValue: 'application',
                    },
                  ]"
                  :readOnly="readOnly"
                />
              </a-form-item>
          </div>
        </div>
      </a-form>
    </a-modal>

    <a-modal title="批量构建"
      :maskClosable="false"
      :visible="deployModalVisible"
      @ok="multiDeploy"
      :confirmLoading="confirmLoading"
      @cancel="handleCancel"
    >
      <a-form :form="multiDeployForm">
        <a-form-item label="上线环境" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
          <a-select
            v-decorator="['envid', { rules: [{ required: true, message: '请选择上线环境!' }] }]"
            showSearch
            optionFilterProp="children"
            :filterOption="false"
            placeholder="请选择上线环境"
            @search="value => handleEnvSearch(value)"
          >
            <a-select-option v-for="env in environmentList" :key="env.id" :value="env.id">{{ env.name }} </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="GitTag" :label-col="{ span: 7 }" :wrapper-col="{ span: 12 }">
          <a-input
            v-decorator="[
              'tag',
              {
                rules: [{ message: '请输入上线版本GitTags 默认用各服务现有的配置' }],
                initialValue: '',
              },
            ]"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal title="查看构建情况"
      :maskClosable="false"
      :visible="viewOnlineStatus"
      @ok="handleOnlineViewCancel"
      @cancel="handleOnlineViewCancel"
      width="1200px"
      height="700px"
    >
      <div width="100%" height="100%">
        <iframe :src="onlineSrc" width="1150px" height="700px" />
      </div>
    </a-modal>
    <a-passwd-check></a-passwd-check>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import Cookies from 'js-cookie';
import { namespace } from 'vuex-class';
import { Button, Col, Dropdown, Form, Icon, Input, Menu, message, Modal, Row, Select, Radio, Switch, Table, Checkbox } from 'ant-design-vue';
import moment from 'moment';
import EnvironmentService from '@/service/environment';
import SpaceService from '@/service/space';
import ProjectService from '@/service/project';
import DeploymentService from '@/service/deployment';
import UserService from '@/service/user';
import PasswdCheck from '@/components/Passwd.vue';
import { ServiceBuildStatusSendUrl, sleep } from '@/const';

const passwdModule = namespace('Passwd');
const environmentService = EnvironmentService.getEnvironmentService();
const spaceService = SpaceService.getSpaceService();
const projectService = ProjectService.getProjectService();
const deploymentService = DeploymentService.getDeploymentService();
const userService = UserService.getUserService();

@Component({
  components: {
    AButton: Button,
    AIcon: Icon,
    AInput: Input,
    AInputSearch: Input.Search,
    AForm: Form,
    AFormItem: Form.Item,
    ACheckboxGroup: Checkbox.Group,
    AModal: Modal,
    ASelect: Select,
    ARadio: Radio,
    ARadioGroup: Radio.Group,
    ASelectOption: Select.Option,
    ASwitch: Switch,
    ATable: Table,
    AMenu: Menu,
    AMenuItem: Menu.Item,
    ADropdown: Dropdown,
    APasswdCheck: PasswdCheck,
    ARow: Row,
    ACol: Col,
    ATextarea: Input.TextArea,
  },
})
export default class AdpDeploymentManagement extends Vue {
  @passwdModule.Getter('show') private deleteModalVisible!: boolean;
  @passwdModule.Getter('res') private resPasswd!: boolean;
  @passwdModule.Action('UPDATE_STATE_ASYN') private updatePasswdStatus;

  // 分页相关
  paginationConfig!: any; // 表单分页器的配置项
  totalCount: number = 0; // 总条目
  size: number = 15; // 每页条目数
  page: number = 1; // 当前页码
  isSpinning: boolean = false;
  private tableSearchForm: any;
  editId: number = 0;
  postData: any = {};
  userPostData: any = {};
  g_project: any = {};
  g_deploy: any = {};
  timeout: any = null;
  timer: any = null;
  inputSearch = '';
  searchTimeOut: any = null;
  private deploySearchFromExpand: boolean = false;

  readOnly = false;
  viewModalVisible = false;
  viewOnlineStatus = false;
  onlineSrc = '';

  private serviceBuildStatusSendUrl: string = ServiceBuildStatusSendUrl;
  private eventSource: any;
  private passwd: string = '198538';
  private moment: any = moment;
  private environmentList: IEnvironment[] = [];
  private spaceList: ISpace[] = [];
  private projectList: IProject[] = [];
  private projectBranchList: string[] = [];
  private projectTagList: string[] = [];
  private projectAllTagList: string[] = [];
  private userList: IUser[] = [];
  private userListAllV1: IUserV2[] = [];
  private userListV1: any[] = [];
  private projectListAllV1: IProjectV1[] = [];
  private projectListAllV2: IProjectV2[] = [];
  private projectListV1: IProjectV1[] = [];
  private projectListV2: IProjectV2[] = [];
  private deploymentList: IDeployment[] = [];
  private statusText: any = {
    pending: '等待审核',
    reviewed: '等待构建',
    building: '构建中',
    online: '构建通过',
    offline: '下线',
    failed: '构建失败',
  };
  // 可选行
  private selectedRowKeys: any[] = [];

  private rowSelection: any = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.selectedRowKeys.length = 0;
      this.selectedRowKeys.push(...selectedRowKeys);
      console.log(`selectedRowKeys: ${this.selectedRowKeys}`);
    },
  };

  private tableColumns: IAntTableColumn[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      // key: 'name',
      // width: '10%',
      width: 50,
    },
    {
      title: '工单名',
      dataIndex: 'name',
      // key: 'name',
      // width: '10%',
      width: 200,
    },
    {
      title: '应用名',
      dataIndex: 'app_name',
      // key: 'app_name',
      // width: '10%',
      width: 200,
    },
    {
      title: '用户名',
      dataIndex: 'owner_china_name',
      // key: 'owner_china_name',
      // width: '3%',
      width: 60,
    },
    {
      title: '分支名',
      dataIndex: 'branch',
      // key: 'branch',
      width: 100,
    },
    {
      title: '环境名',
      dataIndex: 'env_name',
      // key: 'env_name',
      width: 88,
    },
    {
      title: '代码版本控制方式',
      dataIndex: 'version_control_mode',
      // key: 'version_control_mode',
      width: 93,
    },
    {
      title: 'GitTag',
      dataIndex: 'git_tag',
      // key: 'git_tag',
      width: 60,
    },
    {
      title: 'CommitId',
      dataIndex: 'git_commit_id',
      // key: 'git_commit_id',
      width: 340,
    },
    {
      title: '最新构建时间',
      dataIndex: 'last_deploy',
      // key: 'last_deploy',
      // width: 60,
    },
    {
      title: '状态',
      dataIndex: 'status',
      // key: 'status',
      width: 83,
      fixed: 'right',
      sorter: (a, b) => a.status.localeCompare(b.status),
      slots: { title: 'customStatus' },
      scopedSlots: { customRender: 'status' },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      // key: 'operation',
      width: 316,
      fixed: 'right',
      scopedSlots: { customRender: 'operation' },
    },
  ];
  private addModalVisible: boolean = false;
  private deployModalVisible: boolean = false;
  private form: any;
  private multiDeployForm: any;
  private confirmLoading: boolean = false;

  private showReviewBUttonOne(record: any) {
    if (record.status !== 'reviewed' && record.env_name === 'prd') {
      return true;
    }
    return false;
  }

  private showReviewBUttonTwo(record: any) {
    if (record.status === 'reviewed' && record.env_name === 'prd') {
      return true;
    }
    return false;
  }

  private showBuildButtonOne(record: any) {
    if (record.env_name === 'prd' && record.status === 'reviewed') {
      return true;
    } else if (record.env_name !== 'prd') {
      return true;
    }
    return false;
  }

  private showBuildButtonTwo(record: any) {
    if (record.env_name === 'prd' && record.status !== 'reviewed') {
      return true;
    } else if (record.env_name !== 'prd') {
      return false;
    }
    return false;
  }

  handleEnvSearch(value: any) {
    console.log(value);
    this.environmentList = [];
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(() => {
      this.searchEnvCandidate(value);
    }, 300);
  }

  private getProjectInfoWithProjectId(id: any) {
    let projectInfo: any;
    this.projectList.map((item: any) => {
      if (item['id'] == id) {
        projectInfo = item;
      }
      return item;
    });
    return projectInfo;
  }

  private readCookie() {
    if (Cookies.get('deploySearchFromExpand') == undefined) {
      Cookies.set('deploySearchFromExpand', true);
    }
    let deploySearchFromExpand = Cookies.get('deploySearchFromExpand');
    if (deploySearchFromExpand == 'false') {
      this.deploySearchFromExpand = false;
      this.removeCookie();
    } else {
      this.deploySearchFromExpand = true;
    }
    // init
    this.tableSearchForm.setFieldsValue({
      env_name: Cookies.get('x--1') ? JSON.parse(Cookies.get('x--1')) : [],
      deploy_namespace: Cookies.get('x--2') ? JSON.parse(Cookies.get('x--2')) : [],
      owner_name: Cookies.get('x--3') ? JSON.parse(Cookies.get('x--3')) : [],
      app_name: Cookies.get('x--4') ? JSON.parse(Cookies.get('x--4')) : [],
    });
  }

  private adpTableSearchFromToggle() {
    this.deploySearchFromExpand = !this.deploySearchFromExpand;
    Cookies.set('deploySearchFromExpand', this.deploySearchFromExpand);
    if (!this.deploySearchFromExpand) {
      this.readCookie();
      this.tableSearchForm.resetFields();
    }
    this.page = 1;
    this.$nextTick(() => {
      this.fetchProjectList();
    });
  }

  isNumber(r, v, cb) {
    if (!v) {
      cb(false);
    } else {
      v = parseFloat(v);
      if (v <= 0) {
        cb('请输入正整数');
      } else {
        if (Number.isInteger(v)) {
          if (v >= 60) {
            cb('pod的数量限制不超过60');
          }
          cb();
        } else {
          cb('请输入正整数');
        }
      }
    }
  }
  isDomainMiddle(r, v, cb) {
    if (!v) {
      cb(false);
    } else {
      let regRule = new RegExp('^[A-Za-z0-9][A-Za-z0-9-]+$', 'i');
      if (v.indexOf(".") !=-1 ) {
        cb('不能使用多级子域名，即不能带 .')
      }else if(!regRule.test(v)){
          cb('仅支持字母、数字、- , 且不能用-开头');
      } else {
        cb()
      } 
    }
  }

  private adpTableSearchFromHandleReset() {
    this.removeCookie();
    this.tableSearchForm.resetFields();
    this.page = 1;
    this.$nextTick(() => {
      this.fetchDeploymentList();
    });
  }

  private removeCookie() {
    Cookies.set('x--1', []);
    Cookies.set('x--2', []);
    Cookies.set('x--3', []);
    Cookies.set('x--4', []);
  }

  async setProjectBranchList(value: any) {
    this.projectBranchList = await this.getProjectBranchList(value);
  }


  async getProjectBranchList(value: any) {
    return ((await projectService.getProjectBranches({
      http_url_to_repo: value,
    })) as any).data;
  }

  async searchEnvCandidate(value: any) {
    let res: any = await environmentService.getEnvironmentList({
      name: value,
    });
    console.log(res);
    this.environmentList = res.data.map((item: any) => {
      let newItem = JSON.parse(JSON.stringify(item));
      newItem.key = item.id;
      return newItem;
    });
  }

  async setGitlabTags(value: any) {
    let res: any = await projectService.getGitlabProjectTags({
      http_url_to_repo: value,
    });
    this.projectAllTagList = res.data;
    this.projectTagList = res.data;
  }

  async searchSpaceCandidate(value: any) {
    let res: any = await spaceService.getSpaceList({
      name: value,
    });

    this.spaceList = res.data.map((item: any) => {
      let newItem = JSON.parse(JSON.stringify(item));
      newItem.key = item.name;
      return newItem;
    });
    console.log(this.environmentList);
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
      return newItem;
    });
    console.log(this.userList);
    this.$nextTick(() => this.$forceUpdate());
  }

  private async getUserInfoV2() {
    let res: any = await userService.getUserInfoV2({ name: '' });
    this.userListAllV1 = res.data;
    this.userListV1 = this.userListAllV1;
    // this.userListV1 = this.userListAllV1.slice(0, 15);
  }

  handleOwnerSearch(value: any) {
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

  handleProjSearch(value: any) {
    console.log(value);
    this.projectList = [];
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(() => {
      this.searchProjCandidate(value);
    }, 300);
  }

  private async getK8sNamespaceFromProjectInfo(value: number) {
    const item = this.projectListAllV2.filter(val => val.id == value)[0];

    this.ifDeploy = item['if_deploy'];
    this.if_use_auto_deploy_file = item['if_use_auto_deploy_file'];	
    this.deploy_env_type = item['deploy_env_type'];
    this.serve_type = item['serve_type'];
    this.app_name = item['name'];
    let gitRepository: string = item.git_repository;
    if (this.editId == 0) {
      this.form.setFieldsValue({
        k8s_namespace: item['owned_product'],
        language_type: item['language_type'],
      });
      gitRepository = item['git_repository'];
    }
    this.form.setFieldsValue({ app_id: item.id });
    this.setProjectBranchList(gitRepository);
    this.setGitlabTags(gitRepository);
  }

  private async adpTableSearchFromHandleChange(cookieName: string, value: any) {
    await sleep(300);
    Cookies.set(cookieName, value);
    this.page = 1;
    this.$nextTick(() => {
      this.fetchDeploymentList();
    });
  }

  handleSpaceSearch(value: any) {
    console.log(value);
    this.spaceList = [];
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(() => {
      this.searchSpaceCandidate(value);
    }, 300);
  }

  async searchProjCandidate(value: any) {
    try {
      let res: any = await projectService.getProjectList({
        name: value,
      });
      console.log(res);
      this.projectList = res.data.map((item: any) => {
        let newItem = JSON.parse(JSON.stringify(item));
        newItem.key = item.id;
        return newItem;
      });
      console.log(123456789);
      console.log(this.projectList);
    } catch (err) {
      console.log(err);
      message.error(err.message);
    }
  }

  private fetchData() {
    this.fetchDeploymentList();
    this.fetchSpaceList('');
    this.fetchprojectListAllV1();
    this.getUserInfoV2();

    this.fetchprojectListAllV2();
    this.searchEnvCandidate('');
    this.searchSpaceCandidate('');
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

  private async fetchEnvironmentList() {
    try {
      let res: any = await environmentService.getEnvironmentList({
        ...this.postData,
        page: this.page,
        size: this.size,
      });
      console.log(res);
      this.environmentList = res.data;
      return res;
    } catch (error) {
      console.error(error);
    }
  }

  private async fetchProjectList() {
    let res: any = await projectService.getProjectList({
      name: '',
    });
    this.projectList = res.data.res;
  }

  private async fetchprojectListAllV1() {
    let res: any = await projectService.getProjectIdNameList({
      name: '',
    });
    this.projectListAllV1 = res.data;
    this.projectListV1 = this.projectListAllV1.slice(0, 15);
  }

  private async fetchprojectListAllV2() {
    let res: any = await projectService.getProjectV2IdNameGitLangProductList({
      name: '',
    });
    this.projectListAllV2 = res.data;
    this.projectListV2 = this.projectListAllV2;
  }

  private async fetchDeploymentList() {
    this.isSpinning = true;
    try {
      let res: any = await deploymentService.getDeploy({
        ...this.postData,
        env_name: this.tableSearchForm.getFieldValue('env_name').join(','),
        deploy_namespace: this.tableSearchForm.getFieldValue('deploy_namespace').join(','),
        owner_name: this.tableSearchForm.getFieldValue('owner_name').join(','),
        app_name: this.tableSearchForm.getFieldValue('app_name').join(','),
        page: this.page,
        size: this.size,
      });
      // console.log('搜索结果' + res);
      this.deploymentList = res.data;
      this.totalCount = res.count;
      this.paginationConfig.total = this.totalCount;
      // console.log(this.paginationConfig);
      this.paginationConfig = JSON.parse(JSON.stringify(this.paginationConfig));
      this.isSpinning = false;
      this.$forceUpdate();
      return res.data;
    } catch (error) {
      console.error(error);
    }
  }

  private async handleReview(record) {
    // password check
    if (record.env_name == 'prd') {
      this.updatePasswdStatus({ show: true, res: false });
      await sleep(100);
      while (this.deleteModalVisible) {
        await sleep(300);
        console.log('deleteModalVisible is true');
      }
      if (!this.resPasswd) return;
    }

    try {
      record.status = 'reviewed';
      await deploymentService.updateDeploymentItem(record.id, record);
    } catch (err) {
      message.error(err.message);
    }
    this.fetchDeploymentList();
  }

  private async reHandleReview(record) {
    console.log('再次审核', record);
    if (['online', 'failed', 'building', 'reviewed'].indexOf(record.status) != -1) {
      try {
        record.status = 'pending';
        console.log(record);
        await deploymentService.updateDeploymentItem(record.id, record);
      } catch (err) {
        console.log(err);
        message.error(err.message);
      }
      this.fetchDeploymentList();
    } else {
      message.warning('上线单不在失败或者已上线状态中，无法再次审核，有问题请联系管理员。');
    }
  }

  private async handleMenuClick(e: any, record: any) {
    let app_name: string = record.app_name;
    let namespace: string;
    let deploy_env: string;

    if (record.app_id) {
      try {
        let res: any = await projectService.getProjectById(record.app_id);
        if (res.status == 'ok') {
          namespace = res.data.owned_product;
          deploy_env = record.env_name;
          if (e.key == 'grafana') {
            window.open(
              'http://grafana.ops.dm-ai.cn/d/k8s-pod/k8s-podjian-kong?orgId=1&var-Datasource=k8s-' +
                deploy_env +
                '&var-Namespace=' +
                namespace +
                '&var-Deployment=' +
                app_name +
                '&var-Statefulset=All&var-Daemonset=All&var-Node=All&var-interval=$__auto_interval_interval'
            );
          }
          if (e.key == 'k8s') {
            if (deploy_env == 'prd') {
              message.error('prd环境的k8s-dashboard面板，非运维人员无法使用');
              return;
            }
            window.open('http://k8s.' + deploy_env + '.dm-ai.com/#/service/' + namespace + '/' + app_name + '?namespace=' + namespace);
          }
          if (e.key == 'prometheus') {
            window.open('http://prometheus.ops.dm-ai.cn/alerts');
          }

          if (e.key == 'codeCheck') {
            window.open(res.data.git_repository);
          }

          if (e.key == 'kibana') {
            window.open(
              'http://kibana.dm-ai.cn/app/kibana#/discover?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1h,to:now))' +
                `&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:k8s-${deploy_env},` +
                +`key:k8s_pod_namespace,negate:!f,params:(query:${namespace}),type:phrase,value:${namespace}),query:(match:(k8s_pod_namespace:(query:${namespace},type:phrase)))),` +
                `('$state':(store:appState),meta:(alias:!n,disabled:!f,index:k8s-${deploy_env},` +
                `key:k8s_container_name,negate:!f,params:(query:${app_name}),type:phrase,value:dmaip-p2r01)` +
                `,query:(match:(k8s_container_name:(query:${app_name},type:phrase))))),index:k8s-${deploy_env},interval:auto,query:(language:kuery,query:''),sort:!(time,desc))`
            );
          }
        }
      } catch (err) {
        message.error('获取 project 信息失败， 联系管理员。');
      }
    }
  }

  private get prometheusAddress(): string {
    return 'http://prometheus.ops.dm-ai.cn/alerts';
  }

  private get k8sUrl(): string {
    return 'http://' + this.g_deploy.env_name + '.k8s.dm-ai.cn/#!/pod?namespace=' + this.g_project.owned_product;
  }

  private async userListV1Computed(val: string) {
    await sleep(300);
    let patt = new RegExp(val, 'i');
    this.userListV1 = this.userListAllV1.filter((value: IUserV2) => {
      if (patt.test(value.owner_english_name) || patt.test(value.owner_china_name)) {
        return true;
      } else {
        return false;
      }
    });
    // this.userListV1 = this.userListV1.slice(0, 15);
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

  private async projectListV2Computed(val: string) {
    await sleep(300);
    let patt = new RegExp(val, 'i');
    this.projectListV2 = this.projectListAllV2.filter((value: IProjectV2) => {
      if (patt.test(value.name)) {
        return true;
      } else {
        return false;
      }
    });
    this.projectListV2 = this.projectListV2.slice(0, 15);
  }

  private async kubernetesAddress(record: any) {
    console.log('get k8s address');
    if (record.app_id) {
      try {
        let res: any = await projectService.getProjectById(record.app_id);
        console.log(res);
        if (res.status === 'ok') {
          this.g_deploy = record;
          this.g_project = res.data;
        } else {
          throw res.info;
        }
      } catch (err) {
        message.error('获取 project 信息失败， 联系管理员。');
      }
    }
    return '';
  }

  private ifEnableDeploy: boolean =false;
  private async handleDeploy(record: any) {
    try {
      // 准备上线
      this.ifEnableDeploy = true
      await setTimeout(() => { //10秒钟之内禁止点击构建按钮
      this.ifEnableDeploy = false
      }, 10000)

      let res: any = await deploymentService.itemOnline(record.id);
      console.log(res);
      if (res.res === 'ok') {
        message.success('开始构建！注意10s内禁止再次点击构建按钮', 10);
      } else {
        throw res.msg;
      }
      await this.fetchDeploymentList();
      this.$nextTick(() => this.handleViewOnline(this.deploymentList.find((item: any) => item.id === record.id)));
    } catch (err) {
      message.error('上线失败,' + String(err) + ',请联系管理员');
      console.log(err);
      this.fetchDeploymentList();
    }
  }

 
  handleViewCancel() {
    this.viewModalVisible = false;
    this.readOnly = false;
  }

  handleOnlineViewCancel() {
    this.viewOnlineStatus = false;
    this.onlineSrc = '';
  }

  private handleView(record) {
    // TODO, jump to jenkins
    console.log('查看', record);
    this.readOnly = true;
    this.viewModalVisible = true;
    this.editId = record.id;
    console.log(this.editId);
    this.$nextTick(() => {
      this.form.setFieldsValue(record);
    });
  }

  handleViewOnline(record) {
    console.log('查看上线', record);
    try {
      if (record.last_build_info && record.last_build_info.length > 0) {
        // record.last_build_info = record.last_build_info.replace(/'([^']*)'/g, `"$1"`);
        console.log(record.last_build_info);
        let last_build_info = JSON.parse(record.last_build_info);
        console.log(last_build_info);
        if (last_build_info.url && last_build_info.url.length && last_build_info.url != 'kongkong') {
          window.open(last_build_info.url);
          // this.onlineSrc = last_build_info.url;
          // this.viewOnlineStatus = true;
        } else {
          throw last_build_info.info;
        }
      } else {
        message.error('还未上线过，无法查看上线情况');
      }
    } catch (err) {
      console.log(err);
      message.error('上线失败，请联系管理员');
    }
  }

  async deleteOneItem(record) {
    try {
      await deploymentService.deleteDeploymentItem(record.id);
      return this.fetchDeploymentList();
    } catch (err) {
      console.log(err);
      message.error(err.message);
    }
  }

  private handleDelete(record) {
    // TODO delete api
    console.log('删除', record);
    let that = this;
    Modal.confirm({
      title: '确认删除该上线单？',
      content: '注意！该操作不可恢复！',
      okType: 'danger',
      async onOk() {
        that.deleteOneItem(record);
      },
      async onCancel() {
        // 没有变化
      },
    });
  }

  private handleRevert(record) {
    // TODO revert api
    console.log('回退', record);
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
    this.fetchDeploymentList();
  }

  private async openAddDeploymentModal() {
    this.editId = 0;
    this.form.resetFields();
    this.addModalVisible = true;
  }

  private async openMultiDeploymentModal() {
    if (this.selectedRowKeys.length == 0) {
      message.warn('请先选择要构建的应用');
      return;
    }
    this.editId = 0;
    this.multiDeployForm.resetFields();
    this.deployModalVisible = true;
  }

  private gpuTypeMemList: string[] = [];
  private gpuTypeCardList: string[] = [];
  private changeGpuTypeState(gpuControlMode){
    if(gpuControlMode=='mem'){
      if(this.gpuTypeMemList.length==1 && this.gpuTypeMemList[0]=='该环境没有gpu卡'){  //当存在显卡时才添加all选项
                this.form.setFieldsValue({
                  'gpu_type': this.gpuTypeMemList[0]
                }) 
          }else{
                if(!this.gpuTypeMemList.includes("all")){
                    this.gpuTypeMemList.push("all")       //允许选择所有，即不介意类型，第二次点进来
                }
                
        }
    }

    if(gpuControlMode=='pod'){
      if(this.gpuTypeCardList.length==1 && this.gpuTypeCardList[0]=='该环境没有gpu卡'){  //当存在显卡时才添加all选项
                this.form.setFieldsValue({
                  'gpu_type': this.gpuTypeCardList[0]
                }) 
          }else{
                if(!this.gpuTypeMemList.includes("all")){
                    this.gpuTypeMemList.push("all")       //允许选择所有，即不介意类型，第二次点进来
                }
        }
    }

  }

  private async handlerChageSomeField(value){
    for( let i = 0; i < this.environmentList.length;i++ ){
      if(this.environmentList[i]["id"] == value){
        this.gpuTypeMemList = this.environmentList[i]["gpu_type_by_mem"].split(",");
        this.gpuTypeCardList = this.environmentList[i]["gpu_type_by_card"].split(",");
        this.changeGpuTypeState('mem')
        this.changeGpuTypeState('pod')
        this.env_name=this.environmentList[i]["name"]
        this.env_status=this.environmentList[i]["status"]
        break
      }
    }
  }

  private ifDeploy: boolean = false;
  private deploy_env_type: string = "";
  private if_use_auto_deploy_file: boolean = false;
  private serve_type: string = "";
  private app_name: string = "";
  private env_name: string = "";
  private env_status: string = "";


  private async openEditorDeploymentModal(record) {
    var item = this.projectListAllV2.filter(val => val.name == record.app_name)[0];
    this.ifDeploy = item['if_deploy'];
    this.deploy_env_type = item['deploy_env_type'];
    this.if_use_auto_deploy_file = item['if_use_auto_deploy_file'];

	
    this.serve_type = item['serve_type'];
    this.app_name = record.app_name;
    this.form.resetFields();
    this.addModalVisible = true;
    this.editId = record.id;
    this.projectBranchList = [];
    this.userListV1 = this.userListAllV1;
    this.setProjectBranchList(record.git_repository);
    this.setGitlabTags(record.git_repository);
    this.handlerChageSomeField(record.env_id); //gpu类型列表更新
    record.yaml_env = record.yaml_env.replace(/\|\|\|/g,"\n") //展示前，格式化

    this.$nextTick(() => {
      this.form.setFieldsValue(record);
    });
  }

  get isEditing() {
    return this.editId != 0;
  }

 private async handleCopy(record) {
    var item = this.projectListAllV2.filter(val => val.name == record.app_name)[0];
    this.ifDeploy = item['if_deploy'];
    this.deploy_env_type = item['deploy_env_type'];
    this.if_use_auto_deploy_file = item['if_use_auto_deploy_file'];
    console.log('复制', record);
    this.addModalVisible = true;
    this.editId = 0;
    record.name = record.name + '-' + moment().format();
    this.app_name = record.app_name;
    this.env_status = 'stop';
    this.$nextTick(() => {
      this.form.setFieldsValue(record);
    });
  }



  private handleCancel() {
    this.addModalVisible = false;
    this.deployModalVisible = false;

    this.readOnly = false;
    this.form.resetFields();
    this.editId = 0;
  }

  private addDeployment() {
    this.confirmLoading = true;
    this.form.validateFields(async err => {
      if (!err) {
        console.log('success', this.form.getFieldsValue());
        var res :any
        try {
          this.form.setFieldsValue(
            {
              env_id:               this.form.getFieldValue('env_id') ? this.form.getFieldValue('env_id'):9, //不需要部署的工单，不需要配置env_id，会导致env_id=0,无法查看
              pod_nums:             +this.form.getFieldValue('pod_nums'),
              gpu_card_count:       +this.form.getFieldValue('gpu_card_count'),
              gpu_mem_count:        +this.form.getFieldValue('gpu_mem_count'),
              memory_max_require:   +this.form.getFieldValue('memory_max_require'),
              memory_min_require:   +this.form.getFieldValue('memory_min_require'),
              cpu_min_require:      +this.form.getFieldValue('cpu_min_require'),
              cpu_max_require:      +this.form.getFieldValue('cpu_max_require'),
              gpu_type:             this.form.getFieldValue('gpu_type') ? this.form.getFieldValue('gpu_type').toString():"all",
              yaml_env:             this.form.getFieldValue('yaml_env') ? (this.form.getFieldValue('yaml_env')==""?"None":this.form.getFieldValue('yaml_env').replace(/\n/g,"|||").replace(/\s/g,"")):"None",
            }
          )  

           if (this.editId) {
            res = await deploymentService.updateDeploymentItem(this.editId, { ...this.form.getFieldsValue() });
            this.editId = 0;
          } else {
            res = await deploymentService.addDeploymentItem({ ...this.form.getFieldsValue() });
          }
          this.confirmLoading = false;
          this.handleCancel();
          if(res.code!=0){
              message.error('保存失败，错误原因:' + String(res.res));
          }
          return this.fetchDeploymentList();
        } catch (err) {
          this.editId = 0;
          this.confirmLoading = false;
          message.error('更新失败,' + String(err) + ',请联系管理员');
          this.handleCancel();
        }
      }
      this.confirmLoading = false;
    });
  }

  private multiDeploy() {
    this.confirmLoading = true;
    this.multiDeployForm.validateFields(async err => {
      if (!err) {
        try {
          let params = this.multiDeployForm.getFieldsValue();
          params['ids'] = this.selectedRowKeys;
          console.log('params', params);
          await deploymentService.multiDeploy(params);

          await this.fetchDeploymentList();
        } catch (err) {
          console.log(err);
          message.error(err.message);
        }
      }

      this.confirmLoading = false;
      this.handleCancel();
    });
  }

  private findOwner(input, option) {
    return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) > -1;
  }

  onPageChange(data: any) {
    console.log(data);
    this.page = data.current;
    this.paginationConfig.current = this.page;
    this.fetchDeploymentList();
  }

  created() {
    // 初始化分页器
    this.paginationConfig = {
      showTotal: (total: any) => `共 ${total} 个上线单`,
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

  private useEventSource() {
    let that = this;
    this.eventSource = new EventSource('/events', { withCredentials: true });
    this.eventSource.onopen = function(e) {
      console.log('connect event source!!');
    };
    this.eventSource.onmessage = function(e) {
      let jenkinsBuildTokens: string = e.data;
      for (let k in that.deploymentList) {
        if (jenkinsBuildTokens.indexOf(that.deploymentList[k]['jenkins_build_token']) !== -1) {
          that.fetchDeploymentList();
        }
      }
    };
  }

  private mounted() {
    this.readCookie();
    this.fetchData();
    this.useEventSource();
  }

  private beforeCreate() {
    this.form = this.$form.createForm(this);
    this.multiDeployForm = this.$form.createForm(this);
    this.tableSearchForm = this.$form.createForm(this);
  }

  private destroyed() {
    clearInterval(this.timer);
    this.eventSource.close();
  }
  private ifStorageLocale: boolean = false;
  private switchIfStorageLocale(checked) {
    this.ifStorageLocale = checked;
    this.form.resetFields(['storage_path']);
  }
  private ifUseApollo: boolean = true;
  private switchIfUseApollo(checked) {
    this.ifUseApollo = checked;
    this.form.resetFields(['if_use_apollo']);
  }

  private ifUseApolloForDockerfile: boolean = false;
  private switchIfUseApolloForDockerfile(checked) {
    this.ifUseApolloForDockerfile = checked;
    this.form.resetFields(['if_use_apollo_for_dockerfile']);
  }

  cpuMaxValidator(r, v, cb) {
    console.log(v);
    if (!v) {
      cb(false);
    } else {
      console.log(typeof v);
      v = parseFloat(v);
      console.log(v);
      if (v < 0) {
        cb('请输入整数');
      } else {
        if (Number.isInteger(v)) {
          let x = this.form.getFieldsValue()['cpu_min_require'] || 1;
          x = parseInt(x, 10);
          console.log('cpu_min_require', x);
          if (x <= v) {
            cb();
          } else {
            cb('cpu最高要求需要大于等于最低需求');
          }
        } else {
          cb('请输入整数');
        }
      }
    }
  }

  cpuMinValidator(r, v, cb) {
    console.log(r);
    console.log(v);
    if (!v) {
      cb(false);
    } else {
      console.log(typeof v);
      v = parseFloat(v);
      console.log(v);
      if (v < 0) {
        cb('请输入整数');
      } else {
        if (Number.isInteger(v)) {
          cb();
        } else {
          cb('请输入整数');
        }
      }
    }
  }
  memMaxValidator(r, v, cb) {
    console.log(v);
    if (!v) {
      cb(false);
    } else {
      console.log(typeof v);
      v = parseFloat(v);
      console.log(v);
      if (v < 0) {
        cb('请输入整数');
      } else {
        if (Number.isInteger(v)) {
          let x = this.form.getFieldsValue()['memory_min_require'] || 1;
          x = parseInt(x, 10);
          console.log('cpu_min_require', x);
          if (x <= v) {
            cb();
          } else {
            cb('内存最高要求需要大于等于最低需求');
          }
        } else {
          cb('请输入整数');
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.adp-management-table-completed {
  color: gray;
  width: 80px;
  height: 100%;
  padding: 16px;
  padding-left: 0;
  margin-right: 24px;
}
</style>
<style lang="scss">
.adp-deployment-management-table .ant-table-tbody > tr > td {
  padding-left: 4px;
  padding-right: 4px;
  padding-top: 16px;
  padding-bottom: 16px;
  scroll-padding: 50%;
  // white-space:nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.adp-deployment-management-table .ant-table-bordered .ant-table-thead > tr > th {
  padding-left: 4px;
  padding-right: 4px;
  padding-top: 16px;
  padding-bottom: 16px;
  // white-space:nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

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