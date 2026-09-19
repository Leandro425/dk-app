import { Navigate } from 'react-router-dom'
import useSupervisorContext from '../../context/user/supervisorContext'
import { HOME_BASE } from '../../features/Home/constants'

/**
 * Only lets supervisors with the `is_admin` flag through.
 * Everyone else is silently sent back to the home area.
 */
const AdminGuard = ({ children }) => {
    const { supervisor } = useSupervisorContext()

    return supervisor?.is_admin ? (
        children
    ) : (
        <Navigate
            to={HOME_BASE}
            replace
        />
    )
}

export default AdminGuard
