import { Breadcrumb, Flex, Typography } from 'antd'

const { Title, Paragraph } = Typography

const ContentFrame = ({ title, description, breadcrumbs, children }) => {
    return (
        <Flex
            vertical
            style={{
                display: 'flex',
                flex: 1,
                width: '100%',
                maxWidth: '1200px',
            }}
        >
            <Flex vertical>
                <Breadcrumb
                    items={breadcrumbs}
                    style={{ marginTop: '16px' }}
                />
                <Title>{title}</Title>
                <Paragraph>{description}</Paragraph>
            </Flex>
            {children}
        </Flex>
    )
}

export default ContentFrame
