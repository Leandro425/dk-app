import { useMemo, useState } from 'react'
import { Alert, Button, Flex, Input, Segmented, Table, Tag, Tooltip } from 'antd'
import { PlusOutlined, UpSquareFilled } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LANGUAGE_LABEL_KEYS } from '../../../../../config/languages'
import { formatDate, isEmployeeActive } from '../../../../../utils/helpers'
import { useEmployees } from '../../hooks/useEmployees'
import { EMPLOYEES_BASE } from '../../../constants'

export const EmployeeStatusTag = ({ employee }) => {
    const { t } = useTranslation()
    return isEmployeeActive(employee) ? (
        <Tag color="green">{t('admin.employees.status.active')}</Tag>
    ) : (
        <Tag>{t('admin.employees.status.inactive')}</Tag>
    )
}

const STATUS_FILTERS = {
    active: (employee) => isEmployeeActive(employee),
    inactive: (employee) => !isEmployeeActive(employee),
    all: () => true,
}

const matchesSearch = (employee, search) => {
    if (!search) return true
    const haystack = [employee.staff_number, employee.staff_number_dk, employee.firstname, employee.lastname]
        .filter((part) => part !== null && part !== undefined)
        .join(' ')
        .toLowerCase()
    return search
        .toLowerCase()
        .split(/\s+/)
        .every((term) => haystack.includes(term))
}

const compareText = (a, b) => (a ?? '').localeCompare(b ?? '')

const EmployeesTable = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { data: employees = [], isLoading, isError, error } = useEmployees()
    const [status, setStatus] = useState('active')
    const [search, setSearch] = useState('')

    const visibleEmployees = useMemo(
        () => employees.filter((employee) => STATUS_FILTERS[status](employee) && matchesSearch(employee, search)),
        [employees, status, search]
    )

    const col = (key) => t(`admin.employees.table.columns.${key}`)
    const open = (employee) => navigate(`${EMPLOYEES_BASE}/${employee.id}`)

    const columns = [
        {
            title: col('staffNumber'),
            dataIndex: 'staff_number',
            key: 'staff_number',
            width: 100,
            sorter: (a, b) => a.staff_number - b.staff_number,
        },
        {
            title: col('staffNumberDk'),
            dataIndex: 'staff_number_dk',
            key: 'staff_number_dk',
            width: 110,
        },
        {
            title: col('lastname'),
            dataIndex: 'lastname',
            key: 'lastname',
            sorter: (a, b) => compareText(a.lastname, b.lastname),
        },
        {
            title: col('firstname'),
            dataIndex: 'firstname',
            key: 'firstname',
            sorter: (a, b) => compareText(a.firstname, b.firstname),
        },
        {
            title: col('staffGroup'),
            key: 'staffgroup',
            render: (_, employee) => employee.staffgroup?.name ?? '',
            sorter: (a, b) => compareText(a.staffgroup?.name, b.staffgroup?.name),
        },
        {
            title: col('language'),
            dataIndex: 'language',
            key: 'language',
            render: (lang) => (LANGUAGE_LABEL_KEYS[lang] ? t(LANGUAGE_LABEL_KEYS[lang]) : lang),
        },
        {
            title: col('entryDate'),
            dataIndex: 'entry_date',
            key: 'entry_date',
            render: formatDate,
            sorter: (a, b) => compareText(a.entry_date, b.entry_date),
        },
        {
            title: col('exitDate'),
            dataIndex: 'exit_date',
            key: 'exit_date',
            render: formatDate,
            sorter: (a, b) => compareText(a.exit_date, b.exit_date),
        },
        {
            title: col('status'),
            key: 'status',
            render: (_, employee) => <EmployeeStatusTag employee={employee} />,
        },
        {
            title: col('actions'),
            key: 'actions',
            fixed: 'right',
            width: 80,
            render: (_, employee) => (
                <Tooltip title={t('common.actions.open')}>
                    <Button
                        type="primary"
                        icon={<UpSquareFilled />}
                        onClick={(event) => {
                            event.stopPropagation()
                            open(employee)
                        }}
                    />
                </Tooltip>
            ),
        },
    ]

    return (
        <Flex
            vertical
            gap={16}
        >
            <Flex
                wrap
                gap={16}
                align="center"
                justify="space-between"
            >
                <Flex
                    wrap
                    gap={16}
                    align="center"
                >
                    <Input.Search
                        allowClear
                        placeholder={t('admin.employees.searchPlaceholder')}
                        style={{ width: 280 }}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Segmented
                        value={status}
                        onChange={setStatus}
                        options={Object.keys(STATUS_FILTERS).map((key) => ({
                            value: key,
                            label: t(`admin.employees.filters.${key}`),
                        }))}
                    />
                </Flex>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`${EMPLOYEES_BASE}/new`)}
                >
                    {t('admin.employees.actions.add')}
                </Button>
            </Flex>

            {isError && (
                <Alert
                    type="error"
                    showIcon
                    message={t('common.messages.errorOccurred')}
                    description={error?.message}
                />
            )}

            <Table
                size="small"
                rowKey="id"
                loading={isLoading}
                columns={columns}
                dataSource={visibleEmployees}
                pagination={{ defaultPageSize: 20, showSizeChanger: true }}
                scroll={{ x: 'max-content' }}
                onRow={(employee) => ({ onClick: () => open(employee), style: { cursor: 'pointer' } })}
            />
        </Flex>
    )
}

export default EmployeesTable
