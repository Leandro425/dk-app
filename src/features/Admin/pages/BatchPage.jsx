import { useEffect } from 'react'
import { Alert, Button, Flex, Form, Popconfirm, Spin, Tooltip, message } from 'antd'
import { ArrowLeftOutlined, DeleteFilled, SaveOutlined } from '@ant-design/icons'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import ContentFrame from '../../../components/ContentFrame'
import BatchForm from '../batches/components/BatchForm'
import { BatchStatusTag } from '../batches/components/BatchesTable'
import { useBatch, useDeleteBatch, useSaveBatch } from '../batches/hooks/useBatches'
import { toFormValues } from '../batches/lib/batch'
import { BATCHES_BASE } from '../constants'

// Postgres error code returned by PostgREST.
const FOREIGN_KEY_VIOLATION = '23503'

/** Create (`/batches/new`) or edit (`/batches/:batchId`) one batch. */
const BatchPage = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { batchId: idParam } = useParams()
    const isNew = idParam === 'new'
    const batchId = isNew ? null : Number(idParam)

    const [messageApi, contextHolder] = message.useMessage()
    const { data: batch, isLoading, isError, error } = useBatch(batchId)
    const saveBatch = useSaveBatch()
    const deleteBatch = useDeleteBatch()

    const form = useForm({ mode: 'onChange', defaultValues: toFormValues(null) })
    const {
        handleSubmit,
        reset,
        formState: { isDirty, isValid },
    } = form

    useEffect(() => {
        if (isNew) {
            reset(toFormValues(null))
        } else if (batch) {
            reset(toFormValues(batch))
        }
    }, [isNew, batch, reset])

    const showError = (err) => {
        const content =
            err?.code === FOREIGN_KEY_VIOLATION
                ? t('admin.batches.errors.inUse')
                : `${t('common.messages.errorOccurred')} ${err?.message ?? ''}`.trim()
        messageApi.open({ type: 'error', content, duration: 5 })
    }

    const onSubmit = (values) =>
        saveBatch.mutateAsync({ id: batchId, values }).then((savedId) => {
            messageApi.open({
                type: 'success',
                content: t(isNew ? 'common.messages.successfullyAdded' : 'common.messages.successfullyUpdated'),
                duration: 3,
            })
            if (isNew) navigate(`${BATCHES_BASE}/${savedId}`, { replace: true })
        }, showError)

    const onDelete = () =>
        deleteBatch.mutateAsync(batchId).then(() => {
            messageApi.open({ type: 'success', content: t('common.messages.successfullyDeleted'), duration: 3 })
            navigate(BATCHES_BASE)
        }, showError)

    if (!isNew && !Number.isInteger(batchId)) {
        return (
            <Navigate
                to={BATCHES_BASE}
                replace={true}
            />
        )
    }

    const title = isNew
        ? t('admin.batches.new.title')
        : batch
          ? `${batch.batch_number} ${batch.name}`
          : t('admin.batches.edit.title')
    const inUse = (batch?.usageCount ?? 0) > 0

    return (
        <ContentFrame
            title={title}
            description={isNew ? t('admin.batches.new.description') : t('admin.batches.edit.description')}
            extraBreadcrumbs={[{ href: `${BATCHES_BASE}/${idParam}`, title }]}
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
                                        onClick={() => navigate(BATCHES_BASE)}
                                    >
                                        {t('admin.batches.actions.back')}
                                    </Button>
                                    {batch && <BatchStatusTag batch={batch} />}
                                </Flex>
                                <Flex gap={8}>
                                    {!isNew && (
                                        <Popconfirm
                                            title={t('admin.batches.actions.delete')}
                                            description={t('admin.batches.actions.deleteConfirmation')}
                                            onConfirm={onDelete}
                                            okText={t('common.yes')}
                                            cancelText={t('common.no')}
                                            disabled={inUse}
                                        >
                                            <Tooltip title={inUse ? t('admin.batches.errors.inUse') : null}>
                                                <Button
                                                    danger
                                                    icon={<DeleteFilled />}
                                                    disabled={inUse}
                                                    loading={deleteBatch.isPending}
                                                >
                                                    {t('common.actions.delete')}
                                                </Button>
                                            </Tooltip>
                                        </Popconfirm>
                                    )}
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        disabled={!isDirty || !isValid || saveBatch.isPending}
                                        loading={saveBatch.isPending}
                                        onClick={handleSubmit(onSubmit)}
                                    >
                                        {t('common.actions.save')}
                                    </Button>
                                </Flex>
                            </Flex>
                            <BatchForm batch={isNew ? null : batch} />
                        </Flex>
                    </Form>
                </FormProvider>
            )}
        </ContentFrame>
    )
}

export default BatchPage
