import axiosClient from './axiosClient';

const accountApi = {
  getAccounts: (params) => {
    return axiosClient.get('/accounts', { params });
  },
  connectAccount: (data) => {
    return axiosClient.post('/accounts/connect', data);
  },
  updateAccount: (id, data) => {
    return axiosClient.put(`/accounts/${id}`, data);
  },
  deleteAccount: (id) => {
    return axiosClient.delete(`/accounts/${id}`);
  }
};

export default accountApi;
