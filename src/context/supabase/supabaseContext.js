import { createContext, useContext } from 'react'

export const SupabaseContext = createContext()

const useSupabaseContext = () => {
    const context = useContext(SupabaseContext)
    if (!context) throw new Error('useSupabaseContext must be used inside SupabaseProvider')
    return context
}

export default useSupabaseContext
