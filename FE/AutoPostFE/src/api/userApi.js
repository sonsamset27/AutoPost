import axiosClient from './axiosClient';

const userApi = {
  getProfile: () => {
    return axiosClient.get('/users/profile');
  },
  changePassword: (data) => {
    return axiosClient.put('/users/change-password', data);
  }
};

export default userApi;
