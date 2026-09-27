import { useEffect } from 'react'
import { Alert, Button, Flex, Form, Popconfirm, Spin, Tooltip, message } from 'antd'
import { ArrowLeftOutlined, DeleteFilled, SaveOutlined } from '@ant-design/icons'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import ContentFrame from '../../../components/ContentFrame'
import ArticleForm from '../articles/components/ArticleForm'
import { ArticleStatusTag } from '../articles/components/ArticlesTable'
import { useArticle, useDeleteArticle, useSaveArticle } from '../articles/hooks/useArticles'
import { toFormValues } from '../articles/lib/article'
import { ARTICLES_BASE } from '../constants'

// Postgres error codes returned by PostgREST.
const UNIQUE_VIOLATION = '23505'
const FOREIGN_KEY_VIOLATION = '23503'

/** Create (`/articles/new`) or edit (`/articles/:articleId`) one article. */
const ArticlePage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { articleId: idParam } = useParams()
    const isNew = idParam === 'new'
    const articleId = isNew ? null : Number(idParam)

    const [messageApi, contextHolder] = message.useMessage()
    const { data: article, isLoading, isError, error } = useArticle(articleId)
    const saveArticle = useSaveArticle()
    const deleteArticle = useDeleteArticle()

    const form = useForm({ mode: 'onChange', defaultValues: toFormValues(null) })
    const {
        handleSubmit,
        reset,
        formState: { isDirty, isValid },
    } = form

    useEffect(() => {
        if (isNew) {
            reset(toFormValues(null))
        } else if (article) {
            reset(toFormValues(article))
        }
    }, [isNew, article, reset])

    const showError = (err) => {
        const content =
            err?.code === UNIQUE_VIOLATION
                ? t('admin.articles.errors.articleNumberTaken')
                : err?.code === FOREIGN_KEY_VIOLATION
                  ? t('admin.articles.errors.inUse')
                  : `${t('common.messages.errorOccurred')} ${err?.message ?? ''}`.trim()
        messageApi.open({ type: 'error', content, duration: 5 })
    }

    const onSubmit = (values) =>
        saveArticle.mutateAsync({ id: articleId, values }).then((savedId) => {
            messageApi.open({
                type: 'success',
                content: t(isNew ? 'common.messages.successfullyAdded' : 'common.messages.successfullyUpdated'),
                duration: 3,
            })
            if (isNew) navigate(`${ARTICLES_BASE}/${savedId}`, { replace: true })
        }, showError)

    const onDelete = () =>
        deleteArticle.mutateAsync(articleId).then(() => {
            messageApi.open({ type: 'success', content: t('common.messages.successfullyDeleted'), duration: 3 })
            navigate(ARTICLES_BASE)
        }, showError)

    if (!isNew && !Number.isInteger(articleId)) {
        return (
            <Navigate
                to={ARTICLES_BASE}
                replace={true}
            />
        )
    }

    const title = isNew ? t('admin.articles.new.title') : article?.name || t('admin.articles.edit.title')
    const inUse = (article?.usageCount ?? 0) > 0

    return (
        <ContentFrame
            title={title}
            description={isNew ? t('admin.articles.new.description') : t('admin.articles.edit.description')}
            extraBreadcrumbs={[{ href: `${ARTICLES_BASE}/${idParam}`, title }]}
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
                                        onClick={() => navigate(ARTICLES_BASE)}
                                    >
                                        {t('admin.articles.actions.back')}
                                    </Button>
                                    {article && <ArticleStatusTag article={article} />}
                                </Flex>
                                <Flex gap={8}>
                                    {!isNew && (
                                        <Popconfirm
                                            title={t('admin.articles.actions.delete')}
                                            description={t('admin.articles.actions.deleteConfirmation')}
                                            onConfirm={onDelete}
                                            okText={t('common.yes')}
                                            cancelText={t('common.no')}
                                            disabled={inUse}
                                        >
                                            <Tooltip title={inUse ? t('admin.articles.errors.inUse') : null}>
                                                <Button
                                                    danger
                                                    icon={<DeleteFilled />}
                                                    disabled={inUse}
                                                    loading={deleteArticle.isPending}
                                                >
                                                    {t('common.actions.delete')}
                                                </Button>
                                            </Tooltip>
                                        </Popconfirm>
                                    )}
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        disabled={!isDirty || !isValid || saveArticle.isPending}
                                        loading={saveArticle.isPending}
                                        onClick={handleSubmit(onSubmit)}
                                    >
                                        {t('common.actions.save')}
                                    </Button>
                                </Flex>
                            </Flex>
                            <ArticleForm
                                articleId={articleId}
                                savedPieceworkWage={article?.piecework_wage ?? null}
                            />
                        </Flex>
                    </Form>
                </FormProvider>
            )}
        </ContentFrame>
    )
}

export default ArticlePage
