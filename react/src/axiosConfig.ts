import axios from 'axios';

axios.defaults.baseURL = "http://localhost:4000/api/v1";
axios.defaults.headers.post['Content-Type'] = 'application/json';

export default axios;
