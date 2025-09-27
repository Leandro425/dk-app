import { Breadcrumb, Flex, Typography } from 'antd'
import { Link } from 'react-router-dom'

const { Title, Paragraph } = Typography

const ContentFrame = ({ title, description, breadcrumbs, children }) => {
    return (
        <Flex
            vertical
            style={{
                display: 'flex',
                flex: 1,
                width: '100%',
                maxWidth: '1800px',
                padding: '0 50px',
            }}
        >
            <Flex vertical>
                <Breadcrumb
                    items={breadcrumbs}
                    style={{ marginTop: '16px' }}
                    itemRender={(item) => <Link to={item.href}>{item.title}</Link>}
                />
                <Title level={2}>{title}</Title>
                <Paragraph>{description}</Paragraph>
            </Flex>
            {children}
        </Flex>
    )
}

export default ContentFrame
