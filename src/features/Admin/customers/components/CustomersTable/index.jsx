import { useMemo, useState } from 'react'
import { Alert, Button, Flex, Input, Segmented, Table, Tag, Tooltip } from 'antd'
import { PlusOutlined, UpSquareFilled } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '../../hooks/useCustomers'
import { CUSTOMERS_BASE } from '../../../constants'

export const CustomerStatusTag = ({ customer }) => {
    const { t } = useTranslation()
    return customer.active ? (
        <Tag color="green">{t('admin.customers.status.active')}</Tag>
    ) : (
        <Tag>{t('admin.customers.status.archived')}</Tag>
    )
}

const STATUS_FILTERS = {
    active: (customer) => customer.active,
    archived: (customer) => !customer.active,
    all: () => true,
}

const matchesSearch = (customer, search) => {
    if (!search) return true
    const haystack = [customer.customer_number, customer.name, customer.address_city, customer.contact_person]
        .filter((part) => part !== null && part !== undefined)
        .join(' ')
        .toLowerCase()
    return search
        .toLowerCase()
        .split(/\s+/)
        .every((term) => haystack.includes(term))
}

const compareText = (a, b) => (a ?? '').localeCompare(b ?? '')

const CustomersTable = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { data: customers = [], isLoading, isError, error } = useCustomers()
    const [status, setStatus] = useState('active')
    const [search, setSearch] = useState('')

    const visibleCustomers = useMemo(
        () => customers.filter((customer) => STATUS_FILTERS[status](customer) && matchesSearch(customer, search)),
        [customers, status, search]
    )

    const col = (key) => t(`admin.customers.table.columns.${key}`)
    const open = (customer) => navigate(`${CUSTOMERS_BASE}/${customer.id}`)

    const columns = [
        {
            title: col('customerNumber'),
            dataIndex: 'customer_number',
            key: 'customer_number',
            width: 110,
            sorter: (a, b) => (a.customer_number ?? Infinity) - (b.customer_number ?? Infinity),
        },
        {
            title: col('name'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => compareText(a.name, b.name),
            defaultSortOrder: 'ascend',
        },
        {
            title: col('city'),
            key: 'city',
            render: (_, customer) => [customer.address_zip_code, customer.address_city].filter(Boolean).join(' '),
            sorter: (a, b) => compareText(a.address_city, b.address_city),
        },
        {
            title: col('contactPerson'),
            dataIndex: 'contact_person',
            key: 'contact_person',
            sorter: (a, b) => compareText(a.contact_person, b.contact_person),
        },
        {
            title: col('phone'),
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: col('status'),
            key: 'status',
            render: (_, customer) => <CustomerStatusTag customer={customer} />,
        },
        {
            title: col('actions'),
            key: 'actions',
            fixed: 'right',
            width: 80,
            render: (_, customer) => (
                <Tooltip title={t('common.actions.open')}>
                    <Button
                        type="primary"
                        icon={<UpSquareFilled />}
                        onClick={(event) => {
                            event.stopPropagation()
                            open(customer)
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
                        placeholder={t('admin.customers.searchPlaceholder')}
                        style={{ width: 280 }}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Segmented
                        value={status}
                        onChange={setStatus}
                        options={Object.keys(STATUS_FILTERS).map((key) => ({
                            value: key,
                            label: t(`admin.customers.filters.${key}`),
                        }))}
                    />
                </Flex>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate(`${CUSTOMERS_BASE}/new`)}
                >
                    {t('admin.customers.actions.add')}
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
                dataSource={visibleCustomers}
                pagination={{ defaultPageSize: 20, showSizeChanger: true }}
                scroll={{ x: 'max-content' }}
                onRow={(customer) => ({ onClick: () => open(customer), style: { cursor: 'pointer' } })}
            />
        </Flex>
    )
}

export default CustomersTable
