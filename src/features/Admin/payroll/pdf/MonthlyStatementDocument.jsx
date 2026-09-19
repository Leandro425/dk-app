import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import company from '../../../../config/company'
import { PDF_FONT_FAMILY, registerPdfFonts } from '../../../../utils/pdfFonts'
import { SPECIAL_FEATURE_SURCHARGE, isPaidTimeEntry } from '../lib/payroll'
import {
    formatClock,
    formatGenerationDate,
    formatLongDate,
    formatMoney,
    formatMonthName,
    formatNumber,
} from '../lib/format'

registerPdfFonts()

const GREY_BG = '#f4f5f7'
const BORDER = '#dcdfe3'
const MUTED = '#666'

const styles = StyleSheet.create({
    page: {
        fontFamily: PDF_FONT_FAMILY,
        fontSize: 9,
        paddingTop: 36,
        paddingBottom: 54,
        paddingHorizontal: 36,
        color: '#222',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        paddingBottom: 10,
        marginBottom: 14,
    },
    logo: { maxHeight: 60, maxWidth: 110, objectFit: 'contain' },
    titleBlock: { alignItems: 'flex-end' },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
    subtitle: { fontSize: 11, color: '#444', marginBottom: 1 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
    summaryGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    summaryCard: {
        flex: 1,
        backgroundColor: GREY_BG,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 3,
        padding: 8,
    },
    summaryCardTotal: { backgroundColor: '#e9ecef', borderColor: '#c5cad0' },
    summaryLabel: { fontSize: 7.5, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 3 },
    summaryValue: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
    summarySub: { fontSize: 7.5, color: MUTED },
    day: { borderWidth: 1, borderColor: BORDER, borderRadius: 3, marginBottom: 6 },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: GREY_BG,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    dayTitle: { fontSize: 9.5, fontWeight: 'bold' },
    dayStats: { fontSize: 8, color: MUTED },
    table: { paddingVertical: 4, paddingHorizontal: 6 },
    tableDivider: { borderTopWidth: 1, borderTopColor: '#eceef0' },
    row: { flexDirection: 'row', paddingVertical: 2.5, borderBottomWidth: 1, borderBottomColor: '#f0f1f3' },
    rowLast: { borderBottomWidth: 0 },
    headRow: { borderBottomColor: BORDER },
    headCell: { fontSize: 7, color: '#555', textTransform: 'uppercase', letterSpacing: 0.2, fontWeight: 'bold' },
    cell: { fontSize: 8.5 },
    right: { textAlign: 'right' },
    colArticle: { flex: 4 },
    colQty: { flex: 1.2 },
    colRate: { flex: 1.5 },
    colFeature: { flex: 3 },
    colTotal: { flex: 1.6 },
    colTime: { flex: 1.5 },
    colBreak: { flex: 1.5 },
    colType: { flex: 3 },
    colHours: { flex: 1.6 },
    empty: { color: MUTED, fontStyle: 'italic', paddingVertical: 8 },
    footer: {
        position: 'absolute',
        bottom: 22,
        left: 36,
        right: 36,
        borderTopWidth: 1,
        borderTopColor: BORDER,
        paddingTop: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 7.5,
        color: MUTED,
    },
})

const Cell = ({ style, head, right, children }) => (
    <Text style={[head ? styles.headCell : styles.cell, right && styles.right, style]}>{children}</Text>
)

const specialFeatureLabel = (feature, t, language) => {
    if (!feature) return '–'
    const label = t(`reports.report.specialFeatures.${feature}`, { defaultValue: feature })
    const surcharge = SPECIAL_FEATURE_SURCHARGE[feature]
    return surcharge
        ? `${label} ${t('admin.payroll.statement.surcharge', { amount: formatMoney(surcharge, language) })}`
        : label
}

const LinesTable = ({ lines, t, language }) => (
    <View style={styles.table}>
        <View style={[styles.row, styles.headRow]}>
            <Cell
                head
                style={styles.colArticle}
            >
                {t('admin.payroll.statement.columns.article')}
            </Cell>
            <Cell
                head
                right
                style={styles.colQty}
            >
                {t('admin.payroll.statement.columns.quantity')}
            </Cell>
            <Cell
                head
                right
                style={styles.colRate}
            >
                {t('admin.payroll.statement.columns.pieceRate')}
            </Cell>
            <Cell
                head
                style={[styles.colFeature, { paddingLeft: 8 }]}
            >
                {t('admin.payroll.statement.columns.specialFeature')}
            </Cell>
            <Cell
                head
                right
                style={styles.colTotal}
            >
                {t('admin.payroll.statement.columns.total')}
            </Cell>
        </View>
        {lines.map((line, index) => (
            <View
                key={`${line.article_id}-${line.special_feature ?? ''}-${index}`}
                style={[styles.row, index === lines.length - 1 && styles.rowLast]}
            >
                <Cell style={styles.colArticle}>{line.article_name}</Cell>
                <Cell
                    right
                    style={styles.colQty}
                >
                    {formatNumber(line.total_quantity, language)}
                </Cell>
                <Cell
                    right
                    style={styles.colRate}
                >
                    {formatMoney(line.piece_rate, language)}
                </Cell>
                <Cell style={[styles.colFeature, { paddingLeft: 8 }]}>
                    {line.not_charging_piecework_wage
                        ? t('reports.report.notChargingPieceworkWage')
                        : specialFeatureLabel(line.special_feature, t, language)}
                </Cell>
                <Cell
                    right
                    style={styles.colTotal}
                >
                    {formatMoney(line.revenue, language)}
                </Cell>
            </View>
        ))}
    </View>
)

const EntriesTable = ({ entries, t, language }) => (
    <View style={[styles.table, styles.tableDivider]}>
        <View style={[styles.row, styles.headRow]}>
            <Cell
                head
                style={styles.colTime}
            >
                {t('admin.payroll.statement.columns.start')}
            </Cell>
            <Cell
                head
                style={styles.colTime}
            >
                {t('admin.payroll.statement.columns.end')}
            </Cell>
            <Cell
                head
                right
                style={styles.colBreak}
            >
                {t('admin.payroll.statement.columns.breakMinutes')}
            </Cell>
            <Cell
                head
                style={[styles.colType, { paddingLeft: 8 }]}
            >
                {t('admin.payroll.statement.columns.type')}
            </Cell>
            <Cell
                head
                right
                style={styles.colHours}
            >
                {t('admin.payroll.statement.columns.workHours')}
            </Cell>
        </View>
        {entries.map((entry, index) => (
            <View
                key={entry.id}
                style={[styles.row, index === entries.length - 1 && styles.rowLast]}
            >
                <Cell style={styles.colTime}>{formatClock(entry.start_time)}</Cell>
                <Cell style={styles.colTime}>{formatClock(entry.end_time)}</Cell>
                <Cell
                    right
                    style={styles.colBreak}
                >
                    {formatNumber(entry.break_in_min, language, 0)}
                </Cell>
                <Cell style={[styles.colType, { paddingLeft: 8 }, !isPaidTimeEntry(entry) && { color: MUTED }]}>
                    {t(`timestamps.timestamp.types.${entry.type}`, { defaultValue: entry.type ?? '' })}
                    {!isPaidTimeEntry(entry) ? ` (${t('admin.payroll.statement.unpaid')})` : ''}
                </Cell>
                <Cell
                    right
                    style={styles.colHours}
                >
                    {t('admin.payroll.statement.hours', { hours: formatNumber(entry.work_hours, language) })}
                </Cell>
            </View>
        ))}
    </View>
)

/**
 * Monthly statement (Monatsbericht) of one employee.
 * `t` must be a fixed-language translate function (i18n.getFixedT(language)) so the document
 * renders in the employee's language regardless of the current UI language.
 */
const MonthlyStatementDocument = ({ statement, t, language }) => {
    const { employee, month, year, payRate, days, totals } = statement
    const monthName = formatMonthName(month, year, language)
    const title = t('admin.payroll.statement.title')
    const activeDays = days.filter((day) => day.lines.length > 0 || day.entries.length > 0)

    return (
        <Document
            title={`${title} ${monthName} – ${employee.firstname} ${employee.lastname}`}
            author={company.name}
            language={language}
        >
            <Page
                size="A4"
                style={styles.page}
            >
                <View style={styles.header}>
                    {company.logo ? (
                        <Image
                            src={company.logo}
                            style={styles.logo}
                        />
                    ) : (
                        <Text style={styles.subtitle}>{company.name}</Text>
                    )}
                    <View style={styles.titleBlock}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{monthName}</Text>
                        <Text style={styles.subtitle}>
                            {employee.firstname} {employee.lastname} • {t('admin.payroll.statement.staffNumber')}:{' '}
                            {employee.staff_number}
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{t('admin.payroll.statement.summary')}</Text>
                <View
                    style={styles.summaryGrid}
                    wrap={false}
                >
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>{t('admin.payroll.statement.piecework')}</Text>
                        <Text style={styles.summaryValue}>{formatMoney(totals.revenue, language)}</Text>
                        <Text style={styles.summarySub}>
                            {t('admin.payroll.statement.reportsCount', { count: totals.lineCount })}
                        </Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>{t('admin.payroll.statement.timePay')}</Text>
                        <Text style={styles.summaryValue}>{formatMoney(totals.timePay, language)}</Text>
                        <Text style={styles.summarySub}>
                            {t('admin.payroll.statement.hoursTimesRate', {
                                hours: formatNumber(totals.hours, language),
                                rate: formatMoney(payRate, language),
                            })}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, styles.summaryCardTotal]}>
                        <Text style={styles.summaryLabel}>{t('admin.payroll.statement.total')}</Text>
                        <Text style={styles.summaryValue}>{formatMoney(totals.total, language)}</Text>
                        <Text style={styles.summarySub}>
                            {formatMoney(totals.revenue, language)} + {formatMoney(totals.timePay, language)}
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{t('admin.payroll.statement.daily')}</Text>
                {activeDays.length === 0 && <Text style={styles.empty}>{t('admin.payroll.statement.noEntries')}</Text>}
                {activeDays.map((day) => (
                    <View
                        key={day.date}
                        style={styles.day}
                        wrap={false}
                    >
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayTitle}>{formatLongDate(day.date, language)}</Text>
                            <Text style={styles.dayStats}>
                                {formatMoney(day.revenue, language)} •{' '}
                                {t('admin.payroll.statement.hours', { hours: formatNumber(day.hours, language) })}
                            </Text>
                        </View>
                        {day.lines.length > 0 && (
                            <LinesTable
                                lines={day.lines}
                                t={t}
                                language={language}
                            />
                        )}
                        {day.entries.length > 0 && (
                            <EntriesTable
                                entries={day.entries}
                                t={t}
                                language={language}
                            />
                        )}
                    </View>
                ))}

                <View
                    style={styles.footer}
                    fixed
                >
                    <Text>
                        {t('admin.payroll.statement.generated', { date: formatGenerationDate(language) })} |{' '}
                        {company.name}
                    </Text>
                    <Text
                        render={({ pageNumber, totalPages }) =>
                            t('deliveries.pdf.page', { page: pageNumber, total: totalPages })
                        }
                    />
                </View>
            </Page>
        </Document>
    )
}

export default MonthlyStatementDocument
