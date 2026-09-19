import { useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LANGUAGE } from '../../../../config/languages'
import MonthlyStatementDocument from '../pdf/MonthlyStatementDocument'
import { buildEmployeeWorkbookBlob } from '../export/excel'

export const statementLanguage = (statement) => statement.employee.language || DEFAULT_LANGUAGE

/**
 * Renders a statement into its documents in the employee's language,
 * independent of the current UI language.
 */
const useStatementRenderer = () => {
    const { i18n } = useTranslation()

    const documentFor = useCallback(
        (statement) => {
            const language = statementLanguage(statement)
            return (
                <MonthlyStatementDocument
                    statement={statement}
                    t={i18n.getFixedT(language)}
                    language={language}
                />
            )
        },
        [i18n]
    )

    const renderPdfBlob = useCallback((statement) => pdf(documentFor(statement)).toBlob(), [documentFor])

    const renderWorkbookBlob = useCallback(
        (statement) => buildEmployeeWorkbookBlob(statement, i18n.getFixedT(statementLanguage(statement))),
        [i18n]
    )

    return { documentFor, renderPdfBlob, renderWorkbookBlob }
}

export default useStatementRenderer
