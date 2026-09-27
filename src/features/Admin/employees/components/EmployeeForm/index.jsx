import { useMemo } from 'react'
import { Card, Col, Flex, Row } from 'antd'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import useSupabaseContext from '../../../../../context/supabase/supabaseContext'
import { getLanguageOptions } from '../../../../../config/languages'
import FormInput from '../../../../../components/hookForm/FormInput'
import FormInputNumber from '../../../../../components/hookForm/FormInputNumber'
import FormDatePicker from '../../../../../components/hookForm/FormDatePicker'
import FormStaffGroupSelect from '../../../../../components/hookForm/FormStaffGroupSelect'
import FormBaseSelectWithoutQuery from '../../../../../components/hookForm/FormBaseSelectWithoutQuery'
import FormAutoComplete from '../../../../../components/hookForm/FormAutoComplete'
import {
    CONTRACT_TYPES,
    GENDERS,
    MARITAL_STATUSES,
    getValueOptions,
    isSocialSecurityNumberSuspicious,
    isTaxIdSuspicious,
} from '../../lib/employee'
import { getNationalityOptions } from '../../lib/nationalities'
import { useEmployees, useEmployeeSuggestions } from '../../hooks/useEmployees'

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

/**
 * All employee fields in sections. Must be rendered inside a react-hook-form
 * FormProvider and an antd Form (layout vertical). `employeeId` is the edited
 * employee (null when creating) and is excluded from the duplicate checks.
 */
