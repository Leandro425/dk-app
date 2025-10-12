import { Form } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'
import CustomerSelect from '../../selects/CustomerSelect'

const FormCustomerSelect = ({ name, label = '', required = false, rules = {}, supabase, enabled = false }) => {
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
                    <CustomerSelect
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

export default FormCustomerSelect
