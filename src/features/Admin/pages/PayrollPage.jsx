import { useMemo, useState } from 'react'
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Flex,
    Modal,
    Progress,
    Row,
    Space,
    Statistic,
    Switch,
    Typography,
} from 'antd'
import { DownloadOutlined, FileExcelOutlined, FileZipOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import ContentFrame from '../../../components/ContentFrame'
import usePayrollData from '../payroll/hooks/usePayrollData'
import useStatementRenderer from '../payroll/hooks/useStatementRenderer'
import PayrollTable from '../payroll/components/PayrollTable'
import StatementPdfModal from '../payroll/components/StatementPdfModal'
import { sumStatements } from '../payroll/lib/payroll'
import { formatMoney, formatNumber } from '../payroll/lib/format'
import { buildDatevCsvBlob, buildDatevWorkbookBlob } from '../payroll/export/excel'
import { buildMonthExportZip } from '../payroll/export/zip'
import { saveBlob } from '../payroll/export/download'
import { datevFileBase, monthFolderName, statementFileBase } from '../payroll/export/fileNames'

const { Text } = Typography

const hasData = (statement) => statement.totals.lineCount + statement.totals.entryCount > 0

const PayrollPage = () => {
    const { t, i18n } = useTranslation()
    const language = i18n.language

    const [period, setPeriod] = useState(() => dayjs().subtract(1, 'month').startOf('month'))
    const month = period.month() + 1
    const year = period.year()

    const [hideEmpty, setHideEmpty] = useState(true)
    const [preview, setPreview] = useState(null)
    const [busy, setBusy] = useState(false)
    const [progress, setProgress] = useState(null)

    const { data: statements = [], isLoading, isError, error } = usePayrollData(month, year)
    const { renderPdfBlob, renderWorkbookBlob } = useStatementRenderer()

    const visibleStatements = useMemo(
        () => (hideEmpty ? statements.filter(hasData) : statements),
        [statements, hideEmpty]
    )
    const summary = useMemo(() => sumStatements(statements), [statements])

    const run = async (task) => {
        setBusy(true)
        try {
            await task()
        } finally {
            setBusy(false)
            setProgress(null)
        }
    }

    const downloadDatevXlsx = () =>
        run(async () => saveBlob(await buildDatevWorkbookBlob(statements), `${datevFileBase(month, year)}.xlsx`))

    const downloadDatevCsv = () =>
        run(async () => saveBlob(buildDatevCsvBlob(statements), `${datevFileBase(month, year)}.csv`))

    const downloadStatementXlsx = (statement) =>
        run(async () => saveBlob(await renderWorkbookBlob(statement), `${statementFileBase(statement)}.xlsx`))

    const exportAll = () =>
        run(async () => {
            const exported = statements.filter(hasData)
            setProgress({ current: 0, total: exported.length })
            const blob = await buildMonthExportZip({
                statements: exported,
                month,
                year,
                renderPdf: renderPdfBlob,
                renderWorkbook: renderWorkbookBlob,
                onProgress: (current, total) => setProgress({ current, total }),
            })
            saveBlob(blob, `${monthFolderName(month, year)}.zip`)
        })

    const noData = statements.length === 0

    return (
        <ContentFrame
            title={t('admin.payroll.title')}
            description={t('admin.payroll.description')}
        >
            <Flex
                vertical
                gap={16}
            >
                <Card>
                    <Flex
                        wrap
                        gap={16}
                        align="center"
                        justify="space-between"
                    >
                        <Space>
                            <Text strong>{t('admin.payroll.period')}</Text>
                            <DatePicker
                                picker="month"
                                value={period}
                                allowClear={false}
                                onChange={(value) => value && setPeriod(value.startOf('month'))}
                                disabledDate={(date) => date.isAfter(dayjs().endOf('month'))}
                            />
                            <Switch
                                checked={hideEmpty}
                                onChange={setHideEmpty}
                            />
                            <Text>{t('admin.payroll.hideEmpty')}</Text>
                        </Space>
                        <Space wrap>
                            <Button
                                icon={<FileExcelOutlined />}
                                disabled={noData || busy}
                                onClick={downloadDatevXlsx}
                            >
                                {t('admin.payroll.actions.downloadDatevXlsx')}
                            </Button>
                            <Button
                                icon={<DownloadOutlined />}
                                disabled={noData || busy}
                                onClick={downloadDatevCsv}
                            >
                                {t('admin.payroll.actions.downloadDatevCsv')}
                            </Button>
                            <Button
                                type="primary"
                                icon={<FileZipOutlined />}
                                disabled={noData || busy}
                                loading={busy && progress !== null}
                                onClick={exportAll}
                            >
                                {t('admin.payroll.actions.exportAll')}
                            </Button>
                        </Space>
                    </Flex>
                    <Text
                        type="secondary"
                        style={{ display: 'block', marginTop: 12 }}
                    >
                        {t('admin.payroll.datev.hint')}
                    </Text>
                </Card>

                {isError && (
                    <Alert
                        type="error"
                        showIcon
                        message={t('common.messages.errorOccurred')}
                        description={error?.message}
                    />
                )}

                <Row gutter={16}>
                    <Col
                        xs={12}
                        md={6}
                    >
                        <Card>
                            <Statistic
                                title={t('admin.payroll.summary.employees')}
                                value={summary.employeesWithData}
                                suffix={`/ ${statements.length}`}
                            />
                        </Card>
                    </Col>
                    <Col
                        xs={12}
                        md={6}
                    >
                        <Card>
                            <Statistic
                                title={t('admin.payroll.summary.revenue')}
                                value={formatMoney(summary.revenue, language)}
                            />
                        </Card>
                    </Col>
                    <Col
                        xs={12}
                        md={6}
                    >
                        <Card>
                            <Statistic
                                title={t('admin.payroll.summary.hours')}
                                value={formatNumber(summary.hours, language)}
                            />
                        </Card>
                    </Col>
                    <Col
                        xs={12}
                        md={6}
                    >
                        <Card>
                            <Statistic
                                title={t('admin.payroll.summary.total')}
                                value={formatMoney(summary.total, language)}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <PayrollTable
                        statements={visibleStatements}
                        loading={isLoading}
                        onPreview={setPreview}
                        onDownloadXlsx={downloadStatementXlsx}
                    />
                </Card>
            </Flex>

            <StatementPdfModal
                open={preview !== null}
                onClose={() => setPreview(null)}
                statement={preview}
            />

            <Modal
                open={progress !== null}
                closable={false}
                footer={null}
                centered
                width={420}
            >
                <Flex
                    vertical
                    gap={12}
                    align="center"
                >
                    <Text>
                        {t('admin.payroll.actions.exporting', {
                            current: progress?.current ?? 0,
                            total: progress?.total ?? 0,
                        })}
                    </Text>
                    <Progress
                        percent={progress?.total ? Math.round((progress.current / progress.total) * 100) : 0}
                        status="active"
                    />
                </Flex>
            </Modal>
        </ContentFrame>
    )
}

export default PayrollPage
