const getFullName = (emp) => `${emp.staff_number} | ${emp.firstname} ${emp.lastname}`

export const getEmployeesSelectOptions = async (supabase) => {
    const { data, error } = await supabase.from('Employee').select('*').order('staff_number', { ascending: true })
    if (error) {
        throw new Error(error.message)
    }
    return data.map((emp) => ({ label: getFullName(emp), value: emp.id }))
}
