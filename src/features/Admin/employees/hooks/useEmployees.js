import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { EMPLOYEE_COLUMNS } from '../../../../utils/helpers'
import { toSavePayload } from '../lib/employee'

export const employeesQueryKey = ['employees', 'admin']

// PostgREST returns a 1:1 embed as an object, older versions as a one-element array.
const one = (embed) => (Array.isArray(embed) ? (embed[0] ?? null) : (embed ?? null))

const throwOnError = ({ data, error }) => {
    if (error) throw error
    return data
}

/** All employees (public fields and staff group name), sorted by staff number. Filtering happens in the table. */
export const useEmployees = () => {
    const { supabase } = useSupabaseContext()

    return useQuery({
        queryKey: employeesQueryKey,
        queryFn: async () =>
            throwOnError(
                await supabase
                    .from('employee')
                    .select(`${EMPLOYEE_COLUMNS}, staffgroup:staffgroup(name)`)
                    .order('staff_number', { ascending: true })
            ).map((employee) => ({ ...employee, staffgroup: one(employee.staffgroup) })),
        enabled: Boolean(supabase),
    })
}

/**
 * One employee with its private data and the number of reports and timestamps
 * (an employee with history cannot be deleted).
 */
export const useEmployee = (employeeId) => {
    const { supabase } = useSupabaseContext()

    return useQuery({
        queryKey: [...employeesQueryKey, employeeId],
        queryFn: async () => {
            const count = (table) =>
                supabase.from(table).select('id', { count: 'exact', head: true }).eq('employee_id', employeeId)

            const [employee, reports, timestamps] = await Promise.all([
                supabase
                    .from('employee')
                    .select(`${EMPLOYEE_COLUMNS}, private:employee_private(*)`)
                    .eq('id', employeeId)
                    .single(),
                count('report'),
                count('timestamp'),
            ])
            const failed = [employee, reports, timestamps].find((result) => result.error)
            if (failed) throw failed.error

            return {
                ...employee.data,
                private: one(employee.data.private),
                historyCount: (reports.count ?? 0) + (timestamps.count ?? 0),
            }
        },
        enabled: Boolean(supabase && employeeId),
    })
}

const distinctByFrequency = (values) => {
    const counts = new Map()
    for (const value of values) {
        if (value === null || value === undefined || value === '') continue
        counts.set(value, (counts.get(value) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([value]) => value)
}

/** Values already in use, most frequent first: suggestions for pay type / standard pay, nationalities to list first. */
export const useEmployeeSuggestions = () => {
    const { supabase } = useSupabaseContext()

    return useQuery({
        queryKey: [...employeesQueryKey, 'suggestions'],
        queryFn: async () => {
            const rows = throwOnError(
                await supabase.from('employee_private').select('pay_type, standard_pay, nationality')
            )
            return {
                payTypes: distinctByFrequency(rows.map((row) => row.pay_type)),
                standardPays: distinctByFrequency(rows.map((row) => row.standard_pay)),
                nationalities: distinctByFrequency(rows.map((row) => row.nationality)),
            }
        },
        enabled: Boolean(supabase),
        staleTime: 5 * 60 * 1000,
    })
}

const invalidateEmployees = (queryClient) =>
    Promise.all([
        queryClient.invalidateQueries({ queryKey: ['employees'] }),
        queryClient.invalidateQueries({ queryKey: ['payroll'] }),
    ])

/** Creates (`id` null) or fully replaces an employee and its private data in one transaction. Resolves to the id. */
export const useSaveEmployee = () => {
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, values }) => {
            const payload = toSavePayload(values)
            return throwOnError(
                await supabase.rpc('save_employee', {
                    p_id: id ?? null,
                    p_employee: payload.employee,
                    p_private: payload.private,
                })
            )
        },
        onSuccess: () => invalidateEmployees(queryClient),
    })
}

/** Deletes an employee without history; the private row goes with it (on delete cascade). */
export const useDeleteEmployee = () => {
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id) => throwOnError(await supabase.from('employee').delete().eq('id', id)),
        onSuccess: () => invalidateEmployees(queryClient),
    })
}
