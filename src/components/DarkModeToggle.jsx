import { useThemeContext } from '../context/theme/useThemeContext'

import { Button } from 'antd'
import { MoonFilled, SunFilled } from '@ant-design/icons'

const DarkModeToggle = () => {
    const { isDarkMode, setIsDarkMode } = useThemeContext()

    const toggleDarkMode = () => {
        setIsDarkMode((m) => !m)
    }
    return (
        <Button
            type="primary"
            icon={isDarkMode ? <SunFilled /> : <MoonFilled />}
            onClick={toggleDarkMode}
        />
    )
}

export default DarkModeToggle
