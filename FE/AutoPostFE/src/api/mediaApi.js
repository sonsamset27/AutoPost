import axiosClient from './axiosClient';

const mediaApi = {
  uploadMedia: (formData) => {
    return axiosClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default mediaApi;
