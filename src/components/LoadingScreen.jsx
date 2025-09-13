import { Flex, Spin, theme } from 'antd'

const LoadingScreen = () => {
    const { token } = theme.useToken()
    return (
        <Flex
            justify="center"
            align="center"
            style={{
                height: '100vh',
                width: '100vw',
                backgroundColor: token.colorBg,
            }}
        >
            <Spin size="large" />
        </Flex>
    )
}

export default LoadingScreen
