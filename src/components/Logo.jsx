import { Image } from 'antd'

const Logo = ({ width = 400, style }) => {
    return (
        <Image
            width={width}
            preview={false}
            src="../../src/assets/dk_logo_black.png"
            style={style}
        />
    )
}

export default Logo
