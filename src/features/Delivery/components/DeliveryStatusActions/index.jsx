import { Suspense, lazy, useState } from 'react'
import { Button, ConfigProvider, Popconfirm, Tag, Tooltip, theme } from 'antd'
import { useTranslation } from 'react-i18next'
import { CheckCircleFilled, FilePdfFilled, UndoOutlined } from '@ant-design/icons'
import useDeliveryStatusActions, { isDeliveryCompleted } from '../../hooks/useDeliveryStatusActions'

// Lazy: pulls in @react-pdf/renderer (~1 MB), only needed when a PDF is previewed.
const DeliveryPdfModal = lazy(() => import('../modals/DeliveryPdfModal'))

export const DeliveryStatusTag = ({ delivery }) => {
    const { t } = useTranslation()
    return isDeliveryCompleted(delivery) ? (
        <Tag color="success">{t('deliveries.status.done')}</Tag>
    ) : (
        <Tag color="processing">{t('deliveries.status.open')}</Tag>
    )
}

/**
 * Create-PDF and Done/Reopen buttons for one delivery.
 * `showLabels` renders text buttons (detail page); otherwise icon-only (table rows).
 */
const DeliveryStatusActions = ({ delivery, showLabels = false }) => {
    const { t } = useTranslation()
    const { completeDelivery, reopenDelivery, loading, contextHolder } = useDeliveryStatusActions()
    const [openPdfModal, setOpenPdfModal] = useState(false)
    const { token } = theme.useToken()
    const completed = isDeliveryCompleted(delivery)

    if (!delivery) return null

    return (
        <>
            {contextHolder}
            <Tooltip title={showLabels ? null : t('deliveries.actions.createPdf')}>
                <Button
                    icon={<FilePdfFilled />}
                    onClick={() => setOpenPdfModal(true)}
                >
                    {showLabels ? t('deliveries.actions.createPdf') : null}
                </Button>
            </Tooltip>
            {completed ? (
                <Popconfirm
                    title={t('deliveries.actions.reopen')}
                    description={t('deliveries.actions.reopenConfirmation')}
                    onConfirm={() => reopenDelivery(delivery.id)}
                    okText={t('common.yes')}
                    cancelText={t('common.no')}
                >
                    <Tooltip title={showLabels ? null : t('deliveries.actions.reopen')}>
                        <Button
                            icon={<UndoOutlined />}
                            loading={loading}
                        >
                            {showLabels ? t('deliveries.actions.reopen') : null}
                        </Button>
                    </Tooltip>
                </Popconfirm>
            ) : (
                <Popconfirm
                    title={t('deliveries.actions.complete')}
                    description={t('deliveries.actions.completeConfirmation')}
                    onConfirm={() => completeDelivery(delivery.id)}
                    okText={t('common.yes')}
                    cancelText={t('common.no')}
                >
                    <Tooltip title={showLabels ? null : t('deliveries.actions.complete')}>
                        {/* Success-colored primary button driven by the theme's success tokens */}
                        <ConfigProvider
                            theme={{
                                components: {
                                    Button: {
                                        colorPrimary: token.colorSuccess,
                                        colorPrimaryHover: token.colorSuccessHover,
                                        colorPrimaryActive: token.colorSuccessActive,
                                    },
                                },
                            }}
                        >
                            <Button
                                type="primary"
                                icon={<CheckCircleFilled />}
                                loading={loading}
                            >
                                {showLabels ? t('deliveries.actions.complete') : null}
                            </Button>
                        </ConfigProvider>
                    </Tooltip>
                </Popconfirm>
            )}
            {openPdfModal && (
                <Suspense fallback={null}>
                    <DeliveryPdfModal
                        open={openPdfModal}
                        onClose={() => setOpenPdfModal(false)}
                        delivery={delivery}
                    />
                </Suspense>
            )}
        </>
    )
}

export default DeliveryStatusActions
