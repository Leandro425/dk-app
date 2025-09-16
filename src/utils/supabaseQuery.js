import { getArticleLabel, getEmployeeLabel, getFieldLabel, getStaffGroupLabel, getOrderLabel } from './helpers'

export const getEmployeeSelectOptions = async (supabase, staffGroup = null) => {
    const query = supabase.from('Employee').select('*').order('staff_number', { ascending: true })
    if (staffGroup) {
        query.eq('staff_group_id', staffGroup)
    }
    const { data, error } = await query
    if (error) {
        throw new Error(error.message)
    }
    return data.map((emp) => ({ label: getEmployeeLabel(emp), value: emp.id }))
}

export const getArticleSelectOptions = async (supabase) => {
    const { data, error } = await supabase.from('Article').select('*').order('name', { ascending: true })
    if (error) {
        throw new Error(error.message)
    }
    return data.map((article) => ({
        label: getArticleLabel(article),
        value: article.id,
        piecework_packaging: article.piecework_packaging,
    }))
}

export const getFieldSelectOptions = async (supabase) => {
    const { data, error } = await supabase.from('Field').select('*').order('name', { ascending: true })
    if (error) {
        throw new Error(error.message)
    }
    return data.map((field) => ({ label: getFieldLabel(field), value: field.id }))
}

export const getStaffGroupSelectOptions = async (supabase) => {
    const { data, error } = await supabase.from('StaffGroup').select('*').order('name', { ascending: true })
    if (error) {
        throw new Error(error.message)
    }
    return data.map((group) => ({ label: getStaffGroupLabel(group), value: group.id }))
}

export const getOrderSelectOptions = async (supabase) => {
    const { data, error } = await supabase.from('Order').select('*').order('customer', { ascending: true })
    if (error) {
        throw new Error(error.message)
    }
    return data.map((order) => ({ label: getOrderLabel(order), value: order.id }))
}