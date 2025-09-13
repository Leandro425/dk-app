import { Card, Layout, Space } from 'antd'
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
const LoginPage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

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
            console.log('Login error:', error.message)
            return
        }
        navigate('/app/dashboard')
    }
    return (
        <Layout>
            <Content style={{ display: 'flex', height: '100vh', width: '100vw' }}>
                <Flex
                    direction="column"
                    justify="center"
                    align="center"
                    style={{ width: '100%' }}
                >
                    <Card title={t('auth.login.title')}>
                        <Space
                            direction="vertical"
                            align="center"
                            size="large"
                        >
                            <Logo width={300} />
                            <Form {...form}>
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
