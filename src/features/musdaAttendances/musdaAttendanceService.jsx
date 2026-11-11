import API from '../../api'

const API_URL = '/musda-attendances'

const getConfig = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

const list = async (token, params) => (await API.get(API_URL, { ...getConfig(token), params })).data
const create = async (token, data) => (await API.post(API_URL, data, getConfig(token))).data
const update = async (token, id, data) => (await API.put(`${API_URL}/${id}`, data, getConfig(token))).data
const remove = async (token, id) => (await API.delete(`${API_URL}/${id}`, getConfig(token))).data
const download = async (token, month) =>
  (await API.get(`${API_URL}/download`, { ...getConfig(token), params: { month }, responseType: "blob" })).data

const musdaAttendanceService = { list, create, update, remove, download }

export default musdaAttendanceService
