import { useMemo, useState } from 'react'
import { Button, Modal } from 'antd'
import { PDFViewer } from '@react-pdf/renderer'
import { useTranslation } from 'react-i18next'
import { DownloadOutlined, ExportOutlined } from '@ant-design/icons'
import useStatementRenderer from '../hooks/useStatementRenderer'
import { openBlob, saveBlob } from '../export/download'
import { statementFileBase } from '../export/fileNames'

/** Live preview of one employee's monthly statement, rendered in the employee's language. */
const StatementPdfModal = ({ open, onClose, statement }) => {
    const { t } = useTranslation()
    const { documentFor, renderPdfBlob } = useStatementRenderer()
    const [exporting, setExporting] = useState(false)

    const document = useMemo(() => (statement ? documentFor(statement) : null), [statement, documentFor])

    const withBlob = async (handler) => {
        setExporting(true)
        try {
            handler(await renderPdfBlob(statement))
        } finally {
            setExporting(false)
        }
    }

    return (
        <Modal
            title={t('admin.payroll.actions.previewPdf')}
            open={open}
            onCancel={onClose}
            width="90vw"
            centered
            style={{ maxWidth: 1400 }}
            styles={{
                content: { height: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column' },
                body: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
            }}
            destroyOnHidden
            footer={[
                <Button
                    key="close"
                    onClick={onClose}
                >
                    {t('common.actions.close')}
                </Button>,
                <Button
                    key="download"
                    icon={<DownloadOutlined />}
                    disabled={!document}
                    loading={exporting}
                    onClick={() => withBlob((blob) => saveBlob(blob, `${statementFileBase(statement)}.pdf`))}
                >
                    {t('admin.payroll.actions.downloadPdf')}
                </Button>,
                <Button
                    key="open"
                    type="primary"
                    icon={<ExportOutlined />}
                    disabled={!document}
                    loading={exporting}
                    onClick={() => withBlob(openBlob)}
                >
                    {t('deliveries.actions.openPdfInNewTab')}
                </Button>,
            ]}
        >
            {open && document && (
                <PDFViewer
                    showToolbar={false}
                    style={{ width: '100%', flex: 1, minHeight: 0, border: 'none' }}
                >
                    {document}
                </PDFViewer>
            )}
        </Modal>
    )
}

export default StatementPdfModal
