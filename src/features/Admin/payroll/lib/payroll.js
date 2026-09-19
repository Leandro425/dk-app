import dayjs from 'dayjs'

/**
 * Pure payroll calculation. No React, no Supabase.
 *
 * Input rows come from the `payroll_report_lines` and `payroll_time_entries`
 * database functions plus the `employee` table. Output is one statement per
 * employee with a day-by-day breakdown, monthly totals and the DATEV rows.
 *
 * Behaviour mirrors the retired Python tool (dk-app-utils):
 * - piecework revenue = article piecework wage x quantity
 * - the "barShears" special feature adds a surcharge per piece
 * - time pay = work hours x employee.pay_rate
 * All money is rounded to cents only when totals are built.
 */

/** Surcharge per piece for a report's special feature, in EUR. */
export const SPECIAL_FEATURE_SURCHARGE = {
    barShears: 0.1,
}

/** Only these time entry types count as paid working hours. */
export const PAID_TIME_ENTRY_TYPES = ['workingTime']

/** DATEV wage type numbers (Lohnarten) the export feeds. */
export const DATEV_WAGE_TYPES = {
    hours: { number: 1000, name: 'Stundenlohn' },
    piecework: { number: 2035, name: 'Stücklohn, Betrag' },
}

export const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100

export const roundHours = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100

/** First and last day of a month as dayjs objects. */
export const monthRange = (month, year) => {
    const start = dayjs(new Date(year, month - 1, 1))
    return { start, end: start.endOf('month') }
}

/** ['YYYY-MM-01', ..., 'YYYY-MM-31'] for the month. */
export const daysOfMonth = (month, year) => {
    const { start } = monthRange(month, year)
    return Array.from({ length: start.daysInMonth() }, (_, i) => start.add(i, 'day').format('YYYY-MM-DD'))
}

/** Piece rate actually paid for a line: article wage plus special feature surcharge. */
export const linePieceRate = (line) =>
    Number(line.piecework_wage ?? 0) + (SPECIAL_FEATURE_SURCHARGE[line.special_feature] ?? 0)

/** Revenue of one report line. Lines flagged "not charging piecework wage" earn nothing. */
export const lineRevenue = (line) => {
    if (line.not_charging_piecework_wage) return 0
    return linePieceRate(line) * Number(line.total_quantity ?? 0)
}

export const isPaidTimeEntry = (entry) => PAID_TIME_ENTRY_TYPES.includes(entry.type)

const groupBy = (rows, keyFn) => {
    const map = new Map()
    for (const row of rows) {
        const key = keyFn(row)
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(row)
    }
    return map
}

/**
 * Statement of one employee for one month.
 * @returns {{
 *   employee, month, year, payRate,
 *   days: Array<{date, lines, entries, revenue, hours, unpaidHours, timePay}>,
 *   totals: {revenue, hours, unpaidHours, timePay, total, lineCount, entryCount, hoursByType}
 * }}
 */
export const buildEmployeeStatement = (employee, lines, entries, month, year) => {
    const payRate = Number(employee.pay_rate ?? 0)
    const linesByDay = groupBy(lines, (l) => l.report_date)
    const entriesByDay = groupBy(entries, (e) => e.entry_date)
    const hoursByType = {}

    let revenue = 0
    let hours = 0
    let unpaidHours = 0
    let lineCount = 0
    let entryCount = 0

    const days = daysOfMonth(month, year).map((date) => {
        const dayLines = (linesByDay.get(date) ?? []).map((line) => ({
            ...line,
            piece_rate: linePieceRate(line),
            revenue: lineRevenue(line),
        }))
        const dayEntries = entriesByDay.get(date) ?? []

        const dayRevenue = dayLines.reduce((sum, l) => sum + l.revenue, 0)
        let dayHours = 0
        let dayUnpaidHours = 0
        for (const entry of dayEntries) {
            const h = Number(entry.work_hours ?? 0)
            hoursByType[entry.type] = (hoursByType[entry.type] ?? 0) + h
            if (isPaidTimeEntry(entry)) dayHours += h
            else dayUnpaidHours += h
        }

        revenue += dayRevenue
        hours += dayHours
        unpaidHours += dayUnpaidHours
        lineCount += dayLines.length
        entryCount += dayEntries.length

        return {
            date,
            lines: dayLines,
            entries: dayEntries,
            revenue: dayRevenue,
            hours: dayHours,
            unpaidHours: dayUnpaidHours,
            timePay: dayHours * payRate,
        }
    })

    const timePay = hours * payRate
    return {
        employee,
        month,
        year,
        payRate,
        days,
        totals: {
            revenue: roundMoney(revenue),
            hours: roundHours(hours),
            unpaidHours: roundHours(unpaidHours),
            timePay: roundMoney(timePay),
            total: roundMoney(revenue + timePay),
            lineCount,
            entryCount,
            hoursByType,
        },
    }
}

const compareStaffNumbers = (a, b) => {
    const na = Number(a)
    const nb = Number(b)
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb
    return String(a ?? '').localeCompare(String(b ?? ''))
}

/** One statement per employee, sorted by staff number. Employees without data are included. */
export const buildStatements = (employees, lines, entries, month, year) => {
    const linesByEmployee = groupBy(lines, (l) => l.employee_id)
    const entriesByEmployee = groupBy(entries, (e) => e.employee_id)
    return [...employees]
        .sort((a, b) => compareStaffNumbers(a.staff_number, b.staff_number))
        .map((employee) =>
            buildEmployeeStatement(
                employee,
                linesByEmployee.get(employee.id) ?? [],
                entriesByEmployee.get(employee.id) ?? [],
                month,
                year
            )
        )
}

/** Rows for the DATEV pre-entry sheet: one per employee, hours (LA 1000) and piecework amount (LA 2035). */
export const buildDatevRows = (statements) =>
    statements.map(({ employee, totals }) => ({
        staff_number: employee.staff_number,
        lastname: (employee.lastname ?? '').trim(),
        firstname: (employee.firstname ?? '').trim(),
        hours: totals.hours,
        piecework: totals.revenue,
    }))

/** Grand totals over all statements, for the page summary. */
export const sumStatements = (statements) =>
    statements.reduce(
        (acc, s) => ({
            revenue: roundMoney(acc.revenue + s.totals.revenue),
            hours: roundHours(acc.hours + s.totals.hours),
            timePay: roundMoney(acc.timePay + s.totals.timePay),
            total: roundMoney(acc.total + s.totals.total),
            employeesWithData: acc.employeesWithData + (s.totals.lineCount + s.totals.entryCount > 0 ? 1 : 0),
        }),
        { revenue: 0, hours: 0, timePay: 0, total: 0, employeesWithData: 0 }
    )

/** File-system safe identifier used in export file names, e.g. "25002_Emil_Dudek". */
export const employeeFileIdentifier = (employee) =>
    [employee.staff_number, employee.firstname, employee.lastname]
        .map((part) =>
            String(part ?? '')
                .trim()
                .replace(/\s+/g, '_')
        )
        .filter(Boolean)
        .join('_')
        .replace(/[^\p{L}\p{N}_-]/gu, '')
