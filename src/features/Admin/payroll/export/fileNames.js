import { employeeFileIdentifier } from '../lib/payroll'

// File and folder names mirror the retired Python tool so the accountant's habits keep working.

export const monthFolderName = (month, year) => `reports_${month}_${year}`

export const datevFileBase = (month, year) => `employee_report_${month}_${year}`

export const statementFileBase = (statement) =>
    `performance_report_${employeeFileIdentifier(statement.employee)}_${statement.month}_${statement.year}`
