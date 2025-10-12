import { Flex, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../../../utils/helpers'

const { Paragraph } = Typography

const DeliveryInfoFrame = ({ delivery }) => {
    const { t } = useTranslation()
    return (
        <Flex vertical>
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
                {t('deliveries.delivery.annotation')}: {delivery?.annotation}
            </Paragraph>
        </Flex>
    )
}

export default DeliveryInfoFrame
