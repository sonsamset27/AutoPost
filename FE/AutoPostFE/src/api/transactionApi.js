import axiosClient from './axiosClient';

const transactionApi = {
  createPayment: () => {
    return axiosClient.post('/transactions/create-payment');
  }
};

export default transactionApi;
