import { useState } from 'react'
import { ConfigProvider, theme } from 'antd'
import { ThemeContext, useThemeContext } from './useThemeContext'

// https://ant.design/docs/react/customize-theme

const AntConfigProvider = ({ children }) => {
    const { isDarkMode } = useThemeContext()
    return (
        <ConfigProvider
            theme={{
                // 1. Use dark algorithm
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    // fontFamily: 'Lowvetica',
                    colorPrimary: '#3e4532',
                    // colorBgBase: isDarkMode ? '#141414' : '#ffffff',
                    // borderRadius: 6,
                    // fontSize: 14,
                    // colorBgContainer: isDarkMode ? '#3e4532' : '#f6ffed',
                    // controlHeight: 32,
                    // controlHeightLG: 40,
                    // controlHeightSM: 24,
                },
                // components: { Button: { colorPrimary: '#740f31ff' } },
                // Uncomment below to enable compact mode

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
