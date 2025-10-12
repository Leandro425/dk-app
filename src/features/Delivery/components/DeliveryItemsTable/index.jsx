import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Popconfirm, Table, message } from 'antd'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useState } from 'react'

import { formatDateTime, getArticleLabel, getFieldLabel, getOrderLabel } from '../../../../utils/helpers'
import { DeleteFilled, EditFilled } from '@ant-design/icons'
import AddDeliveryItemModal from '../modals/AddDeliveryItemModal'
import EditDeliveryItemModal from '../modals/EditDeliveryItemModal'

const DeliveryItemsTable = ({ deliveryId }) => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const [messageApi, contextHolder] = message.useMessage()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
    const [openAddModal, setOpenAddModal] = useState(false)
    const [selectedDeliveryItem, setSelectedDeliveryItem] = useState(null)
    const [openEditModal, setOpenEditModal] = useState(false)

    const fetchData = async ({ queryKey }) => {
        const [, , , page, pageSize] = queryKey
        const from = (page - 1) * pageSize
        const to = page * pageSize - 1
        const { data, count, error } = await supabase
            .from('delivery_item')
            .select('*, order:order(*), field:field(*), article:article(*)', {
                count: 'exact',
            })
            .eq('delivery_id', deliveryId)
            .range(from, to)
            .order('id', { ascending: false })
        if (error) {
            return { data: [], total: 0 }
        }
        return { data, total: count }
    }

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['deliveries', deliveryId, 'items', pagination.current, pagination.pageSize],
        queryFn: fetchData,
        keepPreviousData: true,
    })

    const handleDelete = async (deliveryId) => {
        const { error } = await supabase.from('delivery_item').delete().eq('id', deliveryId)

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
        {
            title: t('deliveries.items.table.columns.order'),
            dataIndex: 'order',
            key: 'order',
            render: getOrderLabel,
        },
        {
            title: t('deliveries.items.table.columns.field'),
            dataIndex: 'field',
            key: 'field',
            render: getFieldLabel,
        },
        {
            title: t('deliveries.items.table.columns.article'),
            dataIndex: 'article',
            key: 'article',
            render: getArticleLabel,
        },
        { title: t('deliveries.items.table.columns.quantity'), dataIndex: 'quantity', key: 'quantity', align: 'right' },
        {
            title: t('deliveries.items.table.columns.createdAt'),
            dataIndex: 'created_at',
            key: 'created_at',
            render: formatDateTime,
        },
        {
            title: t('deliveries.items.table.columns.actions'),
            key: 'operation',
            fixed: 'right',
            width: 100,
            render: (_, deliveryItem) => (
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
                            setSelectedDeliveryItem(deliveryItem)
                        }}
                    />
                    <Popconfirm
                        title={t('deliveries.items.actions.delete')}
                        description={t('deliveries.items.actions.deleteConfirmation')}
                        onConfirm={() => handleDelete(deliveryItem.id)}
                        onCancel={() => {}}
                        okText={t('common.yes')}
                        cancelText={t('common.no')}
                    >
                        <Button
                            type="primary"
                            icon={<DeleteFilled />}
                            danger
                        />
                    </Popconfirm>
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
                        {t('deliveries.items.actions.add')}
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
            <AddDeliveryItemModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                deliveryId={deliveryId}
            />
            <EditDeliveryItemModal
                open={openEditModal}
                onClose={() => {
                    setOpenEditModal(false)
                    setSelectedDeliveryItem(null)
                }}
                deliveryId={deliveryId}
                deliveryItem={selectedDeliveryItem}
            />
        </>
    )
}
export default DeliveryItemsTable
