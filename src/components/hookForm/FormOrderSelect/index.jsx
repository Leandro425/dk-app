import { Form } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'
import OrderSelect from '../../selects/OrderSelect'

const FormOrderSelect = ({ name, label = '', required = false, rules = {}, supabase, enabled = false }) => {
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
                    <OrderSelect
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

export default FormOrderSelect
