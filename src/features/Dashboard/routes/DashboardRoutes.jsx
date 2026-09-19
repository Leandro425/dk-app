import { Route, Routes } from 'react-router'
import DashboardPage from '../pages/DashboardPage'

const DashboardRoutes = () => {
    return (
        <Routes>
            <Route
                index={true}
                element={<DashboardPage />}
            />
        </Routes>
    )
}

export default DashboardRoutes
