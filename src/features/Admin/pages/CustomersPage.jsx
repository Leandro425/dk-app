import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'
import CustomersTable from '../customers/components/CustomersTable'

const CustomersPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('admin.customers.title')}
            description={t('admin.customers.description')}
        >
            <CustomersTable />
        </ContentFrame>
    )
}

export default CustomersPage
