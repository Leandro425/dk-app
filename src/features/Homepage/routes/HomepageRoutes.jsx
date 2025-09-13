import { Route, Routes } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import { Layout } from 'antd'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Imprint from '../pages/ImprintPage'
import NotFoundPage from '../../../components/NotFoundPage'
const { Content } = Layout

const HomepageRoutes = () => {
    return (
        <Layout style={{ minHeight: '100vh', flexDirection: 'column' }}>
            <Header />
            <Content style={{ flex: 1, display: 'flex' }}>
                <Routes>
                    <Route
                        path="/"
                        element={<MainPage />}
                    />
                    <Route
                        path="/imprint"
                        element={<Imprint />}
                    />
                    <Route
                        path="*"
                        element={<NotFoundPage />}
                    />
                </Routes>
            </Content>
            <Footer />
        </Layout>
    )
}

export default HomepageRoutes
