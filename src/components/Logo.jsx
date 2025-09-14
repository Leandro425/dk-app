import { Image } from 'antd'

const Logo = ({ width = 400, style }) => {
    return (
        <Image
            width={width}
            preview={false}
            src="../../src/assets/logo/dk_black_logo.png"
            style={style}
        />
    )
}

export default Logo
