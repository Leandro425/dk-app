import { Layout } from 'antd'

import AppHeader from '../AppHeader'
import AreaSider from '../AreaSider'

const { Content } = Layout

/**
 * Layout shared by all logged-in areas: global header, module sidebar, centered content.
 * The shell fills the viewport; header and sidebar stay put and only the content pane scrolls.
 * Which area is shown is derived from the URL via `useAreaNav`, so the route files only
 * need to wrap their `<Routes>` in this component.
 */
const AppShell = ({ children }) => {
    return (
        <Layout style={{ height: '100vh', width: '100vw' }}>
            <AppHeader />
            <Layout style={{ flex: 1, minHeight: 0 }}>
                <AreaSider />
                <Content
                    style={{ overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}

export default AppShell
