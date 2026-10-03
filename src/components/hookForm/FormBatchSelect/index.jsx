import { Form } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'

import BatchSelect from '../../selects/BatchSelect'

const FormBatchSelect = ({
    name,
    label = '',
    required = false,
    rules = {},
    supabase,
    enabled = false,
    type = null,
}) => {
    const { control } = useFormContext()

    return (
        <Controller
            name={name}
            control={control}
            rules={{
                required,
                ...rules,
            }}
            render={({ field: { onChange, value } }) => (
                <Form.Item
                    label={label}
                    required={required}
                >
                    <BatchSelect
                        supabase={supabase}
                        style={{ width: '100%' }}
                        value={value}
                        onChange={onChange}
                        allowClear
                        enabled={supabase !== null && enabled}
                        type={type}
                    />
                </Form.Item>
            )}
        />
    )
}

export default FormBatchSelect
