import { Button } from 'antd'

import useSupabaseContext from '../context/supabase/supabaseContext'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const LogoutButton = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { logout } = useSupabaseContext()

    const handleLogout = () => {
        logout()
        navigate('/app/auth/login')
    }

    return (
        <Button
            onClick={handleLogout}
            type="default"
        >
            {t('common.actions.signOut')}
        </Button>
    )
}

export default LogoutButton
