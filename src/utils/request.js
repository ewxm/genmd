import axios from 'axios'
axios.defaults.timeout = 30000
export default ({ url, method, params, data, headers }) => {
  return axios({
    method,
    url,
    params,
    data,
    headers,
  }).then(response => response.data)
}