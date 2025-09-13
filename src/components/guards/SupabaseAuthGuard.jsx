import { Navigate } from 'react-router-dom'
import useSupabaseContext from '../../context/supabase/supabaseContext'

const SupabaseAuthGuard = ({ children }) => {
    const { user } = useSupabaseContext()

    return user ? (
        children
    ) : (
        <Navigate
            to="/app/auth/login"
            replace
        />
    )
}

export default SupabaseAuthGuard
