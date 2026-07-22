import axiosClient from './axiosClient';

const authApi = {
  signUp: (data) => {
    return axiosClient.post('/auth/signup', data);
  },
  signIn: (data) => {
    return axiosClient.post('/auth/signin', data);
  },
  logout: () => {
    return axiosClient.post('/auth/logout');
  }
};

export default authApi;
