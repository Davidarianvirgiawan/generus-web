import API from '../../api'

const API_URL = '/events'

// Create presence
const createPresence = async (data, token) => {
  const { eventId } = data
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  const response = await API.post(API_URL + `/${eventId}/presences`, data, config)
  return response.data
}

// Delete presence
const deletePresence = async (data, token) => {
  const { eventId } = data
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  const response = await API.delete(API_URL + `/${eventId}/presences`, config)
  return response.data
}

// Create presence by amdin
const createPresenceByAdmin = async (data, token) => {
  const { eventId, userId } = data
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  const response = await API.post(API_URL + `/${eventId}/presences/${userId}`, data, config)
  return response.data
}

// Remove attender
const removeAttender = async (data, token) => {
  const { eventId, userId } = data
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  const response = await API.delete(`${API_URL}/${eventId}/presences/${userId}`, config)
  return response.data
}

const getPresencesByEventId = async (token, {
  page = 1,
  eventId = '',
  ancestorOrganizationId = '',
  organizationId = '',
  sex = '',
  userId = '',
  grade = '',
} = {}) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const queryParams = new URLSearchParams({
    page,
    ancestorOrganizationId,
    isActive: true,
    organizationId,
    sex,
    userId,
    grade,
  }).toString()

  const response = await API.get(`${API_URL}/${eventId}/presences?${queryParams}`, config)
  return response.data
}

// Check presence status
const detail = async (params, token) => {
  const { eventId, userId } = params
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  const response = await API.get(`${API_URL}/${eventId}/presences/${userId}`, config)
  return response.data
}

// Download presence data as Excel
const downloadPresenceData = async (eventId, token, {
  sex = '',
  ancestorOrganizationId = '',
  organizationId = '',
  grade = '',
}) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob',
  }

  const queryParams = new URLSearchParams({
    sex,
    ancestorOrganizationId,
    organizationId,
    grade,
  }).toString()

  const response = await API.get(`${API_URL}/${eventId}/presences/download?${queryParams}`, config)
  return response.data
}

const updatePresence = async (data, token) => {
  const { eventId, userId, status } = data
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  const response = await API.put(`${API_URL}/${eventId}/presences/${userId}`, { status }, config)
  return response.data
}

const presenceService = {
  createPresence,
  deletePresence,
  createPresenceByAdmin,
  detail,
  getPresencesByEventId,
  removeAttender,
  downloadPresenceData,
  updatePresence,
}

export default presenceService