import { Flex, Layout, Spin } from 'antd'

const LoadingScreen = () => {
    return (
        <Layout>
            <Flex
                justify="center"
                align="center"
                style={{
                    height: '100vh',
                    width: '100vw',
                }}
            >
                <Flex
                    justify="center"
                    align="center"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        padding: 15,
                        borderRadius: '8px',
                    }}
                >
                    <Spin size="large" />
                </Flex>
            </Flex>
        </Layout>
    )
}

export default LoadingScreen
