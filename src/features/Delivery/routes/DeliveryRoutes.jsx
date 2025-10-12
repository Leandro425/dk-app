import { Route, Routes } from 'react-router'
import DeliveriesPage from '../pages/DeliveriesPage'
import DeliveryPage from '../pages/DeliveryPage'

const DeliveryRoutes = () => {
    return (
        <Routes>
            <Route
                index={true}
                element={<DeliveriesPage />}
            />
            <Route
                path=":deliveryId"
                element={<DeliveryPage />}
            />
        </Routes>
    )
}

export default DeliveryRoutes
