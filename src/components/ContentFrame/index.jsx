import { Breadcrumb, Flex, Typography } from 'antd'
import { Link } from 'react-router-dom'

import useAreaNav from '../../hooks/useAreaNav'

const { Title, Paragraph } = Typography

const renderBreadcrumb = (item) => (item.href ? <Link to={item.href}>{item.title}</Link> : item.title)

/**
 * Page frame with breadcrumbs, title and description.
 * Breadcrumbs default to area + selected module from the navigation config;
 * pass `extraBreadcrumbs` to append deeper levels (e.g. a single delivery),
 * or `breadcrumbs` to replace them entirely.
 */
const ContentFrame = ({ title, description, breadcrumbs, extraBreadcrumbs = [], children }) => {
    const nav = useAreaNav()
    const items = breadcrumbs ?? [...nav.breadcrumbs, ...extraBreadcrumbs]

    return (
        <Flex
            vertical
            style={{
                display: 'flex',
                flex: 1,
                width: '100%',
                maxWidth: '2400px',
                padding: '0 50px 32px',
            }}
        >
            <Flex vertical>
                <Breadcrumb
                    items={items}
                    style={{ marginTop: '16px' }}
                    itemRender={renderBreadcrumb}
                />
                <Title level={2}>{title}</Title>
                <Paragraph>{description}</Paragraph>
            </Flex>
            {children}
        </Flex>
    )
}

export default ContentFrame
