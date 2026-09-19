import { keepPreviousData, useQuery } from '@tanstack/react-query'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { buildStatements } from '../lib/payroll'

export const payrollQueryKey = (month, year) => ['payroll', year, month]

/**
 * Loads everything the payroll page needs for one month in three parallel requests
 * (employees, piecework lines, time entries) and returns one statement per employee.
 */
const usePayrollData = (month, year) => {
    const { supabase } = useSupabaseContext()

    return useQuery({
        queryKey: payrollQueryKey(month, year),
        queryFn: async () => {
            const [employees, lines, entries] = await Promise.all([
                supabase.from('employee').select('*').order('staff_number', { ascending: true }),
                supabase.rpc('payroll_report_lines', { p_month: month, p_year: year }),
                supabase.rpc('payroll_time_entries', { p_month: month, p_year: year }),
            ])
            const failed = [employees, lines, entries].find((result) => result.error)
            if (failed) throw failed.error
            return buildStatements(employees.data ?? [], lines.data ?? [], entries.data ?? [], month, year)
        },
        enabled: Boolean(supabase && month && year),
        placeholderData: keepPreviousData,
    })
}

export default usePayrollData
