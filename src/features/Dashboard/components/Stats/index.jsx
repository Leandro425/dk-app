import { Card, Flex, Statistic } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { useQuery } from '@tanstack/react-query'
import OrderSelect from '../../../../components/selects/OrderSelect'
import ArticleSelect from '../../../../components/selects/ArticleSelect'
import FieldSelect from '../../../../components/selects/FieldSelect'

const Stats = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()

    const [producedAmount, setProducedAmount] = useState(0)
    const [deliveredAmount, setDeliveredAmount] = useState(0)
    const [orderId, setOrderId] = useState(null)
    const [articleId, setArticleId] = useState(null)
    const [fieldId, setFieldId] = useState(null)

    const handleOrderChange = (value) => {
        setOrderId(value)
    }
    const handleArticleChange = (value) => {
        setArticleId(value)
    }
    const handleFieldChange = (value) => {
        setFieldId(value)
    }

    const fetchStatistics = async () => {
        const { data: reportsTotalQuantity, error: reportsError } = await supabase.rpc('get_report_total_quantity', {
            p_field_id: fieldId,
            p_order_id: orderId,
            p_article_id: articleId,
        })
        if (reportsError) throw reportsError

        const { data: deliveryTotalQuantity, error: deliveriesError } = await supabase.rpc(
            'get_delivery_total_quantity',
            {
                p_field_id: fieldId,
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
        queryKey: ['statistics', orderId, articleId, fieldId],
        queryFn: fetchStatistics,
    })

    useEffect(() => {
        if (data) {
            setProducedAmount(data.produced)
            setDeliveredAmount(data.delivered)
        }
    }, [data])

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
                        placeholder={t('deliveries.delivery.order')}
                        enabled={supabase !== null}
                    />
                    <ArticleSelect
                        supabase={supabase}
                        style={{ width: '100%' }}
                        value={articleId}
                        onChange={handleArticleChange}
                        allowClear
                        placeholder={t('deliveries.delivery.article')}
                        enabled={supabase !== null}
                    />
                    <FieldSelect
                        supabase={supabase}
                        style={{ width: '100%' }}
                        value={fieldId}
                        onChange={handleFieldChange}
                        allowClear
                        placeholder={t('deliveries.delivery.field')}
                        enabled={supabase !== null}
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
                        title={t('common.actions.produced')}
                        value={producedAmount}
                        precision={2}
                    />

                    <Statistic
                        title={t('common.actions.delivered')}
                        value={deliveredAmount}
                        precision={2}
                    />

                    <Statistic
                        title={t('common.balance')}
                        value={producedAmount - deliveredAmount}
                        precision={2}
                    />
                </Flex>
            </Flex>
        </Card>
    )
}
export default Stats
