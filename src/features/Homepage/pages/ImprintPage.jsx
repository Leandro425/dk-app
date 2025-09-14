import { Flex, Typography } from 'antd'
import Logo from '../../../components/Logo'

const { Title, Paragraph } = Typography

const Imprint = () => {
    return (
        <Flex
            vertical
            align="start"
            justify="center"
            style={{ maxWidth: '800px', margin: '0 auto' }}
            gap={16}
            padding={24}
        >
            <Logo width={500} />
            <Title level={2}>Impressum</Title>
            <Paragraph>
                <strong>DK Nowack GmbH &amp; Co. KG</strong>
                <br />
                Landwehr 121
                <br />
                D-46325 Borken
            </Paragraph>
            <Paragraph>
                <strong>Vertreten durch:</strong>
                <br />
                David Nowack &amp; Kim Nowack
            </Paragraph>
            <Paragraph>
                <strong>Kontakt:</strong>
                <br />
                E-Mail: <a href="mailto:info@dk-nowack.de">info@dk-nowack.de</a>
            </Paragraph>
            <Paragraph>
                <strong>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:</strong>
                <br />
                DE455246338
            </Paragraph>
            <Paragraph>
                <strong>Handelsregister:</strong>
                <br />
                HRA 10912
                <br />
                Registergericht: Coesfeld
            </Paragraph>
        </Flex>
    )
}

export default Imprint
