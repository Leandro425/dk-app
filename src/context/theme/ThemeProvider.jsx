import { useState } from 'react'
import { ConfigProvider, theme } from 'antd'
import { ThemeContext, useThemeContext } from './useThemeContext'

// https://ant.design/docs/react/customize-theme

const themeLight = {
    algorithm: theme.defaultAlgorithm,
    // fontFamily: 'Lowvetica',
    token: {
        colorPrimary: '#3e4532',
        colorInfo: '#3e4532',
        colorError: '#d9003e',
        colorWarning: '#ffc932',
        colorSuccess: '#4eb03c',
    },
    components: {
        Layout: {
            headerBg: '#F5E9E2',
            footerBg: '#F5E9E2',
            bodyBg: '#F5E9E2',
        },
        Button: {
            colorPrimaryBorder: '#718159ff',
            colorPrimaryHover: '#718159ff',
            primaryShadow: '0 2px 0 rgba(62, 69, 50, 1)',
        },
    },

    // colorBgBase: isDarkMode ? '#141414' : '#ffffff',
    // borderRadius: 6,
    // fontSize: 14,
    // colorBgContainer: isDarkMode ? '#3e4532' : '#f6ffed',
    // controlHeight: 32,
    // controlHeightLG: 40,
    // controlHeightSM: 24,

    // components: { Button: { colorPrimary: '#740f31ff' } },
    // Uncomment below to enable compact mode

    // 2. Combine dark algorithm and compact algorithm
    // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm]
}

const themeDark = {
    algorithm: theme.darkAlgorithm,
    colorPrimary: '#3e4532',

    components: {
        Layout: {
            headerBg: '#21241dff',
            footerBg: '#21241dff',
            bodyBg: '#21241dff',
        },
        Button: {
            colorPrimaryBorder: '#718159ff',
            colorPrimaryHover: '#718159ff',
            primaryShadow: '0 2px 0 rgba(62, 69, 50, 1)',
        },
    },
}

const AntConfigProvider = ({ children }) => {
    const { isDarkMode } = useThemeContext()
    return <ConfigProvider theme={isDarkMode ? themeDark : themeLight}>{children}</ConfigProvider>
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
