import { api } from 'src/boot/axios'

// view account details
export const viewUserDetails = async (userId) => {
  return await api.get(`user/view/account/${userId}`)
}

// updating user credentials role, status, and office assignments
export const updateUserAccount = async (payload) => {
  // Ensure all required fields are present
  const requestPayload = {
    userId: payload.userId,
    roleId: payload.roleId,
    active: payload.active !== undefined ? payload.active : 1,
    prefix: payload.prefix ?? null,
    suffix: payload.suffix ?? null,
  }

  // Add office assignments if present (for PMT Admin)
  if (payload.office_id_assign) {
    requestPayload.office_id_assign = payload.office_id_assign
  }

  return await api.post('user/edit', requestPayload)
}

// reset password user
export const resetPassword = async (userId) => {
  return await api.post(`user/reset-password/${userId}`)
}
