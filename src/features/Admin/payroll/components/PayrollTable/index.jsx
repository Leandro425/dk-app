import { Button, Space, Table, Tooltip, Typography } from 'antd'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import EmployeeLanguageSelect from '../EmployeeLanguageSelect'
import { formatMoney, formatNumber } from '../../lib/format'

const { Text } = Typography

const hasData = (statement) => statement.totals.lineCount + statement.totals.entryCount > 0

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
            render: (value, statement) => muted(statement, value),
        },
        {
            title: col('employee'),
            key: 'employee',
            render: (_, statement) =>
                muted(statement, `${statement.employee.firstname ?? ''} ${statement.employee.lastname ?? ''}`.trim()),
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
            render: (_, statement) => muted(statement, formatMoney(statement.totals.revenue, language)),
        },
        {
            title: col('hours'),
            key: 'hours',
            align: 'right',
            width: 100,
            render: (_, statement) => muted(statement, formatNumber(statement.totals.hours, language)),
        },
        {
            title: col('payRate'),
            key: 'payRate',
            align: 'right',
            width: 110,
            render: (_, statement) => muted(statement, formatMoney(statement.payRate, language)),
        },
        {
            title: col('timePay'),
            key: 'timePay',
            align: 'right',
            width: 130,
            render: (_, statement) => muted(statement, formatMoney(statement.totals.timePay, language)),
        },
        {
            title: col('total'),
            key: 'total',
            align: 'right',
            width: 140,
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
