import {
    EMPLOYEE_COLUMNS,
    getArticleLabel,
    getEmployeeLabel,
    isEmployeeActive,
    getBatchLabel,
    getStaffGroupLabel,
    getOrderLabel,
} from './helpers'

export const getEmployeeSelectOptions = async (supabase, staffGroup = null) => {
    const query = supabase.from('employee').select(EMPLOYEE_COLUMNS).order('staff_number', { ascending: true })
    if (staffGroup) {
        query.eq('staff_group_id', staffGroup)
    }
    const { data, error } = await query
    if (error) {
        throw new Error(error.message)
    }
    return data.map((emp) => ({ label: getEmployeeLabel(emp), value: emp.id, active: isEmployeeActive(emp) }))
}

export const getArticleSelectOptions = async (supabase) => {
    const { data, error } = await supabase.from('article').select('*').order('name', { ascending: true })
    if (error) {
        throw new Error(error.message)
    }
    return data.map((article) => ({
        label: getArticleLabel(article),
        value: article.id,
        piecework_packaging: article.piecework_packaging,
        active: article.active,
    }))
}

// All batches incl. archived ones (`active`), so an entry keeps showing its archived batch.
// `external_number` (old field number, supplier lot) is not shown but can be searched.
export const getBatchSelectOptions = async (supabase) => {
    const { data, error } = await supabase
        .from('batch')
        .select('id, type, batch_number, external_number, name, description, active')
        .order('batch_number', { ascending: true })
    if (error) {
        throw new Error(error.message)
    }
    return data.map((batch) => ({
        label: getBatchLabel(batch),
        value: batch.id,
        type: batch.type,
        active: batch.active,
        search: [getBatchLabel(batch), batch.external_number].filter(Boolean).join(' ').toLowerCase(),
    }))
}

export const getStaffGroupSelectOptions = async (supabase) => {
    const { data, error } = await supabase.from('staffgroup').select('*').order('name', { ascending: true })
    if (error) {
        throw new Error(error.message)
    }
    return data.map((group) => ({ label: getStaffGroupLabel(group), value: group.id }))
}

export const getOrderSelectOptions = async (supabase) => {
    const { data, error } = await supabase.from('order').select('*').order('customer', { ascending: true })
    if (error) {
        throw new Error(error.message)
    }
    return data.map((order) => ({ label: getOrderLabel(order), value: order.id }))
}

// All customers incl. archived ones (`active`), so a delivery keeps showing its archived customer.
export const getCustomerSelectOptions = async (supabase) => {
    const { data, error } = await supabase
        .from('customer')
        .select('id, name, active')
        .order('name', { ascending: true })
    if (error) {
        throw new Error(error.message)
    }
    return data.map((customer) => ({ label: customer.name, value: customer.id, active: customer.active }))
}
