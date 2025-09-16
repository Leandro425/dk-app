import { Form as AntForm } from 'antd'
import { FormProvider } from 'react-hook-form'

const Form = ({ children, style, ...form }) => {
    return (
        <FormProvider {...form}>
            <FormContent style={style}>{children}</FormContent>
        </FormProvider>
    )
}

export default Form

const FormContent = ({ style, children }) => {
    return (
        <AntForm
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={style}
        >
            {children}
        </AntForm>
    )
}
