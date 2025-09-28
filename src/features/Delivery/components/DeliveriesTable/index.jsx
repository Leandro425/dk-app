import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Table, message } from 'antd'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useState } from 'react'
import AddDeliveryModal from '../modals/AddDeliveryModal'
import EditDeliveryModal from '../modals/EditDeliveryModal'
import {
    formatDate,
    formatDateTime,
    getArticleLabel,
    getFieldLabel,
    getOrderLabel,
    getSupervisorLabel,
} from '../../../../utils/helpers'
import { DeleteFilled, EditFilled } from '@ant-design/icons'

const DeliveriesTable = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const [messageApi, contextHolder] = message.useMessage()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
    const [openAddModal, setOpenAddModal] = useState(false)
    const [selectedDelivery, setSelectedDelivery] = useState(null)
    const [openEditModal, setOpenEditModal] = useState(false)

    const fetchData = async ({ queryKey }) => {
        const [, page, pageSize] = queryKey
        const from = (page - 1) * pageSize
        const to = page * pageSize - 1
        const { data, count, error } = await supabase
            .from('delivery_position')
            .select(
                '*, order:order(*), field:field(*), article:article(*), created_by:supervisor!delivery_created_by_id_fkey(*), modified_by:supervisor!delivery_modified_by_id_fkey(*)',
                {
                    count: 'exact',
                }
            )
            .range(from, to)
            .order('id', { ascending: false })
        if (error) {
            return { data: [], total: 0 }
        }
        return { data, total: count }
    }

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['deliveries', pagination.current, pagination.pageSize],
        queryFn: fetchData,
        keepPreviousData: true,
    })

    const handleDelete = async (deliveryId) => {
        const { error } = await supabase.from('delivery_position').delete().eq('id', deliveryId)

        messageApi.open({
            type: error ? 'error' : 'success',
            content: error ? t('common.messages.errorOccurred') : t('common.messages.successfullyUpdated'),
            duration: 3,
        })

        if (!error) {
            refetch()
        }
    }

    const columns = [
        { title: t('deliveries.table.columns.date'), dataIndex: 'date', key: 'date', render: formatDate },
        {
            title: t('deliveries.table.columns.order'),
            dataIndex: 'order',
            key: 'order',
            render: getOrderLabel,
        },
        {
            title: t('deliveries.table.columns.field'),
            dataIndex: 'field',
            key: 'field',
            render: getFieldLabel,
        },
        {
            title: t('deliveries.table.columns.article'),
            dataIndex: 'article',
            key: 'article',
            render: getArticleLabel,
        },
        { title: t('deliveries.table.columns.quantity'), dataIndex: 'quantity', key: 'quantity', align: 'right' },
        { title: t('deliveries.table.columns.annotation'), dataIndex: 'annotation', key: 'annotation' },
        {
            title: t('deliveries.table.columns.modifiedBy'),
            dataIndex: 'modified_by',
            key: 'modified_by',
            render: getSupervisorLabel,
        },
        {
            title: t('deliveries.table.columns.modifiedAt'),
            dataIndex: 'modified_at',
            key: 'modified_at',
            render: formatDateTime,
        },
        {
            title: t('deliveries.table.columns.createdBy'),
            dataIndex: 'created_by',
            key: 'created_by',
            render: getSupervisorLabel,
        },
        {
            title: t('deliveries.table.columns.createdAt'),
            dataIndex: 'created_at',
            key: 'created_at',
            render: formatDateTime,
        },
        {
            title: t('deliveries.table.columns.actions'),
            key: 'operation',
            fixed: 'right',
            width: 100,
            render: (_, delivery) => (
                <Flex
                    gap={8}
                    flex={1}
                    justify="center"
                    align="center"
                >
                    <Button
                        type="primary"
                        icon={<EditFilled />}
                        onClick={() => {
                            setOpenEditModal(true)
                            setSelectedDelivery(delivery)
                        }}
                    />
                    <Button
                        type="primary"
                        icon={<DeleteFilled />}
                        onClick={() => {
                            handleDelete(delivery.id)
                        }}
                        danger
                    />
                </Flex>
            ),
        },
    ]

    return (
        <>
            {contextHolder}
            <Flex
                vertical
                gap={16}
            >
                <Flex gap={16}>
                    <Button
                        type="primary"
                        onClick={() => setOpenAddModal(true)}
                    >
                        {t('deliveries.actions.add')}
                    </Button>
                </Flex>
                <Flex
                    style={{
                        padding: 0,
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}
                >
                    <Table
                        size="small"
                        loading={isLoading}
                        columns={columns}
                        dataSource={data?.data || []}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: data?.total || 0,
                            showSizeChanger: true,
                            onChange: (current, pageSize) => setPagination({ current, pageSize }),
                        }}
                        rowKey="id"
                        scroll={{ x: 'max-content' }}
                        style={{ width: '100%' }}
                    />
                </Flex>
            </Flex>
            <AddDeliveryModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
            />
            <EditDeliveryModal
                open={openEditModal}
                onClose={() => {
                    setOpenEditModal(false)
                    setSelectedDelivery(null)
                }}
                delivery={selectedDelivery}
            />
        </>
    )
}
export default DeliveriesTable
