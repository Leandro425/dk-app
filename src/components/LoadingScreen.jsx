import { Flex, Spin } from 'antd'

const LoadingScreen = () => (
    <Flex
        justify="center"
        align="center"
        style={{ height: '100vh', width: '100vw' }}
    >
        <Spin size="large" />
    </Flex>
)

export default LoadingScreen
