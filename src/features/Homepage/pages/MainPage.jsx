import { Flex } from 'antd'
import BackGroundImage1 from '../../../../src/assets/background/forest_1.jpg'
import Logo from '../../../components/Logo'

const MainPage = () => {
    return (
        <Flex
            vertical
            style={{ minHeight: '100vh', width: '100vw' }}
        >
            <Flex
                vertical
                flex={1}
                align="center"
                gap={32}
                style={{
                    width: '100%',
                    paddingTop: 64,
                    backgroundImage: `url(${BackGroundImage1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '100vh',
                }}
            >
                <Logo />
            </Flex>
        </Flex>
    )
}

export default MainPage
