/**
 * axios请求配置，具体见: https://github.com/axios/axios
 */
const axiosConfig: object = {
  timeout: 60000, // 超时时间一分钟
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '-1',
    language: 'en',
  },
  withCredentials: true,
};

export default axiosConfig;
