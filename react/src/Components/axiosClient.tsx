import axios, { AxiosInstance } from 'axios';
const baseURL = `http://localhost:4000`;   // todo use environment variable: const baseURL = `http://{REACT_APP_NODE_IP}`;

export const axiosClient: AxiosInstance= axios.create({
	baseURL,
	timeout: 2000,
	withCredentials: true
});