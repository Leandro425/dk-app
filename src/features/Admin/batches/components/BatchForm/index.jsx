import { useMemo } from 'react'
import { Card, Col, Flex, Form, Input, Row } from 'antd'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import FormInput from '../../../../../components/hookForm/FormInput'
import FormTextArea from '../../../../../components/hookForm/FormTextArea'
import FormCheckbox from '../../../../../components/hookForm/FormCheckbox'
import FormBaseSelectWithoutQuery from '../../../../../components/hookForm/FormBaseSelectWithoutQuery'
import { BATCH_TYPES, isSameText } from '../../lib/batch'
import { useBatches } from '../../hooks/useBatches'
import { BatchTypeTag } from '../BatchesTable'

// Default field width: full on phones, half on tablets, a third on desktops.
const Field = ({ children, md = 12, lg = 8 }) => (
    <Col
        xs={24}
        md={md}
        lg={lg}
    >
        {children}
    </Col>
)

const warning = (show, message) => (show ? { validateStatus: 'warning', help: message } : {})

/**
 * All batch fields. Must be rendered inside a react-hook-form FormProvider and an antd
 * Form (layout vertical). `batch` is the edited batch (null when creating): its number and
 * type are shown read-only, a new batch gets its number from the database on save.
 */
const BatchForm = ({ batch = null }) => {
    const { t } = useTranslation()
    const { control } = useFormContext()
    const { data: batches = [] } = useBatches()

    const [type, name] = useWatch({ control, name: ['type', 'name'] })

    const nameTakenBy = useMemo(
        () => batches.find((other) => other.id !== batch?.id && other.type === type && isSameText(other.name, name)),
        [batches, batch, type, name]
    )
    const typeOptions = useMemo(
        () => BATCH_TYPES.map((value) => ({ value, label: t(`admin.batches.types.${value}`) })),
        [t]
    )

    const f = (key) => t(`admin.batches.fields.${key}`)

    return (
        <Card size="small">
            <Row gutter={16}>
                <Field>
                    <Form.Item
                        label={f('batchNumber')}
                        help={batch ? null : f('batchNumberHelp')}
                    >
                        <Input
                            value={batch?.batch_number ?? ''}
                            placeholder={f('batchNumberPlaceholder')}
                            disabled
                        />
                    </Form.Item>
                </Field>
                <Field>
                    {batch ? (
                        <Form.Item
                            label={f('type')}
                            help={f('typeHelp')}
                        >
                            <BatchTypeTag type={batch.type} />
                        </Form.Item>
                    ) : (
                        <FormBaseSelectWithoutQuery
                            name="type"
                            label={f('type')}
                            required
                            options={typeOptions}
                        />
                    )}
                </Field>
                <Field>
                    <FormCheckbox
                        name="active"
                        formLabel={f('status')}
                        label={f('active')}
                    />
                </Field>
                <Field>
                    <FormInput
                        name="name"
                        label={f('name')}
                        required
                        rules={{ validate: (value) => Boolean(value?.trim()) }}
                        {...warning(
                            nameTakenBy,
                            t('admin.batches.warnings.nameTaken', { number: nameTakenBy?.batch_number ?? '–' })
                        )}
                    />
                </Field>
                <Field>
                    <FormInput
                        name="external_number"
                        label={f(type === 'purchase' ? 'externalNumberPurchase' : 'externalNumberField')}
                        help={f('externalNumberHelp')}
                    />
                </Field>
                <Field
                    md={24}
                    lg={24}
                >
                    <FormTextArea
                        name="description"
                        label={f('description')}
                        rows={4}
                    />
                </Field>
            </Row>
        </Card>
    )
}

export default BatchForm
