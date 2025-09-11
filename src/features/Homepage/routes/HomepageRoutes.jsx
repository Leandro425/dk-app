import { Route, Routes } from 'react-router-dom'
import MainPage from '../pages/MainPage'

const HomepageRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={<MainPage />}
            />
        </Routes>
    )
}

export default HomepageRoutes
