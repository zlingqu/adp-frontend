# adp-frontend
# dm 应用发布平台 前端

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Lints and fixes files
```
yarn run lint
```

### Run your unit tests
```
yarn run test:unit
```


## 文件目录结构
```shell
├── src                        // 源代码
│   ├── api                    // 所有请求
│   │    ├── apis              // 直接请求接口，按模块分
│   │    ├── fetch             // fetch配置
│   │    └── mock              // 假数据生成
│   ├── assets                 // 静态资源文件
│   ├── components             // 全局UI组件，跨模块复用型；如chart，nav等
│   ├── const                  // 项目内常量，如中国行政区域划分等
│   ├── interface              // 接口声明
│   ├── service                // 对请求获取到的数据、用于发给后端的数据进行marshall/unmarshall，按模块分
│   ├── store                  // 全局store管理
│   ├── utils                  // 全局公用方法
│   ├── theme                  // 全局样式
│   │    ├── common            // 全局样式，与风格无关，如基本字体、定位等；需要知道的是，这里的全局变量文件，在由两个以上风格时才根据两个风格中的variables提取出重复项，加入这里。前期该文件为空
│   │    ├── light/dark        // 具体风格下的样式
│   │    │      ├── components // 全局UI组件样式
│   │    │      ├── pages      // 按页面分子目录
│   │    │      └── variables  // 某风格下样式变量文件，其中scss文件存放的是提取出的页面中变量；less文件存放的是对ant-design中定制主题时改变的变量
│   │    ├── mixins            // 部分mixins函数定义
│   │    └── reset.less        // ant-design中定制风格时改变的变量引用文件
│   ├── pages                  // 页面
│   │    ├── Deployment        // 部署管理页面
│   │    └── other             // 其他页面
│   ├── App.vue                // 入口页面
│   └── main.ts                // 入口 加载组件 初始化等
│   └── router.ts              // 路由配置
├── tests                      // 测试
├── babel.config.js            // babel-loader 配置
├── .gitignore                 // git 忽略项
└── package.json               // package.json

```
