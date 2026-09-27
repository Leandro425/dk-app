import { useMemo } from 'react'
import { Card, Col, Flex, Row } from 'antd'
import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import FormInput from '../../../../../components/hookForm/FormInput'
import FormInputNumber from '../../../../../components/hookForm/FormInputNumber'
import FormCheckbox from '../../../../../components/hookForm/FormCheckbox'
import FormTextArea from '../../../../../components/hookForm/FormTextArea'
import FormBaseSelectWithoutQuery from '../../../../../components/hookForm/FormBaseSelectWithoutQuery'
import { getUnitOptions } from '../../../../../utils/articleUnits'
import { isSameNumber, isSameText } from '../../lib/article'
import { useArticles } from '../../hooks/useArticles'

const Section = ({ title, children }) => (
    <Card
        title={title}
        size="small"
    >
        <Row gutter={16}>{children}</Row>
    </Card>
)

// Default field width inside a section: full on phones, half on tablets, a third on desktops.
const Field = ({ children, md = 12, lg = 8 }) => (
    <Col
        xs={24}
        md={md}
        lg={lg}
    >
        {children}
    </Col>
)

const warning = (show, message) => (show ? { validateStatus: 'warning', help: message } : {})
const error = (fieldError) => (fieldError?.message ? { validateStatus: 'error', help: fieldError.message } : {})

/**
 * All article fields in sections. Must be rendered inside a react-hook-form
 * FormProvider and an antd Form (layout vertical). `articleId` is the edited
 * article (null when creating) and is excluded from the duplicate checks;
 * `savedPieceworkWage` is the stored wage, to warn when it is changed.
 */
const ArticleForm = ({ articleId = null, savedPieceworkWage = null }) => {
    const { t } = useTranslation()
    const {
        control,
        formState: { errors },
    } = useFormContext()
    const { data: articles = [] } = useArticles()

    const [name, pieceworkWage] = useWatch({ control, name: ['name', 'piecework_wage'] })

    const others = useMemo(() => articles.filter((article) => article.id !== articleId), [articles, articleId])
    const nameTakenBy = others.find((article) => isSameText(article.name, name))
    const unitOptions = useMemo(() => getUnitOptions(t), [t])
    const wageChanged = articleId !== null && (pieceworkWage ?? null) !== (savedPieceworkWage ?? null)

    const f = (key) => t(`admin.articles.fields.${key}`)

    return (
        <Flex
            vertical
            gap={16}
        >
            <Section title={t('admin.articles.sections.masterData')}>
                <Field>
                    <FormInput
                        name="external_id"
                        label={f('articleNumber')}
                        required
                        rules={{
                            validate: (value) =>
                                !value?.toString().trim()
                                    ? false
                                    : !others.some((article) => isSameNumber(article.external_id, value)) ||
                                      t('admin.articles.errors.articleNumberTaken'),
                        }}
                        {...error(errors.external_id)}
                    />
                </Field>
                <Field>
                    <FormInput
                        name="name"
                        label={f('name')}
                        required
                        rules={{ validate: (value) => Boolean(value?.trim()) }}
                        {...warning(
                            nameTakenBy,
                            t('admin.articles.warnings.nameTaken', { number: nameTakenBy?.external_id ?? '–' })
                        )}
                    />
                </Field>
                <Field>
                    <FormBaseSelectWithoutQuery
                        name="unit"
                        label={f('unit')}
                        required
                        options={unitOptions}
                    />
                </Field>
                <Field>
                    <FormCheckbox
                        name="active"
                        formLabel={f('status')}
                        label={f('active')}
                    />
                </Field>
            </Section>

            <Section title={t('admin.articles.sections.piecework')}>
                <Field>
                    <FormInputNumber
                        name="piecework_wage"
                        label={f('pieceworkWage')}
                        min={0}
                        step={0.01}
                        addonAfter="€"
                        {...warning(wageChanged, t('admin.articles.warnings.pieceworkWageChanged'))}
                    />
                </Field>
                <Field>
                    <FormInputNumber
                        name="piecework_packaging"
                        label={f('pieceworkPackaging')}
                        min={0}
                    />
                </Field>
            </Section>

            <Section title={t('admin.articles.sections.sales')}>
                <Field>
                    <FormInputNumber
                        name="sales_price"
                        label={f('salesPrice')}
                        min={0}
                        precision={2}
                        step={0.01}
                        addonAfter="€"
                        help={t('admin.articles.fields.salesPriceHelp')}
                    />
                </Field>
            </Section>

            <Section title={t('admin.articles.sections.notes')}>
                <Field
                    md={24}
                    lg={24}
                >
                    <FormTextArea
                        name="notes"
                        label={f('notes')}
                        rows={4}
                    />
                </Field>
            </Section>
        </Flex>
    )
}

export default ArticleForm
