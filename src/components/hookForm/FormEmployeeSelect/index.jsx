import { Form } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'

import EmployeeSelect from '../../selects/EmployeeSelect'

const FormEmployeeSelect = ({
    name,
    label = '',
    required = false,
    rules = {},
    supabase,
    staffgroup,
    enabled = false,
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
                    <EmployeeSelect
                        supabase={supabase}
                        style={{ width: '100%' }}
                        value={value}
                        onChange={onChange}
                        allowClear
                        staffgroup={staffgroup}
                        enabled={supabase !== null && enabled}
                    />
                </Form.Item>
            )}
        />
    )
}

export default FormEmployeeSelect
