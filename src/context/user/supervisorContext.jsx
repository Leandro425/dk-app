import { createContext, useContext } from 'react'

export const SupervisorContext = createContext()

const useSupervisorContext = () => {
    const context = useContext(SupervisorContext)
    if (!context) throw new Error('useSupervisorContext must be used inside SupervisorProvider')
    return context
}

export default useSupervisorContext
