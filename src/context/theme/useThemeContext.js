import { createContext, useContext } from 'react'

export const ThemeContext = createContext()

export const useThemeContext = () => {
    return useContext(ThemeContext)
}
