import { Form as AntForm } from 'antd'
import { FormProvider } from 'react-hook-form'

const Form = ({ children, ...form }) => {
    return (
        <FormProvider {...form}>
            <FormContent>{children}</FormContent>
        </FormProvider>
    )
}

export default Form

const FormContent = ({ children }) => {
    return (
        <AntForm
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
        >
            {children}
        </AntForm>
    )
}
