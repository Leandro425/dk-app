import { Route, Routes } from 'react-router'
import LoginPage from '../pages/LoginPage'

const AuthRoutes = () => {
    return (
        <Routes>
            <Route
                path="/login"
                element={<LoginPage />}
            />
        </Routes>
    )
}

export default AuthRoutes
