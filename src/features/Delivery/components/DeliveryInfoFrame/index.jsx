import { Flex, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { formatDate, formatDateTime } from '../../../../utils/helpers'
import DeliveryStatusActions, { DeliveryStatusTag } from '../DeliveryStatusActions'
import { LANGUAGE_LABEL_KEYS } from '../../../../config/languages'

const { Paragraph } = Typography

const DeliveryInfoFrame = ({ delivery }) => {
    const { t } = useTranslation()
    const languageKey = LANGUAGE_LABEL_KEYS[delivery?.pdf_language]
    return (
        <Flex
            justify="space-between"
            align="flex-start"
            gap={16}
            wrap
        >
            <Flex vertical>
                <Paragraph>
                    {t('deliveries.delivery.status')}: <DeliveryStatusTag delivery={delivery} />
                </Paragraph>
                <Paragraph>
                    {t('deliveries.delivery.number')}: {delivery?.number}
                </Paragraph>
                <Paragraph>
                    {t('deliveries.delivery.date')}: {formatDate(delivery?.date)}
                </Paragraph>
                <Paragraph>
                    {t('deliveries.delivery.customer')}: {delivery?.customer?.name}
                </Paragraph>
                <Paragraph>
                    {t('deliveries.delivery.language')}: {languageKey ? t(languageKey) : delivery?.pdf_language}
                </Paragraph>
                {delivery?.completed_at && (
                    <Paragraph>
                        {t('deliveries.delivery.completedAt')}: {formatDateTime(delivery.completed_at)}
                    </Paragraph>
                )}
                <Paragraph>
                    {t('deliveries.delivery.annotation')}: {delivery?.annotation}
                </Paragraph>
            </Flex>
            <Flex gap={8}>
                <DeliveryStatusActions
                    delivery={delivery}
                    showLabels
                />
            </Flex>
        </Flex>
    )
}

export default DeliveryInfoFrame
