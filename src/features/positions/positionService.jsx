import API from '../../api'

const API_URL = 'positions'

// Get positions by organization id
const getPositions = async (orgId) => {
  const response = await API.get(API_URL + `?organizationId=${orgId}&positionTypes=GENERUS,PENGAJAR,ORANGTUA`)
  return response.data
}

const positionService = {
  getPositions,
}

export default positionService
