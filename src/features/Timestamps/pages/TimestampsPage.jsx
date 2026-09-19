import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'

import TimestampsTable from '../components/TimestampsTable'

const TimestampsPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('timestamps.title')}
            description={t('timestamps.description')}
        >
            <TimestampsTable />
        </ContentFrame>
    )
}

export default TimestampsPage
