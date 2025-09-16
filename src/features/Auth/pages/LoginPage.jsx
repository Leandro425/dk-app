import { Card, Layout, Space, message } from 'antd'
import { Flex } from 'antd'
import { useForm } from 'react-hook-form'

const { Content } = Layout

import { useTranslation } from 'react-i18next'
import FormTextField from '../../../components/hookForm/FormInput'
import FormSubmitButton from '../../../components/hookForm/FormSubmitButton'
import Form from '../../../components/hookForm/Form'
import useSupabaseContext from '../../../context/supabase/supabaseContext'
import { useNavigate } from 'react-router-dom'
import Logo from '../../../components/Logo'

import BackGroundImage1 from '../../../../src/assets/background/field_1.jpg'
const LoginPage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [messageApi, contextHolder] = message.useMessage()

    const { login } = useSupabaseContext()

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data) => {
        const { email, password } = data
        const { error } = await login(email, password)
        if (error) {
            messageApi.open({
                type: 'error',
                content: error?.message,
            })
            return
        }
        navigate('/app/dashboard')
    }
    return (
        <Layout>
            {contextHolder}
            <Content
                style={{
                    display: 'flex',
                    height: '100vh',
                    width: '100vw',
                    background: `url(${BackGroundImage1})`,
                    backgroundSize: 'cover',
                }}
            >
                <Flex
                    direction="column"
                    justify="center"
                    align="center"
                    style={{
                        width: '100%',
                    }}
                >
                    <Card title={t('auth.login.title')}>
                        <Space
                            direction="vertical"
                            align="center"
                            size="large"
                            style={{ width: '100%' }}
                        >
                            <Logo width={300} />
                            <Form
                                style={{ width: 350 }}
                                {...form}
                            >
                                <FormTextField
                                    name="email"
                                    label={t('auth.login.email')}
                                    required
                                    type="email"
                                />
                                <FormTextField
                                    name="password"
                                    label={t('auth.login.password')}
                                    required
                                    type="password"
                                />
                                <FormSubmitButton
                                    onSubmit={onSubmit}
                                    i18nKey="common.actions.signIn"
                                />
                            </Form>
                        </Space>
                    </Card>
                </Flex>
            </Content>
        </Layout>
    )
}

export default LoginPage
