import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'
import EmployeesTable from '../employees/components/EmployeesTable'

const EmployeesPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('admin.employees.title')}
            description={t('admin.employees.description')}
        >
            <EmployeesTable />
        </ContentFrame>
    )
}

export default EmployeesPage
