import { useQuery } from '@tanstack/react-query'
import useSupabaseContext from '../supabase/supabaseContext'
import { SupervisorContext } from './supervisorContext'
import LoadingScreen from '../../components/LoadingScreen'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

const SupervisorProvider = ({ children }) => {
    const { supabase, user: supabaseUser } = useSupabaseContext()
    const { i18n } = useTranslation()

    const supabaseUserId = supabaseUser?.id

    const fetchSupervisorData = async (userId) => {
        const { data, error } = await supabase.from('Supervisor').select('*').eq('user_id', userId).single()
        if (error) throw new Error(error.message)
        return data
    }

    const {
        data: supervisor,
        isLoading,
        // isFetching,
        refetch,
    } = useQuery({
        queryKey: ['supervisor', supabaseUserId],
        queryFn: () => fetchSupervisorData(supabaseUserId),
        enabled: !!supabaseUserId,
    })

    const supervisorLanguage = supervisor?.language
    useEffect(() => {
        if (supervisorLanguage) {
            i18n.changeLanguage(supervisorLanguage)
        }
    }, [supervisorLanguage, i18n])

    return (
        <SupervisorContext.Provider value={{ supervisor, refetch }}>
            {isLoading ? <LoadingScreen /> : children}
        </SupervisorContext.Provider>
    )
}

export default SupervisorProvider
