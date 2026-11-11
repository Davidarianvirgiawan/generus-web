import API from '../../api'

const API_URL = '/home-activities'

const getConfig = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

const list = async (token, params) => (await API.get(API_URL, { ...getConfig(token), params })).data
const create = async (token, data) => (await API.post(API_URL, data, getConfig(token))).data
const update = async (token, id, data) => (await API.put(`${API_URL}/${id}`, data, getConfig(token))).data
const remove = async (token, id) => (await API.delete(`${API_URL}/${id}`, getConfig(token))).data

const searchStudents = async (search) =>
  (await API.get('/auths/students', { params: { search } })).data

const getLogs = async (token, studentId, date) =>
  (await API.get(`${API_URL}/logs`, { ...getConfig(token), params: { studentId, date } })).data
const setChecked = async (token, data) => (await API.put(`${API_URL}/logs`, data, getConfig(token))).data
const getChildren = async (token) => (await API.get(`${API_URL}/children`, getConfig(token))).data
const getChildActivities = async (token, studentId) =>
  (await API.get(`${API_URL}/children/${studentId}/activities`, getConfig(token))).data
const getRequests = async (token) => (await API.get(`${API_URL}/requests`, getConfig(token))).data
const answerRequest = async (token, studentId, approve) =>
  (await API.put(`${API_URL}/requests/${studentId}`, { approve }, getConfig(token))).data
const searchParents = async (token, search) =>
  (await API.get(`${API_URL}/parent-search`, { ...getConfig(token), params: { search } })).data
const getMyParents = async (token) => (await API.get(`${API_URL}/parents`, getConfig(token))).data
const requestParent = async (token, parentId) =>
  (await API.post(`${API_URL}/parents`, { parentId }, getConfig(token))).data
const removeParent = async (token, parentId) =>
  (await API.delete(`${API_URL}/parents/${parentId}`, getConfig(token))).data

const getStudentReport = async (token, studentId, month) =>
  (await API.get(`${API_URL}/report/${studentId}`, { ...getConfig(token), params: { month } })).data
const downloadStudentReport = async (token, studentId, month, name) =>
  (await API.get(`${API_URL}/report/${studentId}/download`, { ...getConfig(token), params: { month, name }, responseType: "blob" })).data
const getReport = async (token, params) =>
  (await API.get(`${API_URL}/report`, { ...getConfig(token), params })).data
const homeActivityService = {
  list, create, update, remove, getLogs, setChecked, getChildren, getChildActivities, getRequests, answerRequest,
  searchParents, getMyParents, requestParent, removeParent, getReport, getStudentReport, downloadStudentReport,
}

export default homeActivityService
