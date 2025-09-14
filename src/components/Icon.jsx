import { Image } from 'antd'
import DKIcon from '@/assets/logo/dk_black_icon.png'

const Icon = ({ width = 400, style }) => {
    return (
        <Image
            width={width}
            preview={false}
            src={DKIcon}
            style={style}
        />
    )
}

export default Icon
