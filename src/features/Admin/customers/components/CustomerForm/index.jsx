import { useMemo } from 'react'
import { Card, Col, Flex, Row } from 'antd'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import FormInput from '../../../../../components/hookForm/FormInput'
import FormInputNumber from '../../../../../components/hookForm/FormInputNumber'
import FormCheckbox from '../../../../../components/hookForm/FormCheckbox'
import FormTextArea from '../../../../../components/hookForm/FormTextArea'
import FormBaseSelectWithoutQuery from '../../../../../components/hookForm/FormBaseSelectWithoutQuery'
import { getCountryOptions } from '../../../../../utils/address'
import { isEmailSuspicious, isSameName, isVatIdSuspicious, isZipCodeSuspicious } from '../../lib/customer'
import { useCustomers } from '../../hooks/useCustomers'

const Section = ({ title, children }) => (
    <Card
        title={title}
        size="small"
    >
        <Row gutter={16}>{children}</Row>
    </Card>
)

// Default field width inside a section: full on phones, half on tablets, a third on desktops.
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
const error = (fieldError) => (fieldError?.message ? { validateStatus: 'error', help: fieldError.message } : {})

/** Street, house number, ZIP code, city and country for the columns starting with `prefix`. */
const AddressFields = ({ prefix, zipCode, country, countryOptions }) => {
    const { t } = useTranslation()
    const f = (key) => t(`admin.customers.fields.${key}`)

    return (
        <>
            <Field lg={12}>
                <FormInput
                    name={`${prefix}_street`}
                    label={f('street')}
                />
            </Field>
            <Field lg={4}>
                <FormInput
                    name={`${prefix}_house_number`}
                    label={f('houseNumber')}
                />
            </Field>
            <Field lg={8}>
                <FormBaseSelectWithoutQuery
                    name={`${prefix}_country`}
                    label={f('country')}
                    options={countryOptions}
                />
            </Field>
            <Field lg={4}>
                <FormInput
                    name={`${prefix}_zip_code`}
                    label={f('zipCode')}
                    {...warning(isZipCodeSuspicious(zipCode, country), t('admin.customers.warnings.zipCodeFormat'))}
                />
            </Field>
            <Field lg={12}>
                <FormInput
                    name={`${prefix}_city`}
                    label={f('city')}
                />
            </Field>
        </>
    )
}

/**
 * All customer fields in sections. Must be rendered inside a react-hook-form
 * FormProvider and an antd Form (layout vertical). `customerId` is the edited
 * customer (null when creating) and is excluded from the duplicate checks.
 */
const CustomerForm = ({ customerId = null }) => {
    const { t, i18n } = useTranslation()
    const {
        control,
        formState: { errors },
    } = useFormContext()
    const { data: customers = [] } = useCustomers()

    const [name, zipCode, country, billingDiffers, billingZipCode, billingCountry, vatId, email] = useWatch({
        control,
        name: [
            'name',
            'address_zip_code',
            'address_country',
            'billing_differs',
            'billing_zip_code',
            'billing_country',
            'vat_id',
            'email',
        ],
    })

    const others = useMemo(() => customers.filter((customer) => customer.id !== customerId), [customers, customerId])
    const nameTakenBy = others.find((customer) => isSameName(customer.name, name))
    const countryOptions = useMemo(() => getCountryOptions(i18n.language), [i18n.language])

    const f = (key) => t(`admin.customers.fields.${key}`)

    return (
        <Flex
            vertical
            gap={16}
        >
            <Section title={t('admin.customers.sections.masterData')}>
                <Field>
                    <FormInputNumber
                        name="customer_number"
                        label={f('customerNumber')}
                        min={1}
                        precision={0}
                        rules={{
                            validate: (value) =>
                                !value ||
                                !others.some((customer) => customer.customer_number === value) ||
                                t('admin.customers.errors.customerNumberTaken'),
                        }}
                        {...error(errors.customer_number)}
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
                            t('admin.customers.warnings.nameTaken', {
                                number: nameTakenBy?.customer_number ?? '–',
                            })
                        )}
                    />
                </Field>
                <Field>
                    <FormCheckbox
                        name="active"
                        formLabel={f('status')}
                        label={f('active')}
                    />
                </Field>
            </Section>

            <Section title={t('admin.customers.sections.address')}>
                <AddressFields
                    prefix="address"
                    zipCode={zipCode}
                    country={country}
                    countryOptions={countryOptions}
                />
            </Section>

            <Section title={t('admin.customers.sections.billing')}>
                <Field>
                    <FormInputNumber
                        name="payment_term_days"
                        label={f('paymentTermDays')}
                        min={0}
                        precision={0}
                        addonAfter={t('admin.customers.fields.days')}
                    />
                </Field>
                <Field>
                    <FormInput
                        name="vat_id"
                        label={f('vatId')}
                        {...warning(isVatIdSuspicious(vatId), t('admin.customers.warnings.vatIdFormat'))}
                    />
                </Field>
                <Field>
                    <FormCheckbox
                        name="billing_differs"
                        formLabel={f('billingAddress')}
                        label={f('billingDiffers')}
                    />
                </Field>
                {billingDiffers && (
                    <>
                        <Field lg={24}>
                            <FormInput
                                name="billing_name"
                                label={f('billingName')}
                            />
                        </Field>
                        <AddressFields
                            prefix="billing"
                            zipCode={billingZipCode}
                            country={billingCountry}
                            countryOptions={countryOptions}
                        />
                    </>
                )}
            </Section>

            <Section title={t('admin.customers.sections.contact')}>
                <Field>
                    <FormInput
                        name="contact_person"
                        label={f('contactPerson')}
                    />
                </Field>
                <Field>
                    <FormInput
                        name="email"
                        label={f('email')}
                        type="email"
                        {...warning(isEmailSuspicious(email), t('admin.customers.warnings.emailFormat'))}
                    />
                </Field>
                <Field>
                    <FormInput
                        name="phone"
                        label={f('phone')}
                        type="tel"
                    />
                </Field>
            </Section>

            <Section title={t('admin.customers.sections.notes')}>
                <Field
                    md={24}
                    lg={24}
                >
                    <FormTextArea
                        name="notes"
                        label={f('notes')}
                        rows={4}
                    />
                </Field>
            </Section>
        </Flex>
    )
}

export default CustomerForm
