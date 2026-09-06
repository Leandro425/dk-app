import { Navigate } from 'react-router-dom'
import useSupervisorContext from '../../context/user/supervisorContext'

/**
 * Only lets supervisors with the `is_admin` flag through.
 * Everyone else is silently sent back to the dashboard.
 */
const AdminGuard = ({ children }) => {
    const { supervisor } = useSupervisorContext()

    return supervisor?.is_admin ? (
        children
    ) : (
        <Navigate
            to="/app/dashboard"
            replace
        />
    )
}

export default AdminGuard
