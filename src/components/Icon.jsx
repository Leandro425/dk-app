import { Image } from 'antd'

const Icon = ({ width = 400, style }) => {
    return (
        <Image
            width={width}
            preview={false}
            src="../../src/assets/logo/dk_black_icon.png"
            style={style}
        />
    )
}

export default Icon
