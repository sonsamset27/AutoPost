import axiosClient from './axiosClient';

const postApi = {
  createPost: (data) => {
    return axiosClient.post('/posts', data);
  },
  getPosts: (params) => {
    return axiosClient.get('/posts', { params });
  },
  getPostById: (id) => {
    return axiosClient.get(`/posts/${id}`);
  },
  updatePost: (id, data) => {
    return axiosClient.put(`/posts/${id}`, data);
  },
  deletePost: (id) => {
    return axiosClient.delete(`/posts/${id}`);
  }
};

export default postApi;
