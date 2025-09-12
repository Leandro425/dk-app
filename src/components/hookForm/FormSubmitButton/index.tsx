import { Button, Form } from 'antd'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const FormSubmitButton = ({
    i18nKey = 'common.actions.submit',
    onSubmit,
}: {
    i18nKey?: string
    onSubmit?: (data: any) => void | Promise<void>
}) => {
    const [loading, setLoading] = useState(false)
    const { t } = useTranslation()
    const form = useFormContext()

    const {
        handleSubmit,
        formState: { isDirty, isValid },
    } = form

    const loadingSubmit = (data: any) => {
        const possiblePromise = onSubmit ? onSubmit(data) : Promise.resolve()
        if (possiblePromise instanceof Promise) {
            setLoading(true)
            possiblePromise.finally(() => {
                setLoading(false)
            })
        }
    }

    return (
        <Form.Item label={null}>
            <Button
                onClick={handleSubmit(loadingSubmit)}
                disabled={!isDirty || !isValid || loading}
                loading={loading}
                type="primary"
                // block
            >
                {t(i18nKey)}
            </Button>
        </Form.Item>
    )
}

export default FormSubmitButton
