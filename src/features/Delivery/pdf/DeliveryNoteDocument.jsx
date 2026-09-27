import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import company from '../../../config/company'
import { formatDate, getCustomerLabel, getSupervisorLabel } from '../../../utils/helpers'
import { PDF_FONT_FAMILY, registerPdfFonts } from '../../../utils/pdfFonts'
import { INTL_LOCALES, getAddressLines } from '../../../utils/address'

registerPdfFonts()

// react-pdf units are points; the letter layout follows DIN 5008 (form B) in millimetres.
const mm = (value) => value * 2.835

const styles = StyleSheet.create({
    page: {
        fontFamily: PDF_FONT_FAMILY,
        fontSize: 10,
        paddingTop: mm(15),
        paddingBottom: mm(30),
        paddingLeft: mm(25),
        paddingRight: mm(20),
        color: '#111',
    },
    // Letterhead: logo top right, up to where the address field starts (45 mm from the top).
    letterhead: {
        height: mm(30),
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    },
    logo: { width: mm(45), maxHeight: mm(22), objectFit: 'contain' },
    letterheadName: { fontSize: 14, fontWeight: 'bold' },
    addressRow: { flexDirection: 'row', justifyContent: 'space-between' },
    // Address field for a DL window envelope: 85 x 45 mm, 5 mm of it for the sender line.
    addressField: { width: mm(85), height: mm(45) },
    senderLine: {
        fontSize: 7,
        color: '#555',
        borderBottomWidth: 0.5,
        borderBottomColor: '#999',
        paddingBottom: 1,
        marginTop: mm(2),
        marginBottom: mm(3),
        alignSelf: 'flex-start',
    },
    recipientName: { fontSize: 11, fontWeight: 'bold', lineHeight: 1.3 },
    recipientLine: { fontSize: 11, lineHeight: 1.3 },
    // Information block right of the address field.
    infoBlock: { width: mm(70), marginTop: mm(5) },
    infoRow: { flexDirection: 'row', marginBottom: 3 },
    infoLabel: { width: mm(30), fontSize: 9, color: '#555' },
    infoValue: { flex: 1, fontSize: 9, fontWeight: 'bold' },
    title: { fontSize: 18, fontWeight: 'bold', marginTop: mm(8), marginBottom: mm(6) },
    label: { fontSize: 8, color: '#666', marginBottom: 2 },
    // Items table: dark header, zebra rows, total row.
    table: { marginTop: 4 },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#2b2b2b',
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        paddingVertical: 6,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    tableRowStriped: { backgroundColor: '#f6f6f6' },
    tableTotal: {
        flexDirection: 'row',
        paddingVertical: 7,
        borderTopWidth: 1,
        borderTopColor: '#2b2b2b',
        fontWeight: 'bold',
    },
    colPos: { width: 34, paddingHorizontal: 6, textAlign: 'right' },
    colArticleNumber: { width: 70, paddingHorizontal: 6 },
    colArticle: { flex: 3, paddingHorizontal: 6 },
    colOrder: { flex: 3, paddingHorizontal: 6 },
    colQuantity: { width: 70, paddingHorizontal: 6, textAlign: 'right' },
    cellMuted: { color: '#666' },
    cellSub: { fontSize: 8, color: '#777', marginTop: 1 },
    emptyRow: { paddingVertical: 10, textAlign: 'center', color: '#777', flex: 1 },
    annotationBox: { marginTop: 20 },
    annotationText: { marginTop: 4, lineHeight: 1.4 },
    signatures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 60,
        gap: 40,
    },
    signatureBlock: { flex: 1 },
    signatureLine: { borderTopWidth: 1, borderTopColor: '#111', paddingTop: 4, marginTop: 40 },
    signatureLabel: { fontSize: 8, color: '#444' },
    // Footer: company details in columns, page number right.
    footer: {
        position: 'absolute',
        bottom: mm(10),
        left: mm(25),
        right: mm(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        borderTopWidth: 0.5,
        borderTopColor: '#999',
        paddingTop: 6,
        fontSize: 7.5,
        color: '#555',
    },
    footerCol: { flex: 1 },
    footerStrong: { fontWeight: 'bold', color: '#333' },
    footerPage: { textAlign: 'right' },
})

const InfoRow = ({ label, value }) =>
    value ? (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    ) : null

/**
 * Delivery note (Lieferschein) document.
 * `t` must be a fixed-language translate function (i18n.getFixedT(lang)) so the document
 * renders in the delivery's language regardless of the current UI language.
 */
