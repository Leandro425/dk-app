import { useEffect, useMemo } from 'react'
import { Alert, Button, Flex, Form, Popconfirm, Spin, Tooltip, message } from 'antd'
import { ArrowLeftOutlined, DeleteFilled, SaveOutlined } from '@ant-design/icons'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import ContentFrame from '../../../components/ContentFrame'
import EmployeeForm from '../employees/components/EmployeeForm'
import { EmployeeStatusTag } from '../employees/components/EmployeesTable'
import { useDeleteEmployee, useEmployee, useEmployees, useSaveEmployee } from '../employees/hooks/useEmployees'
import { toFormValues } from '../employees/lib/employee'
import { EMPLOYEES_BASE } from '../constants'

// Postgres error codes returned by PostgREST.
const UNIQUE_VIOLATION = '23505'
const FOREIGN_KEY_VIOLATION = '23503'

/** Create (`/employees/new`) or edit (`/employees/:employeeId`) one employee. */
const EmployeePage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { employeeId: idParam } = useParams()
    const isNew = idParam === 'new'
    const employeeId = isNew ? null : Number(idParam)

    const [messageApi, contextHolder] = message.useMessage()
    const { data: employees } = useEmployees()
    const { data: employee, isLoading, isError, error } = useEmployee(employeeId)
    const saveEmployee = useSaveEmployee()
    const deleteEmployee = useDeleteEmployee()

    // A new employee gets the next free staff number as a suggestion (once the list is loaded).
    const nextStaffNumber = useMemo(
        () => (employees ? employees.reduce((max, e) => Math.max(max, e.staff_number ?? 0), 0) + 1 : null),
        [employees]
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
        } else if (employee) {
            reset(toFormValues(employee))
        }
    }, [isNew, employee, reset])

    // Only fills an empty staff number, so nothing typed meanwhile is overwritten.
    useEffect(() => {
        if (isNew && nextStaffNumber && getValues('staff_number') === null) {
            setValue('staff_number', nextStaffNumber, { shouldValidate: true })
        }
    }, [isNew, nextStaffNumber, getValues, setValue])

    const showError = (err) => {
        const content =
            err?.code === UNIQUE_VIOLATION
                ? t('admin.employees.errors.staffNumberDkTaken')
                : err?.code === FOREIGN_KEY_VIOLATION
                  ? t('admin.employees.errors.hasHistory')
                  : `${t('common.messages.errorOccurred')} ${err?.message ?? ''}`.trim()
        messageApi.open({ type: 'error', content, duration: 5 })
    }

    const onSubmit = (values) =>
        saveEmployee.mutateAsync({ id: employeeId, values }).then((savedId) => {
            messageApi.open({
                type: 'success',
                content: t(isNew ? 'common.messages.successfullyAdded' : 'common.messages.successfullyUpdated'),
                duration: 3,
            })
            if (isNew) navigate(`${EMPLOYEES_BASE}/${savedId}`, { replace: true })
        }, showError)

    const onDelete = () =>
        deleteEmployee.mutateAsync(employeeId).then(() => {
            messageApi.open({ type: 'success', content: t('common.messages.successfullyDeleted'), duration: 3 })
            navigate(EMPLOYEES_BASE)
        }, showError)

    if (!isNew && !Number.isInteger(employeeId)) {
        return (
            <Navigate
                to={EMPLOYEES_BASE}
                replace={true}
            />
        )
    }

    const name = employee ? `${employee.firstname ?? ''} ${employee.lastname ?? ''}`.trim() : ''
    const title = isNew ? t('admin.employees.new.title') : name || t('admin.employees.edit.title')
    const hasHistory = (employee?.historyCount ?? 0) > 0

    return (
        <ContentFrame
            title={title}
            description={isNew ? t('admin.employees.new.description') : t('admin.employees.edit.description')}
            extraBreadcrumbs={[
                {
                    href: `${EMPLOYEES_BASE}/${idParam}`,
                    title: isNew ? t('admin.employees.new.title') : name || t('admin.employees.edit.title'),
                },
            ]}
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
                                        onClick={() => navigate(EMPLOYEES_BASE)}
                                    >
                                        {t('admin.employees.actions.back')}
                                    </Button>
                                    {employee && <EmployeeStatusTag employee={employee} />}
                                </Flex>
                                <Flex gap={8}>
                                    {!isNew && (
                                        <Popconfirm
                                            title={t('admin.employees.actions.delete')}
                                            description={t('admin.employees.actions.deleteConfirmation')}
                                            onConfirm={onDelete}
                                            okText={t('common.yes')}
                                            cancelText={t('common.no')}
                                            disabled={hasHistory}
                                        >
                                            <Tooltip title={hasHistory ? t('admin.employees.errors.hasHistory') : null}>
                                                <Button
                                                    danger
                                                    icon={<DeleteFilled />}
                                                    disabled={hasHistory}
                                                    loading={deleteEmployee.isPending}
                                                >
                                                    {t('common.actions.delete')}
                                                </Button>
                                            </Tooltip>
                                        </Popconfirm>
                                    )}
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        disabled={!isDirty || !isValid || saveEmployee.isPending}
                                        loading={saveEmployee.isPending}
                                        onClick={handleSubmit(onSubmit)}
                                    >
                                        {t('common.actions.save')}
                                    </Button>
                                </Flex>
                            </Flex>
                            <EmployeeForm employeeId={employeeId} />
                        </Flex>
                    </Form>
                </FormProvider>
            )}
        </ContentFrame>
    )
}

export default EmployeePage
