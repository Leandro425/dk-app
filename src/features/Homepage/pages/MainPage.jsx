import { useTranslation } from 'react-i18next'

const MainPage = () => {
    const { t } = useTranslation()
    return <div>{t('homepage.welcome')}</div>
}

export default MainPage
