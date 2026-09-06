import { Image } from 'antd'
import DKTextLogo from '@/assets/logo/dk_green_textlogo.png'

const LogoText = ({ width = 400, style, onClick }) => {
    return (
        <Image
            width={width}
            preview={false}
            src={DKTextLogo}
            style={style}
            onClick={onClick}
        />
    )
}

export default LogoText
