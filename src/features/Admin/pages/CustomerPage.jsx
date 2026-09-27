import { useEffect, useMemo } from 'react'
import { Alert, Button, Flex, Form, Popconfirm, Spin, Tooltip, message } from 'antd'
import { ArrowLeftOutlined, DeleteFilled, SaveOutlined } from '@ant-design/icons'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import ContentFrame from '../../../components/ContentFrame'
import CustomerForm from '../customers/components/CustomerForm'
import { CustomerStatusTag } from '../customers/components/CustomersTable'
import { useCustomer, useCustomers, useDeleteCustomer, useSaveCustomer } from '../customers/hooks/useCustomers'
import { toFormValues } from '../customers/lib/customer'
import { CUSTOMERS_BASE } from '../constants'

// Postgres error codes returned by PostgREST.
const UNIQUE_VIOLATION = '23505'
const FOREIGN_KEY_VIOLATION = '23503'

/** Create (`/customers/new`) or edit (`/customers/:customerId`) one customer. */
const CustomerPage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { customerId: idParam } = useParams()
    const isNew = idParam === 'new'
    const customerId = isNew ? null : Number(idParam)

    const [messageApi, contextHolder] = message.useMessage()
    const { data: customers } = useCustomers()
    const { data: customer, isLoading, isError, error } = useCustomer(customerId)
    const saveCustomer = useSaveCustomer()
    const deleteCustomer = useDeleteCustomer()

    // A new customer gets the next free customer number as a suggestion (once the list is loaded).
    const nextCustomerNumber = useMemo(
        () => (customers ? customers.reduce((max, c) => Math.max(max, c.customer_number ?? 0), 0) + 1 : null),
        [customers]
    )

    const form = useForm({ mode: 'onChange', defaultValues: toFormValues(null) })
    const {
        handleSubmit,
        reset,
        getValues,
        setValue,
        formState: { isDirty, isValid },
    } = form

    useEffect(() => {
        if (isNew) {
            reset(toFormValues(null))
        } else if (customer) {
            reset(toFormValues(customer))
        }
    }, [isNew, customer, reset])

    // Only fills an empty customer number, so nothing typed meanwhile is overwritten.
    useEffect(() => {
        if (isNew && nextCustomerNumber && getValues('customer_number') === null) {
            setValue('customer_number', nextCustomerNumber, { shouldValidate: true })
        }
    }, [isNew, nextCustomerNumber, getValues, setValue])

    const showError = (err) => {
        const content =
            err?.code === UNIQUE_VIOLATION
                ? t('admin.customers.errors.customerNumberTaken')
                : err?.code === FOREIGN_KEY_VIOLATION
                  ? t('admin.customers.errors.hasDeliveries')
                  : `${t('common.messages.errorOccurred')} ${err?.message ?? ''}`.trim()
        messageApi.open({ type: 'error', content, duration: 5 })
    }

    const onSubmit = (values) =>
        saveCustomer.mutateAsync({ id: customerId, values }).then((savedId) => {
            messageApi.open({
                type: 'success',
                content: t(isNew ? 'common.messages.successfullyAdded' : 'common.messages.successfullyUpdated'),
                duration: 3,
            })
            if (isNew) navigate(`${CUSTOMERS_BASE}/${savedId}`, { replace: true })
        }, showError)

    const onDelete = () =>
        deleteCustomer.mutateAsync(customerId).then(() => {
            messageApi.open({ type: 'success', content: t('common.messages.successfullyDeleted'), duration: 3 })
            navigate(CUSTOMERS_BASE)
        }, showError)

    if (!isNew && !Number.isInteger(customerId)) {
        return (
            <Navigate
                to={CUSTOMERS_BASE}
                replace={true}
            />
        )
    }

    const title = isNew ? t('admin.customers.new.title') : customer?.name || t('admin.customers.edit.title')
    const hasDeliveries = (customer?.deliveryCount ?? 0) > 0

    return (
        <ContentFrame
            title={title}
            description={isNew ? t('admin.customers.new.description') : t('admin.customers.edit.description')}
            extraBreadcrumbs={[{ href: `${CUSTOMERS_BASE}/${idParam}`, title }]}
        >
            {contextHolder}
            {isError ? (
                <Alert
                    type="error"
                    showIcon
                    message={t('common.messages.errorOccurred')}
                    description={error?.message}
                />
            ) : !isNew && isLoading ? (
                <Spin
                    size="large"
                    style={{ display: 'block', margin: '96px auto' }}
                />
            ) : (
                <FormProvider {...form}>
                    <Form layout="vertical">
                        <Flex
                            vertical
                            gap={16}
                        >
                            <Flex
                                wrap
                                gap={8}
                                align="center"
                                justify="space-between"
                            >
                                <Flex
                                    gap={8}
                                    align="center"
                                >
                                    <Button
                                        icon={<ArrowLeftOutlined />}
                                        onClick={() => navigate(CUSTOMERS_BASE)}
                                    >
                                        {t('admin.customers.actions.back')}
                                    </Button>
                                    {customer && <CustomerStatusTag customer={customer} />}
                                </Flex>
                                <Flex gap={8}>
                                    {!isNew && (
                                        <Popconfirm
                                            title={t('admin.customers.actions.delete')}
                                            description={t('admin.customers.actions.deleteConfirmation')}
                                            onConfirm={onDelete}
                                            okText={t('common.yes')}
                                            cancelText={t('common.no')}
                                            disabled={hasDeliveries}
                                        >
                                            <Tooltip
                                                title={hasDeliveries ? t('admin.customers.errors.hasDeliveries') : null}
                                            >
                                                <Button
                                                    danger
                                                    icon={<DeleteFilled />}
                                                    disabled={hasDeliveries}
                                                    loading={deleteCustomer.isPending}
                                                >
                                                    {t('common.actions.delete')}
                                                </Button>
                                            </Tooltip>
                                        </Popconfirm>
                                    )}
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        disabled={!isDirty || !isValid || saveCustomer.isPending}
                                        loading={saveCustomer.isPending}
                                        onClick={handleSubmit(onSubmit)}
                                    >
                                        {t('common.actions.save')}
                                    </Button>
                                </Flex>
                            </Flex>
                            <CustomerForm customerId={customerId} />
                        </Flex>
                    </Form>
                </FormProvider>
            )}
        </ContentFrame>
    )
}

export default CustomerPage
