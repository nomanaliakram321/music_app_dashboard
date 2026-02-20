import axios from 'axios';
import * as caseConverter from 'change-object-case';

import { ACCESS_TOKEN } from '#/constants';
import { getLocalStorageItem } from '#/utils';
import env from '#env';

const options = { recursive: true, arrayRecursive: true };

const axiosInstance = axios.create({
  baseURL: env.VITE_BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(config => {
  const accessToken = getLocalStorageItem(ACCESS_TOKEN);
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

  if (!(config?.data instanceof FormData)) {
    const caseConvertedData = caseConverter.snakeKeys(config?.data, options);
    config.data = caseConvertedData;
  }

  const caseConvertedData = caseConverter.snakeKeys(config.params);
  config.params = caseConvertedData;

  return config;
});

axiosInstance.interceptors.response.use(
  response => {
    // if (response.data && typeof response.data === 'object') {
    //   response.data = caseConverter.camelKeys(response.data, options);
    // }
    return response;
  },
  error => {
    if (error.response) {
      if (error?.response?.data && typeof error.response.data === 'object') {
        error.response.data = caseConverter.camelKeys(error.response.data, options);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
