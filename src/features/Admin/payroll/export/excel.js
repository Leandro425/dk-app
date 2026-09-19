import { DATEV_WAGE_TYPES, buildDatevRows, roundHours, roundMoney } from '../lib/payroll'
import { formatClock } from '../lib/format'

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const MONEY_FORMAT = '#,##0.00'
const HOURS_FORMAT = '0.00'

// exceljs is ~1 MB; load it on first use.
const loadExcel = async () => (await import('exceljs')).default

const toBlob = async (workbook) => new Blob([await workbook.xlsx.writeBuffer()], { type: XLSX_TYPE })

const styleHeader = (sheet) => {
    sheet.getRow(1).font = { bold: true }
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
}

const columnLetter = (index) => String.fromCharCode(65 + index)

/**
 * Per-employee workbook: a daily summary with a totals row plus the underlying
 * piecework lines and time entries. `t` is the fixed-language translate function.
 */
export const buildEmployeeWorkbookBlob = async (statement, t) => {
    const { days } = statement
    const ExcelJS = await loadExcel()
    const workbook = new ExcelJS.Workbook()
    const col = (key) => t(`admin.payroll.export.columns.${key}`)

    const summary = workbook.addWorksheet(t('admin.payroll.export.sheets.summary'))
    summary.columns = [
        { header: col('date'), key: 'date', width: 14 },
        { header: col('revenue'), key: 'revenue', width: 16, style: { numFmt: MONEY_FORMAT } },
        { header: col('lines'), key: 'lines', width: 12 },
        { header: col('hours'), key: 'hours', width: 16, style: { numFmt: HOURS_FORMAT } },
        { header: col('timePay'), key: 'timePay', width: 16, style: { numFmt: MONEY_FORMAT } },
        { header: col('entries'), key: 'entries', width: 14 },
    ]
    days.forEach((day) =>
        summary.addRow({
            date: day.date,
            revenue: roundMoney(day.revenue),
            lines: day.lines.length,
            hours: roundHours(day.hours),
            timePay: roundMoney(day.timePay),
            entries: day.entries.length,
        })
    )
    const lastDataRow = days.length + 1
    const totalRow = summary.addRow({ date: col('total') })
    for (let index = 1; index < summary.columns.length; index++) {
        const letter = columnLetter(index)
        totalRow.getCell(index + 1).value = { formula: `SUM(${letter}2:${letter}${lastDataRow})` }
    }
    totalRow.font = { bold: true }
    styleHeader(summary)

    const lines = workbook.addWorksheet(t('admin.payroll.export.sheets.lines'))
    lines.columns = [
        { header: col('date'), key: 'date', width: 14 },
        { header: col('article'), key: 'article', width: 40 },
        { header: col('quantity'), key: 'quantity', width: 12, style: { numFmt: HOURS_FORMAT } },
        { header: col('pieceRate'), key: 'pieceRate', width: 14, style: { numFmt: MONEY_FORMAT } },
        { header: col('specialFeature'), key: 'specialFeature', width: 24 },
        { header: col('revenue'), key: 'revenue', width: 16, style: { numFmt: MONEY_FORMAT } },
    ]
    days.forEach((day) =>
        day.lines.forEach((line) =>
            lines.addRow({
                date: day.date,
                article: line.article_name,
                quantity: Number(line.total_quantity),
                pieceRate: line.piece_rate,
                specialFeature: line.not_charging_piecework_wage
                    ? t('reports.report.notChargingPieceworkWage')
                    : line.special_feature
                      ? t(`reports.report.specialFeatures.${line.special_feature}`, {
                            defaultValue: line.special_feature,
                        })
                      : '',
                revenue: roundMoney(line.revenue),
            })
        )
    )
    styleHeader(lines)

    const entries = workbook.addWorksheet(t('admin.payroll.export.sheets.entries'))
    entries.columns = [
        { header: col('date'), key: 'date', width: 14 },
        { header: col('start'), key: 'start', width: 10 },
        { header: col('end'), key: 'end', width: 10 },
        { header: col('breakMinutes'), key: 'breakMinutes', width: 14 },
        { header: col('type'), key: 'type', width: 18 },
        { header: col('hours'), key: 'hours', width: 16, style: { numFmt: HOURS_FORMAT } },
    ]
    days.forEach((day) =>
        day.entries.forEach((entry) =>
            entries.addRow({
                date: day.date,
                start: formatClock(entry.start_time),
                end: formatClock(entry.end_time),
                breakMinutes: Number(entry.break_in_min ?? 0),
                type: t(`timestamps.timestamp.types.${entry.type}`, { defaultValue: entry.type ?? '' }),
                hours: roundHours(entry.work_hours),
            })
        )
    )
    styleHeader(entries)

    return toBlob(workbook)
}

/**
 * DATEV pre-entry sheet: one row per employee, columns laid out like the DATEV
 * "Lohn und Gehalt" Vorerfassung so the values can be pasted straight in.
 * Headers are German on purpose, the DATEV workbook is German only.
 */
export const buildDatevWorkbookBlob = async (statements) => {
    const ExcelJS = await loadExcel()
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('DATEV')
    const { hours, piecework } = DATEV_WAGE_TYPES
    sheet.columns = [
        { header: 'PersNr', key: 'staff_number', width: 12 },
        { header: 'Nachname', key: 'lastname', width: 28 },
        { header: 'Vorname', key: 'firstname', width: 28 },
        { header: 'Kostenstelle', key: 'cost_center', width: 14 },
        { header: `${hours.number} ${hours.name}`, key: 'hours', width: 20, style: { numFmt: HOURS_FORMAT } },
        {
            header: `${piecework.number} ${piecework.name}`,
            key: 'piecework',
            width: 24,
            style: { numFmt: MONEY_FORMAT },
        },
    ]
    buildDatevRows(statements).forEach((row) => sheet.addRow({ ...row, cost_center: '' }))
    styleHeader(sheet)
    return toBlob(workbook)
}

const csvEscape = (value) => {
    const text = String(value ?? '')
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** CSV with the same columns and order the Python tool produced. */
export const buildDatevCsvBlob = (statements) => {
    const header = [
        'employee_staff_number',
        'employee_lastname',
        'employee_firstname',
        'report_total_revenue',
        'timestamp_total_hours',
    ]
    const rows = buildDatevRows(statements).map((row) =>
        [row.staff_number, row.lastname, row.firstname, row.piecework.toFixed(2), row.hours.toFixed(2)]
            .map(csvEscape)
            .join(',')
    )
    const content = '﻿' + [header.join(','), ...rows].join('\n')
    return new Blob([content], { type: 'text/csv;charset=utf-8' })
}
