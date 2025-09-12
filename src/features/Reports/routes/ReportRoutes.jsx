import { Route, Routes } from 'react-router'
import ReportsPage from '../pages/ReportsPage'

const ReportRoutes = () => {
    return (
        <Routes>
            <Route
                index={true}
                element={<ReportsPage />}
            />
        </Routes>
    )
}

export default ReportRoutes
