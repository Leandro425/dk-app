import dayjs from 'dayjs'

export const getEmployeeLabel = (emp) => `${emp.staff_number} | ${emp.firstname} ${emp.lastname}`
export const getArticleLabel = (article) => `${article.external_id} | ${article.name}`
export const getFieldLabel = (field) => `${field.external_id} | ${field.name} - ${field.location}`
export const getStaffGroupLabel = (group) => group.name

export const getSupervisorLabel = (sup) => (sup ? `${sup.name}` : '')

export const formatDateTime = (date) => (date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '')
export const formatDate = (date) => (date ? dayjs(date).format('DD.MM.YYYY') : '')
export const formatTime = (time) => (time ? dayjs(time, 'HH:mm').format('HH:mm') : '')
