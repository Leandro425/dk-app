import { Image } from 'antd'
import DKTextLogo from '@/assets/logo/dk_green_textlogo.png'

const LogoText = ({ width = 400, style }) => {
    return (
        <Image
            width={width}
            preview={false}
            src={DKTextLogo}
            style={style}
        />
    )
}

export default LogoText
