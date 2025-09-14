import { useState } from 'react'
import { Card, ConfigProvider, theme } from 'antd'
import { ThemeContext, useThemeContext } from './useThemeContext'

// https://ant.design/docs/react/customize-theme

const backgroundColorLight = '#f5f5f5ff'
const backgroundColorDark = '#323829ff'
const headerHeight = 80

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
            headerBg: backgroundColorLight,
            footerBg: backgroundColorLight,
            bodyBg: backgroundColorLight,
            headerHeight: headerHeight,
        },
        Button: {
            colorPrimaryBorder: '#718159ff',
            colorPrimaryHover: '#718159ff',
            primaryShadow: '0 2px 0 rgba(62, 69, 50, 1)',
        },
    },
}

const themeDark = {
    algorithm: theme.darkAlgorithm,
    token: {
        colorPrimary: '#3e4532',
        colorInfo: '#3e4532',
        colorError: '#d9003e',
        colorWarning: '#ffc932',
        colorSuccess: '#4eb03c',
    },

    components: {
        Layout: {
            headerBg: backgroundColorDark,
            footerBg: backgroundColorDark,
            bodyBg: backgroundColorDark,
            headerHeight: headerHeight,
        },
        Button: {
            colorPrimaryBorder: '#718159ff',
            colorPrimaryHover: '#718159ff',
            primaryShadow: '0 2px 0 rgba(57, 63, 46, 1)',
        },
        // Card: {
        //     colorBgContainer: '#2e3326ff',
        // },
        // Table: {
        //     colorBgContainer: '#2e3326ff',
        // },
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
