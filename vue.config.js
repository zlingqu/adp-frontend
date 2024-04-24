const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');
const lessToJs = require('less-vars-to-js');
// const backendService = 'http://10.12.12.8:32555';
// const eventSourceService = 'http://10.12.12.8:30042';
const backendService = 'http://localhost';
const eventSourceService = 'http://localhost:81';
const thirdApiService = backendService;

const envDevHost = backendService;
const spaceDevHost = backendService;
const userDevHost = 'http://mis-advanced-admin-backend.mis.dev.dm-ai.cn';
const userTestHost = 'http://192.168.3.140:31500';
const deployDevHost = backendService;
const projectDevHost = backendService;
const gitProjectsDevHost = thirdApiService;
const misLdapServiceDev = 'http://mis-ldap-service.mis.dev.dm-ai.cn';
const serviceAdpUserDev = backendService;
const serviceBuildStatusSend = eventSourceService;

// yarn run build 在非test和devement环境，强制设置为production
if (process.env.FRONTEND_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
  process.env.NODE_ENV = 'production';
}

module.exports = {
  css: {
    loaderOptions: {
      less: {
        modifyVars: lessToJs(fs.readFileSync('src/theme/reset.less', 'utf-8')),
        javascriptEnabled: true,
      },
    },
  },
  // 基本路径
  publicPath: './',
  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,
  devServer: {
    // https: true,
    proxy: {
      '/api/v1/mis-ldap-service': {
        target: misLdapServiceDev,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
        pathRewrite: {
          '^/api/v1/mis-ldap-service': '/',
        },
      },
      '/events': {
        target: serviceBuildStatusSend,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/v1/get-user-for-name': {
        target: serviceAdpUserDev,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/v1/env': {
        target: envDevHost,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/v1/space': {
        target: spaceDevHost,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/v1/deployments': {
        target: deployDevHost,
        // target: localHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/v2/deploy': {
        target: deployDevHost,
        // target: localHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/v1/deploy': {
        target: deployDevHost,
        // target: localHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/v1/project': {
        target: projectDevHost,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/v2/project': {
        target: projectDevHost,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/v2/project-id-name': {
        target: projectDevHost,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/v2/project-id-name-git-lang-product': {
        target: projectDevHost,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/v1/gitlab': {
        target: gitProjectsDevHost,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/api/open/staff': {
        target: userTestHost,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
      '/mis-advanced-admin-backend/v1/people/search': {
        target: userDevHost,
        // target: testHost,
        secure: false,
        changeOrigin: true,
        ws: true, // websocket代理
      },
    },
  },
  transpileDependencies: ['vue-echarts', 'resize-detector'],
  chainWebpack: config => {
    // 所有环境统一压缩图片
    // if (process.env.FRONTEND_ENV !== 'dev') {
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .tap(options => ({
        mozjpeg: {
          progressive: true,
          quality: 70,
        },
        // optipng.enabled: false will disable optipng
        optipng: {
          enabled: true,
        },
        pngquant: {
          quality: '65-85',
          speed: 4,
        },
        gifsicle: {
          interlaced: false,
        },
        bypassOnDebug: true,
      }));
    config.module
      .rule('svg')
      .use('svgo-loader')
      .loader('svgo-loader')
      .tap(options => ({
        plugins: [
          { cleanupAttrs: true },
          { cleanupEnableBackground: true },
          { cleanupIDs: true },
          { cleanupListOfValues: true },
          { cleanupNumericValues: true },
          { collapseGroups: true },
          { convertColors: true },
          { convertPathData: true },
          { convertShapeToPath: true },
          { convertStyleToAttrs: true },
          { convertTransform: true },
          { mergePaths: true },
          { removeComments: true },
          { removeDesc: true },
          { removeDimensions: true },
          { removeDoctype: true },
          { removeEditorsNSData: true },
          { removeEmptyAttrs: true },
          { removeEmptyContainers: true },
          { removeEmptyText: true },
          { removeHiddenElems: true },
          { removeMetadata: true },
          { removeNonInheritableGroupAttrs: true },
          { removeRasterImages: true },
          { removeTitle: true },
          { removeUnknownsAndDefaults: true },
          { removeUselessDefs: true },
          { removeUnusedNS: true },
          { removeUselessStrokeAndFill: true },
          { removeXMLProcInst: true },
          { removeStyleElement: true },
          { removeUnknownsAndDefaults: true },
          { sortAttrs: true },
        ],
      }));
    config.plugin('ignore').use(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)); // 忽略/moment/locale下的所有文件
    // }
  },
  configureWebpack: config => {
    if (process.env.FRONTEND_ENV !== 'test' && process.env.NODE_ENV !== 'development') {
      // 生产和开发环境去除console.log
      // 并且强制设置为生产环境，开启压缩、关闭sourcemap
      // config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      config.optimization = {
        minimizer: [
          new TerserPlugin({
            sourceMap: false,
            parallel: true,
            cache: true,
            terserOptions: {
              compress: {
                warnings: false,
                // drop_console: true,
                // drop_debugger: true,
                // pure_funcs: ['console.log'],
              },
            },
          }),
        ],
      };
      config.mode = 'production';
    }
  },
};
