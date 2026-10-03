import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'
import BatchesTable from '../batches/components/BatchesTable'

const BatchesPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('admin.batches.title')}
            description={t('admin.batches.description')}
        >
            <BatchesTable />
        </ContentFrame>
    )
}

export default BatchesPage
