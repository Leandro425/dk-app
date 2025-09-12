import { Button } from 'antd'

import useSupabaseContext from '../context/supabase/supabaseContext'
import { useTranslation } from 'react-i18next'

const LogoutButton = () => {
    const { t } = useTranslation()
    const { logout } = useSupabaseContext()

    return (
        <Button
            onClick={logout}
            type="primary"
        >
            {t('common.actions.signOut')}
        </Button>
    )
}

export default LogoutButton
