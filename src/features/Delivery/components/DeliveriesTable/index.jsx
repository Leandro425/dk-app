import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Table } from 'antd'
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

const DeliveriesTable = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
    const [openAddModal, setOpenAddModal] = useState(false)
    const [selectedDelivery, setSelectedDelivery] = useState(null)
    const [openEditModal, setOpenEditModal] = useState(false)

    const fetchData = async ({ queryKey }) => {
        const [, page, pageSize] = queryKey
        const from = (page - 1) * pageSize
        const to = page * pageSize - 1
        const { data, count, error } = await supabase
            .from('Delivery')
            .select(
                '*, order:Order(*), field:Field(*), article:Article(*), created_by:Supervisor!Delivery_created_by_fkey(*), modified_by:Supervisor!Delivery_modified_by_fkey(*)',
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

    const { data, isLoading } = useQuery({
        queryKey: ['deliveries', pagination.current, pagination.pageSize],
        queryFn: fetchData,
        keepPreviousData: true,
    })

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
            render: (_, delivery) => (
                <Button
                    type="default"
                    onClick={() => {
                        setOpenEditModal(true)
                        setSelectedDelivery(delivery)
                    }}
                >
                    {t('common.actions.edit')}
                </Button>
            ),
        },
    ]

    return (
        <>
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
