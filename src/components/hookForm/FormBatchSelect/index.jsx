import { Form } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'

import FieldSelect from '../../selects/FieldSelect'

const FormFieldSelect = ({ name, label = '', required = false, rules = {}, supabase, enabled = false }) => {
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
                    <FieldSelect
                        supabase={supabase}
                        style={{ width: '100%' }}
                        value={value}
                        onChange={onChange}
                        allowClear
                        enabled={supabase !== null && enabled}
                    />
                </Form.Item>
            )}
        />
    )
}

export default FormFieldSelect
