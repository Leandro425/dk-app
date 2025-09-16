import { Route, Routes } from 'react-router'
import DeliveriesPage from '../pages/DeliveriesPage'

const DeliveryRoutes = () => {
    return (
        <Routes>
            <Route
                index={true}
                element={<DeliveriesPage />}
            />
        </Routes>
    )
}

export default DeliveryRoutes
