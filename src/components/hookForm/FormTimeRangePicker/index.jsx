import { Form, TimePicker } from 'antd'

import { Controller, useFormContext } from 'react-hook-form'

const FormDatePicker = ({ name, label = '', required = false, rules = {} }) => {
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
                    <TimePicker.RangePicker
                        onChange={(range) => onChange(range)}
                        value={value}
                        format="HH:mm"
                        minuteStep={15}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            )}
        />
    )
}

export default FormDatePicker
