import dayjs from 'dayjs'

// Columns of `employee` the app reads. Personal, tax and pay data live in the admin-only
// `employee_private` table and are never selected together with these.
export const EMPLOYEE_COLUMNS =
    'id, staff_number, staff_number_dk, firstname, lastname, staff_group_id, language, entry_date, exit_date'

export const todayIsoDate = () => dayjs().format('YYYY-MM-DD')

/** Active = no exit date, or the exit date is today or later. */
export const isEmployeeActive = (emp) => !emp?.exit_date || emp.exit_date >= todayIsoDate()

/** PostgREST `.or()` filter matching active employees. */
export const activeEmployeeFilter = () => `exit_date.is.null,exit_date.gte.${todayIsoDate()}`

export const getEmployeeLabel = (emp) => (emp ? `${emp.staff_number} | ${emp.firstname} ${emp.lastname}` : '')

export const getArticleLabel = (article) => (article ? `${article.external_id} | ${article.name}` : '')

export const getFieldLabel = (field) => (field ? `${field.external_id} | ${field.name} - ${field.location}` : '')

export const getStaffGroupLabel = (group) => (group && group.name ? group.name : '')

export const getOrderLabel = (order) => (order ? `${order.customer} | ${order.description}` : '')

export const getCustomerLabel = (customer) => (customer ? `${customer.name}` : '')
export const getSupervisorLabel = (sup) => (sup ? `${sup.name}` : '')

export const formatDateTime = (date) => (date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '')
export const formatDate = (date) => (date ? dayjs(date).format('DD.MM.YYYY') : '')
export const formatTime = (time) => (time ? dayjs(time, 'HH:mm').format('HH:mm') : '')

export const timeStringToDayjs = (timeString) => {
    return timeString ? dayjs(timeString, 'HH:mm') : null
}

export const dateStringToDayjs = (dateString) => {
    return dateString ? dayjs(dateString, 'YYYY-MM-DD') : null
}
