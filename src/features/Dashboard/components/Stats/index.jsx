import { Card, Flex, Statistic } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import OrderSelect from '../../../../components/selects/OrderSelect'
import ArticleSelect from '../../../../components/selects/ArticleSelect'
import BatchSelect from '../../../../components/selects/BatchSelect'

const Stats = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()

    const [orderId, setOrderId] = useState(null)
    const [articleId, setArticleId] = useState(null)
    const [batchId, setBatchId] = useState(null)

    const handleOrderChange = (value) => {
        setOrderId(value)
    }
    const handleArticleChange = (value) => {
        setArticleId(value)
    }
    const handleBatchChange = (value) => {
        setBatchId(value)
    }

    const fetchStatistics = async () => {
        const { data: reportsTotalQuantity, error: reportsError } = await supabase.rpc('get_report_total_quantity', {
            p_batch_id: batchId,
            p_order_id: orderId,
            p_article_id: articleId,
        })
        if (reportsError) throw reportsError

        const { data: deliveryTotalQuantity, error: deliveriesError } = await supabase.rpc(
            'get_delivery_total_quantity',
            {
                p_batch_id: batchId,
                p_order_id: orderId,
                p_article_id: articleId,
            }
        )
        if (deliveriesError) throw deliveriesError

        return {
            produced: reportsTotalQuantity || 0,
            delivered: deliveryTotalQuantity || 0,
        }
    }

    const { data } = useQuery({
        queryKey: ['statistics', orderId, articleId, batchId],
        queryFn: fetchStatistics,
        placeholderData: keepPreviousData,
    })
    const producedAmount = data?.produced ?? 0
    const deliveredAmount = data?.delivered ?? 0

    return (
        <Card title={t('dashboard.statistics.title')}>
            <Flex gap={32}>
                <Flex
                    flex={1}
                    vertical
                    gap={16}
                    style={{ minWidth: 200 }}
                >
                    <OrderSelect
                        supabase={supabase}
                        style={{ width: '100%' }}
                        value={orderId}
                        onChange={handleOrderChange}
                        allowClear
                        placeholder={t('dashboard.statistics.order')}
                        enabled={supabase !== null}
                    />
                    <ArticleSelect
                        supabase={supabase}
                        style={{ width: '100%' }}
                        value={articleId}
                        onChange={handleArticleChange}
                        allowClear
                        placeholder={t('dashboard.statistics.article')}
                        enabled={supabase !== null}
                        includeArchived
                    />
                    <BatchSelect
                        supabase={supabase}
                        style={{ width: '100%' }}
                        value={batchId}
                        onChange={handleBatchChange}
                        allowClear
                        placeholder={t('dashboard.statistics.batch')}
                        enabled={supabase !== null}
                        includeArchived
                    />
                </Flex>
                <Flex
                    gap={32}
                    flex={2}
                    justify="space-around"
                    align="middle"
                    style={{ minWidth: 300 }}
                >
                    <Statistic
                        title={t('dashboard.statistics.produced')}
                        value={producedAmount}
                        precision={2}
                    />

                    <Statistic
                        title={t('dashboard.statistics.delivered')}
                        value={deliveredAmount}
                        precision={2}
                    />

                    <Statistic
                        title={t('dashboard.statistics.balance')}
                        value={producedAmount - deliveredAmount}
                        precision={2}
                    />
                </Flex>
            </Flex>
        </Card>
    )
}
export default Stats
