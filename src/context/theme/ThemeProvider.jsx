import { useState } from 'react'
import { ConfigProvider, theme } from 'antd'
import { ThemeContext, useThemeContext } from './useThemeContext'

// https://ant.design/docs/react/customize-theme
//
// Brand: dark olive. Every neutral is tinted a few points toward that hue so the olive does not
// look muddy against pure grey. Dark surfaces are set explicitly instead of inheriting antd's
// near-black containers, which clashed with the olive body.

const headerHeight = 80

const layoutLight = '#f3f4ee'
const layoutDark = '#2b3024'

const shared = {
    colorPrimary: '#3e4532',
    colorInfo: '#3e4532',
    colorError: '#df003f',
    colorWarning: '#ffc932',
    colorSuccess: '#4eb03c',
    fontFamily: "Roboto, 'Helvetica Neue', Arial, sans-serif",
    borderRadius: 6,
}

const sharedComponents = {
    Menu: { itemBorderRadius: 6, itemMarginInline: 8 },
    Button: { primaryShadow: 'none', dangerShadow: 'none' },
}

const themeLight = {
    algorithm: theme.defaultAlgorithm,
    token: {
        ...shared,
        colorPrimaryHover: '#55613f',
        colorPrimaryBg: '#e6eadb',
        colorPrimaryBgHover: '#d9dfc9',
        colorBgLayout: layoutLight,
        colorBgContainer: '#ffffff',
        colorBorder: '#d5d9ca',
        colorBorderSecondary: '#e4e7db',
        colorText: '#1f231a',
        colorTextSecondary: '#4b5142',
    },
    components: {
        ...sharedComponents,
        Layout: { headerBg: layoutLight, bodyBg: layoutLight, footerBg: layoutLight, headerHeight },
    },
}

const themeDark = {
    algorithm: theme.darkAlgorithm,
    token: {
        ...shared,
        // A #3e4532 button is nearly invisible on a dark ground; a lighter olive keeps the brand readable.
        colorPrimary: '#a9b88f',
        colorPrimaryHover: '#c1cfa8',
        colorPrimaryBg: '#3f4a33',
        colorPrimaryBgHover: '#4a5640',
        colorBgLayout: layoutDark,
        colorBgContainer: '#363c2d',
        colorBgElevated: '#414836',
        colorBorder: '#545c47',
        colorBorderSecondary: '#464e3b',
        colorText: '#e9ebdf',
        colorTextSecondary: '#c4c9b5',
    },
    components: {
        ...sharedComponents,
        Layout: { headerBg: layoutDark, bodyBg: layoutDark, footerBg: layoutDark, headerHeight },
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
