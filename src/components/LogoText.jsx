import { Image } from 'antd'

const LogoText = ({ width = 400, style }) => {
    return (
        <Image
            width={width}
            preview={false}
            src="../../src/assets/logo/dk_green_textlogo.png"
            style={style}
        />
    )
}

export default LogoText
