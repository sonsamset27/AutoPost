import axiosClient from './axiosClient';

const adminApi = {
  getUsers: (params) => {
    return axiosClient.get('/admin/users', { params });
  },
  getUserDetail: (id) => {
    return axiosClient.get(`/admin/users/${id}`);
  },
  banUser: (id, isBanned) => {
    return axiosClient.put(`/admin/users/${id}/ban`, { isBanned });
  },
  upgradeUserPlan: (id, plan, durationDays) => {
    return axiosClient.put(`/admin/users/${id}/plan`, { plan, durationDays });
  },
  deleteUser: (id) => {
    return axiosClient.delete(`/admin/users/${id}`);
  }
};

export default adminApi;
