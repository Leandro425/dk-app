import { Button, Space, Table, Tooltip, Typography } from 'antd'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import EmployeeLanguageSelect from '../EmployeeLanguageSelect'
import { formatMoney, formatNumber } from '../../lib/format'

const { Text } = Typography

const hasData = (statement) => statement.totals.lineCount + statement.totals.entryCount > 0

const fullName = (employee) => `${employee.firstname ?? ''} ${employee.lastname ?? ''}`.trim()

const compareText = (a, b) => (a ?? '').localeCompare(b ?? '')

const byTotal = (key) => (a, b) => a.totals[key] - b.totals[key]

/** One row per employee with the month's totals and document actions. */
const PayrollTable = ({ statements = [], loading, onPreview, onDownloadXlsx }) => {
    const { t, i18n } = useTranslation()
    const language = i18n.language
    const col = (key) => t(`admin.payroll.table.columns.${key}`)

    const muted = (statement, content) => (hasData(statement) ? content : <Text type="secondary">{content}</Text>)

    const columns = [
        {
            title: col('staffNumber'),
            dataIndex: ['employee', 'staff_number'],
            key: 'staff_number',
            width: 90,
            sorter: (a, b) => a.employee.staff_number - b.employee.staff_number,
            defaultSortOrder: 'ascend',
            render: (value, statement) => muted(statement, value),
        },
        {
            title: col('employee'),
            key: 'employee',
            sorter: (a, b) => compareText(fullName(a.employee), fullName(b.employee)),
            render: (_, statement) => muted(statement, fullName(statement.employee)),
        },
        {
            title: col('language'),
            key: 'language',
            width: 150,
            render: (_, statement) => <EmployeeLanguageSelect employee={statement.employee} />,
        },
        {
            title: col('revenue'),
            key: 'revenue',
            align: 'right',
            width: 130,
            sorter: byTotal('revenue'),
            render: (_, statement) => muted(statement, formatMoney(statement.totals.revenue, language)),
        },
        {
            title: col('hours'),
            key: 'hours',
            align: 'right',
            width: 100,
            sorter: byTotal('hours'),
            render: (_, statement) => muted(statement, formatNumber(statement.totals.hours, language)),
        },
        {
            title: col('payRate'),
            key: 'payRate',
            align: 'right',
            width: 110,
            sorter: (a, b) => (a.payRate ?? 0) - (b.payRate ?? 0),
            render: (_, statement) => muted(statement, formatMoney(statement.payRate, language)),
        },
        {
            title: col('timePay'),
            key: 'timePay',
            align: 'right',
            width: 130,
            sorter: byTotal('timePay'),
            render: (_, statement) => muted(statement, formatMoney(statement.totals.timePay, language)),
        },
        {
            title: col('total'),
            key: 'total',
            align: 'right',
            width: 140,
            sorter: byTotal('total'),
            render: (_, statement) =>
                hasData(statement) ? (
                    <Text strong>{formatMoney(statement.totals.total, language)}</Text>
                ) : (
                    <Text type="secondary">{formatMoney(0, language)}</Text>
                ),
        },
        {
            title: col('counts'),
            key: 'counts',
            align: 'right',
            width: 130,
            render: (_, statement) =>
                muted(statement, `${statement.totals.lineCount} / ${statement.totals.entryCount}`),
        },
        {
            title: col('actions'),
            key: 'actions',
            width: 110,
            render: (_, statement) => (
                <Space>
                    <Tooltip title={t('admin.payroll.actions.previewPdf')}>
                        <Button
                            size="small"
                            icon={<FilePdfOutlined />}
                            onClick={() => onPreview(statement)}
                        />
                    </Tooltip>
                    <Tooltip title={t('admin.payroll.actions.downloadXlsx')}>
                        <Button
                            size="small"
                            icon={<FileExcelOutlined />}
                            onClick={() => onDownloadXlsx(statement)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ]

    return (
        <Table
            rowKey={(statement) => statement.employee.id}
            columns={columns}
            dataSource={statements}
            loading={loading}
            size="middle"
            pagination={false}
            scroll={{ x: 1100 }}
        />
    )
}

export default PayrollTable