const EmployeeForm = ({ employeeId = null }) => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const {
        control,
        formState: { errors },
    } = useFormContext()
    const { data: employees = [] } = useEmployees()
    const { data: suggestions } = useEmployeeSuggestions()

    const [staffNumber, socialSecurityNumber, taxId] = useWatch({
        control,
        name: ['staff_number', 'social_security_number', 'tax_id'],
    })

    const others = useMemo(() => employees.filter((employee) => employee.id !== employeeId), [employees, employeeId])
    const staffNumberTakenBy = staffNumber ? others.find((employee) => employee.staff_number === staffNumber) : null

    const nationalityOptions = useMemo(
        () => getNationalityOptions(suggestions?.nationalities ?? []),
        [suggestions?.nationalities]
    )

    const f = (key) => t(`admin.employees.fields.${key}`)

    return (
        <Flex
            vertical
            gap={16}
        >
            <Section title={t('admin.employees.sections.masterData')}>
                <Field>
                    <FormInputNumber
                        name="staff_number"
                        label={f('staffNumber')}
                        required
                        min={1}
                        precision={0}
                        {...warning(
                            staffNumberTakenBy,
                            t('admin.employees.warnings.staffNumberTaken', {
                                name: `${staffNumberTakenBy?.firstname ?? ''} ${staffNumberTakenBy?.lastname ?? ''}`.trim(),
                            })
                        )}
                    />
                </Field>
                <Field>
                    <FormInputNumber
                        name="staff_number_dk"
                        label={f('staffNumberDk')}
                        min={1}
                        precision={0}
                        rules={{
                            validate: (value) =>
                                !value ||
                                !others.some((employee) => employee.staff_number_dk === value) ||
                                t('admin.employees.errors.staffNumberDkTaken'),
                        }}
                        {...error(errors.staff_number_dk)}
                    />
                </Field>
                <Field>
                    <FormStaffGroupSelect
                        name="staff_group_id"
                        label={f('staffGroup')}
                        supabase={supabase}
                        enabled
                    />
                </Field>
                <Field>
                    <FormInput
                        name="firstname"
                        label={f('firstname')}
                        required
                    />
                </Field>
                <Field>
                    <FormInput
                        name="lastname"
                        label={f('lastname')}
                        required
                    />
                </Field>
                <Field>
                    <FormBaseSelectWithoutQuery
                        name="language"
                        label={f('language')}
                        options={getLanguageOptions(t)}
                        required
                    />
                </Field>
                <Field>
                    <FormDatePicker
                        name="entry_date"
                        label={f('entryDate')}
                        rules={{ deps: ['exit_date'] }}
                    />
                </Field>
                <Field>
                    <FormDatePicker
                        name="exit_date"
                        label={f('exitDate')}
                        rules={{
                            validate: (value, values) =>
                                !value ||
                                !values.entry_date ||
                                !value.isBefore(values.entry_date, 'day') ||
                                t('admin.employees.errors.exitBeforeEntry'),
                        }}
                        {...error(errors.exit_date)}
                    />
                </Field>
            </Section>

            <Section title={t('admin.employees.sections.address')}>
                <Field lg={12}>
                    <FormInput
                        name="address_street"
                        label={f('addressStreet')}
                    />
                </Field>
                <Field lg={4}>
                    <FormInput
                        name="address_house_number"
                        label={f('addressHouseNumber')}
                    />
                </Field>
                <Field lg={4}>
                    <FormInput
                        name="address_zip_code"
                        label={f('addressZipCode')}
                    />
                </Field>
                <Field lg={4}>
                    <FormInput
                        name="address_city"
                        label={f('addressCity')}
                    />
                </Field>
            </Section>

            <Section title={t('admin.employees.sections.personal')}>
                <Field>
                    <FormDatePicker
                        name="birthday"
                        label={f('birthday')}
                    />
                </Field>
                <Field>
                    <FormInput
                        name="place_of_birth"
                        label={f('placeOfBirth')}
                    />
                </Field>
                <Field>
                    <FormInput
                        name="country_of_birth"
                        label={f('countryOfBirth')}
                    />
                </Field>
                <Field>
                    <FormBaseSelectWithoutQuery
                        name="nationality"
                        label={f('nationality')}
                        options={nationalityOptions}
                    />
                </Field>
                <Field>
                    <FormBaseSelectWithoutQuery
                        name="gender"
                        label={f('gender')}
                        options={getValueOptions(t, 'gender', GENDERS)}
                    />
                </Field>
                <Field>
                    <FormBaseSelectWithoutQuery
                        name="marital_status"
                        label={f('maritalStatus')}
                        options={getValueOptions(t, 'marital_status', MARITAL_STATUSES)}
                    />
                </Field>
                <Field>
                    <FormInputNumber
                        name="children"
                        label={f('children')}
                        min={0}
                        precision={0}
                    />
                </Field>
            </Section>

            <Section title={t('admin.employees.sections.contract')}>
                <Field>
                    <FormInput
                        name="job_title"
                        label={f('jobTitle')}
                    />
                </Field>
                <Field>
                    <FormBaseSelectWithoutQuery
                        name="contract_type"
                        label={f('contractType')}
                        options={getValueOptions(t, 'contract_type', CONTRACT_TYPES)}
                    />
                </Field>
                <Field>
                    <FormAutoComplete
                        name="pay_type"
                        label={f('payType')}
                        suggestions={suggestions?.payTypes}
                    />
                </Field>
                <Field>
                    <FormAutoComplete
                        name="standard_pay"
                        label={f('standardPay')}
                        suggestions={suggestions?.standardPays}
                    />
                </Field>
                <Field>
                    <FormInputNumber
                        name="pay_rate"
                        label={f('payRate')}
                        min={0}
                        step={0.01}
                        precision={2}
                        decimalSeparator=","
                        addonAfter="€/h"
                    />
                </Field>
                <Field>
                    <FormDatePicker
                        name="pay_rate_valid_from"
                        label={f('payRateValidFrom')}
                    />
                </Field>
            </Section>

            <Section title={t('admin.employees.sections.tax')}>
                <Field lg={12}>
                    <FormInput
                        name="social_security_number"
                        label={f('socialSecurityNumber')}
                        {...warning(
                            isSocialSecurityNumberSuspicious(socialSecurityNumber),
                            t('admin.employees.warnings.socialSecurityNumberFormat')
                        )}
                    />
                </Field>
                <Field lg={12}>
                    <FormInput
                        name="tax_id"
                        label={f('taxId')}
                        {...warning(isTaxIdSuspicious(taxId), t('admin.employees.warnings.taxIdFormat'))}
                    />
                </Field>
            </Section>
        </Flex>
    )
}

export default EmployeeForm
