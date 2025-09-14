import { Image } from 'antd'
import DKLogo from '@/assets/logo/dk_black_logo.png'

const Logo = ({ width = 400, style }) => {
    return (
        <Image
            width={width}
            preview={false}
            src={DKLogo}
            style={style}
        />
    )
}

export default Logo
