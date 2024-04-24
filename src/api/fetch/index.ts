import axios, { AxiosInstance } from 'axios';

import axiosConfig from '@/api/fetch/config';

const fetch: AxiosInstance = axios.create({
  ...axiosConfig,
});

export default fetch;
