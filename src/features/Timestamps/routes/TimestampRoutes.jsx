import { Route, Routes } from 'react-router'
import TimestampsPage from '../pages/TimestampsPage'

const TimestampRoutes = () => {
    return (
        <Routes>
            <Route
                index={true}
                element={<TimestampsPage />}
            />
        </Routes>
    )
}

export default TimestampRoutes
