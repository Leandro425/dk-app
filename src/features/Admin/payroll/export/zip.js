import { datevFileBase, monthFolderName, statementFileBase } from './fileNames'
import { buildDatevCsvBlob, buildDatevWorkbookBlob } from './excel'

/**
 * Complete month export as one ZIP, laid out like the Python tool's `exports/` folder:
 *   reports_M_YYYY/datev/employee_report_M_YYYY.(xlsx|csv)
 *   reports_M_YYYY/performance_reports/<staff>_<first>_<last>/performance_report_..._M_YYYY.(pdf|xlsx)
 * `renderPdf` and `renderWorkbook` turn one statement into a Blob; `onProgress(done, total)` is optional.
 */
export const buildMonthExportZip = async ({ statements, month, year, renderPdf, renderWorkbook, onProgress }) => {
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    const root = zip.folder(monthFolderName(month, year))

    const datev = root.folder('datev')
    datev.file(`${datevFileBase(month, year)}.xlsx`, await buildDatevWorkbookBlob(statements))
    datev.file(`${datevFileBase(month, year)}.csv`, buildDatevCsvBlob(statements))

    const reports = root.folder('performance_reports')
    for (let index = 0; index < statements.length; index++) {
        const statement = statements[index]
        const base = statementFileBase(statement)
        const folder = reports.folder(base.replace(/^performance_report_/, '').replace(/_\d+_\d+$/, ''))
        folder.file(`${base}.pdf`, await renderPdf(statement))
        folder.file(`${base}.xlsx`, await renderWorkbook(statement))
        onProgress?.(index + 1, statements.length)
    }

    return zip.generateAsync({ type: 'blob' })
}
