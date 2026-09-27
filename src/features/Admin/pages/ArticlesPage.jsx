import { useTranslation } from 'react-i18next'
import ContentFrame from '../../../components/ContentFrame'
import ArticlesTable from '../articles/components/ArticlesTable'

const ArticlesPage = () => {
    const { t } = useTranslation()

    return (
        <ContentFrame
            title={t('admin.articles.title')}
            description={t('admin.articles.description')}
        >
            <ArticlesTable />
        </ContentFrame>
    )
}

export default ArticlesPage
