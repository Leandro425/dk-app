import { useState } from 'react'
import { ConfigProvider, theme } from 'antd'
import { ThemeContext, useThemeContext } from './useThemeContext'

const AntConfigProvider = ({ children }) => {
    const { isDarkMode } = useThemeContext()
    return (
        <ConfigProvider
            theme={{
                // 1. Use dark algorithm
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,

                // 2. Combine dark algorithm and compact algorithm
                // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
            }}
        >
            {children}
        </ConfigProvider>
    )
}

const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false)
    return (
        <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
            <AntConfigProvider>{children}</AntConfigProvider>
        </ThemeContext.Provider>
    )
}

export default ThemeProvider
