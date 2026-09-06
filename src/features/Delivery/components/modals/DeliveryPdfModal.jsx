import { useMemo, useState } from 'react'
import { Alert, Button, Modal, Spin } from 'antd'
import { PDFViewer, pdf } from '@react-pdf/renderer'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { DownloadOutlined, ExportOutlined } from '@ant-design/icons'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import DeliveryNoteDocument from '../../pdf/DeliveryNoteDocument'
import { DEFAULT_LANGUAGE } from '../../../../config/languages'

/**
 * Live preview of the delivery note for one delivery.
 * The document is rendered in the delivery's saved `pdf_language`, not the UI language.
 */
const DeliveryPdfModal = ({ open, onClose, delivery }) => {
    const { t, i18n } = useTranslation()
    const { supabase } = useSupabaseContext()
    const [exporting, setExporting] = useState(false)

    const language = delivery?.pdf_language || DEFAULT_LANGUAGE
    const fixedT = useMemo(() => i18n.getFixedT(language), [i18n, language])

    const fetchItems = async () => {
        const { data, error } = await supabase
            .from('delivery_item')
            .select('*, order:order(*), field:field(*), article:article(*)')
            .eq('delivery_id', delivery.id)
            .order('id', { ascending: true })
        if (error) throw error
        return data
    }

    const {
        data: items,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['deliveries', delivery?.id, 'items', 'all'],
        queryFn: fetchItems,
        enabled: open && Boolean(delivery?.id),
    })

    const document = useMemo(
        () =>
            delivery ? (
                <DeliveryNoteDocument
                    delivery={delivery}
                    items={items || []}
                    t={fixedT}
                />
            ) : null,
        [delivery, items, fixedT]
    )

    const fileName = fixedT('deliveries.pdf.fileName', { number: delivery?.number ?? '' })

    const createBlobUrl = async () => {
        const blob = await pdf(document).toBlob()
        return URL.createObjectURL(blob)
    }

    const handleOpenInNewTab = async () => {
        setExporting(true)
        try {
            const url = await createBlobUrl()
            window.open(url, '_blank', 'noopener')
        } finally {
            setExporting(false)
        }
    }

    const handleDownload = async () => {
        setExporting(true)
        try {
            const url = await createBlobUrl()
            const link = window.document.createElement('a')
            link.href = url
            link.download = fileName
            link.click()
            setTimeout(() => URL.revokeObjectURL(url), 10_000)
        } finally {
            setExporting(false)
        }
    }

    const ready = open && document && !isLoading && !isError

    return (
        <Modal
            title={t('deliveries.actions.createPdf')}
            open={open}
            onCancel={onClose}
            width="90vw"
            centered
            style={{ maxWidth: 1400 }}
            styles={{
                // rc-dialog wraps content in a sentinel div without height, so `height: 100%` never
                // resolves. Give the content an explicit viewport-based height instead.
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
                    disabled={!ready}
                    loading={exporting}
                    onClick={handleDownload}
                >
                    {t('deliveries.actions.downloadPdf')}
                </Button>,
                <Button
                    key="open"
                    type="primary"
                    icon={<ExportOutlined />}
                    disabled={!ready}
                    loading={exporting}
                    onClick={handleOpenInNewTab}
                >
                    {t('deliveries.actions.openPdfInNewTab')}
                </Button>,
            ]}
        >
            {isError && (
                <Alert
                    type="error"
                    showIcon
                    message={t('common.messages.errorOccurred')}
                />
            )}
            {isLoading && (
                <Spin
                    style={{ display: 'block', margin: '48px auto' }}
                    size="large"
                />
            )}
            {ready && (
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

export default DeliveryPdfModal
