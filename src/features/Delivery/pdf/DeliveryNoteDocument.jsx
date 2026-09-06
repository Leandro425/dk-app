import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import company from '../../../config/company'
import {
    formatDate,
    getArticleLabel,
    getCustomerLabel,
    getOrderLabel,
    getSupervisorLabel,
} from '../../../utils/helpers'
import robotoRegular from '../../../assets/fonts/roboto/Roboto-Regular.ttf'
import robotoBold from '../../../assets/fonts/roboto/Roboto-Bold.ttf'

// Roboto covers Latin Extended and Cyrillic, which the built-in PDF fonts do not (pl, ro, bg).
Font.register({
    family: 'Roboto',
    fonts: [
        { src: robotoRegular, fontWeight: 'normal' },
        { src: robotoBold, fontWeight: 'bold' },
    ],
})
Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Roboto',
        fontSize: 10,
        paddingTop: 40,
        paddingBottom: 60,
        paddingHorizontal: 40,
        color: '#111',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    companyName: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
    companyLine: { fontSize: 9, color: '#444' },
    logo: { width: 120, objectFit: 'contain' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    metaRow: { flexDirection: 'row', marginBottom: 20 },
    metaCol: { flex: 1 },
    metaLabel: { fontSize: 8, color: '#666', marginBottom: 2 },
    metaValue: { fontSize: 11 },
    table: { marginTop: 8 },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 5,
    },
    tableHeader: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#111',
        fontWeight: 'bold',
    },
    colPos: { width: 30 },
    colArticle: { flex: 3 },
    colOrder: { flex: 3 },
    colQuantity: { width: 70, textAlign: 'right' },
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
    footer: {
        position: 'absolute',
        bottom: 24,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        color: '#666',
    },
})

/**
 * Delivery note (Lieferschein) document.
 * `t` must be a fixed-language translate function (i18n.getFixedT(lang)) so the document
 * renders in the delivery's language regardless of the current UI language.
 */
const DeliveryNoteDocument = ({ delivery, items = [], t }) => {
    const title = t('deliveries.pdf.title')
    return (
        <Document
            title={`${title} ${delivery?.number ?? ''}`.trim()}
            author={company.name}
            language={delivery?.pdf_language}
        >
            <Page
                size="A4"
                style={styles.page}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.companyName}>{company.name}</Text>
                        {company.addressLines.map((line) => (
                            <Text
                                key={line}
                                style={styles.companyLine}
                            >
                                {line}
                            </Text>
                        ))}
                        {company.phone && <Text style={styles.companyLine}>{company.phone}</Text>}
                        {company.email && <Text style={styles.companyLine}>{company.email}</Text>}
                    </View>
                    {company.logo && (
                        <Image
                            src={company.logo}
                            style={styles.logo}
                        />
                    )}
                </View>

                <Text style={styles.title}>{title}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>{t('deliveries.pdf.number')}</Text>
                        <Text style={styles.metaValue}>{delivery?.number}</Text>
                    </View>
                    <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>{t('deliveries.pdf.date')}</Text>
                        <Text style={styles.metaValue}>{formatDate(delivery?.date)}</Text>
                    </View>
                    <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>{t('deliveries.pdf.customer')}</Text>
                        <Text style={styles.metaValue}>{getCustomerLabel(delivery?.customer)}</Text>
                    </View>
                    <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>{t('deliveries.pdf.createdBy')}</Text>
                        <Text style={styles.metaValue}>{getSupervisorLabel(delivery?.created_by)}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View
                        style={[styles.tableRow, styles.tableHeader]}
                        fixed
                    >
                        <Text style={styles.colPos}>#</Text>
                        <Text style={styles.colArticle}>{t('deliveries.pdf.columns.article')}</Text>
                        <Text style={styles.colOrder}>{t('deliveries.pdf.columns.order')}</Text>
                        <Text style={styles.colQuantity}>{t('deliveries.pdf.columns.quantity')}</Text>
                    </View>
                    {items.map((item, index) => (
                        <View
                            key={item.id}
                            style={styles.tableRow}
                            wrap={false}
                        >
                            <Text style={styles.colPos}>{index + 1}</Text>
                            <Text style={styles.colArticle}>{getArticleLabel(item.article)}</Text>
                            <Text style={styles.colOrder}>{getOrderLabel(item.order)}</Text>
                            <Text style={styles.colQuantity}>{item.quantity}</Text>
                        </View>
                    ))}
                    {items.length === 0 && (
                        <View style={styles.tableRow}>
                            <Text>{t('deliveries.pdf.noItems')}</Text>
                        </View>
                    )}
                </View>

                {delivery?.annotation && (
                    <View style={styles.annotationBox}>
                        <Text style={styles.metaLabel}>{t('deliveries.pdf.annotation')}</Text>
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
                    <Text>
                        {company.name}
                        {company.website ? ` · ${company.website}` : ''}
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

export default DeliveryNoteDocument
