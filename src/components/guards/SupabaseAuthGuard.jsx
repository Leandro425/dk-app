import { Navigate } from 'react-router-dom'
import useSupabaseContext from '../../context/supabase/supabaseContext'

const SupabaseAuthGuard = ({ children }) => {
    const { user } = useSupabaseContext()

    console.log('SupabaseAuthGuard user:', user)

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