const DeliveryNoteDocument = ({ delivery, items = [], t }) => {
    const title = t('deliveries.pdf.title')
    const customer = delivery?.customer
    const language = delivery?.pdf_language
    const numberFormat = new Intl.NumberFormat(INTL_LOCALES[language] ?? language ?? 'de', {
        maximumFractionDigits: 2,
    })
    const formatQuantity = (value) => (value === null || value === undefined ? '' : numberFormat.format(value))
    const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    return (
        <Document
            title={`${title} ${delivery?.number ?? ''}`.trim()}
            author={company.name}
            language={language}
        >
            <Page
                size="A4"
                style={styles.page}
            >
                <View style={styles.letterhead}>
                    {company.logo ? (
                        <Image
                            src={company.logo}
                            style={styles.logo}
                        />
                    ) : (
                        <Text style={styles.letterheadName}>{company.name}</Text>
                    )}
                </View>

                <View style={styles.addressRow}>
                    <View style={styles.addressField}>
                        <Text style={styles.senderLine}>{[company.name, ...company.addressLines].join(' · ')}</Text>
                        <Text style={styles.recipientName}>{getCustomerLabel(customer)}</Text>
                        {customer?.contact_person && (
                            <Text style={styles.recipientLine}>
                                {t('deliveries.pdf.attention')} {customer.contact_person}
                            </Text>
                        )}
                        {getAddressLines(customer, language).map((line) => (
                            <Text
                                key={line}
                                style={styles.recipientLine}
                            >
                                {line}
                            </Text>
                        ))}
                    </View>
                    <View style={styles.infoBlock}>
                        <InfoRow
                            label={t('deliveries.pdf.number')}
                            value={delivery?.number}
                        />
                        <InfoRow
                            label={t('deliveries.pdf.date')}
                            value={formatDate(delivery?.date)}
                        />
                        <InfoRow
                            label={t('deliveries.pdf.customerNumber')}
                            value={customer?.customer_number}
                        />
                        <InfoRow
                            label={t('deliveries.pdf.createdBy')}
                            value={getSupervisorLabel(delivery?.created_by)}
                        />
                    </View>
                </View>

                <Text style={styles.title}>
                    {title} {delivery?.number}
                </Text>

                <View style={styles.table}>
                    <View
                        style={styles.tableHeader}
                        fixed
                    >
                        <Text style={styles.colPos}>{t('deliveries.pdf.columns.position')}</Text>
                        <Text style={styles.colArticleNumber}>{t('deliveries.pdf.columns.articleNumber')}</Text>
                        <Text style={styles.colArticle}>{t('deliveries.pdf.columns.article')}</Text>
                        <Text style={styles.colOrder}>{t('deliveries.pdf.columns.order')}</Text>
                        <Text style={styles.colQuantity}>{t('deliveries.pdf.columns.quantity')}</Text>
                    </View>
                    {items.map((item, index) => (
                        <View
                            key={item.id}
                            style={[styles.tableRow, index % 2 === 1 && styles.tableRowStriped]}
                            wrap={false}
                        >
                            <Text style={[styles.colPos, styles.cellMuted]}>{index + 1}</Text>
                            <Text style={[styles.colArticleNumber, styles.cellMuted]}>
                                {item.article?.external_id ?? ''}
                            </Text>
                            <Text style={styles.colArticle}>{item.article?.name ?? ''}</Text>
                            <View style={styles.colOrder}>
                                <Text>{item.order?.description ?? ''}</Text>
                                {item.order?.customer && <Text style={styles.cellSub}>{item.order.customer}</Text>}
                            </View>
                            <Text style={styles.colQuantity}>{formatQuantity(item.quantity)}</Text>
                        </View>
                    ))}
                    {items.length === 0 ? (
                        <View style={styles.tableRow}>
                            <Text style={styles.emptyRow}>{t('deliveries.pdf.noItems')}</Text>
                        </View>
                    ) : (
                        <View
                            style={styles.tableTotal}
                            wrap={false}
                        >
                            <Text style={[styles.colArticle, { flex: 1 }]}>
                                {t('deliveries.pdf.total', { count: items.length })}
                            </Text>
                            <Text style={styles.colQuantity}>{formatQuantity(totalQuantity)}</Text>
                        </View>
                    )}
                </View>

                {delivery?.annotation && (
                    <View style={styles.annotationBox}>
                        <Text style={styles.label}>{t('deliveries.pdf.annotation')}</Text>
                        <Text style={styles.annotationText}>{delivery.annotation}</Text>
                    </View>
                )}

                <View
                    style={styles.signatures}
                    wrap={false}
                >
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine}>
                            <Text style={styles.signatureLabel}>{t('deliveries.pdf.deliveredBy')}</Text>
                        </View>
                    </View>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine}>
                            <Text style={styles.signatureLabel}>{t('deliveries.pdf.receivedBy')}</Text>
                        </View>
                    </View>
                </View>

                <View
                    style={styles.footer}
                    fixed
                >
                    <View style={styles.footerCol}>
                        <Text style={styles.footerStrong}>{company.name}</Text>
                        {company.addressLines.map((line) => (
                            <Text key={line}>{line}</Text>
                        ))}
                    </View>
                    <View style={styles.footerCol}>
                        {company.phone && <Text>{company.phone}</Text>}
                        {company.email && <Text>{company.email}</Text>}
                        {company.website && <Text>{company.website}</Text>}
                    </View>
                    <Text
                        style={[styles.footerCol, styles.footerPage]}
                        render={({ pageNumber, totalPages }) =>
                            t('deliveries.pdf.page', { page: pageNumber, total: totalPages })
                        }
                    />
                </View>
            </Page>
        </Document>
    )
}

export default DeliveryNoteDocument
