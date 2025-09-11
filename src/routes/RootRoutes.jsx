import { Route, Routes } from 'react-router-dom'
import { HomepageRoutes } from '../features/Homepage'
import I18nextProvider from '../providers/I18nextProvider'
import AppRoutes from './AppRoutes'

const RootRoutes = () => {
    return (
        <I18nextProvider>
            <Routes>
                <Route
                    path="/*"
                    element={<HomepageRoutes />}
                />
                <Route
                    path="/app/*"
                    element={<AppRoutes />}
                />
                <Route
                    path="*"
                    element={<h1>Not Found</h1>}
                />
            </Routes>
        </I18nextProvider>
    )
}

export default RootRoutes
