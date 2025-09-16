import { Card, Col, Row, Statistic } from 'antd'
// import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
// import { useSupabaseContext } from '../../../../contexts/SupabaseContext'

const Stats = () => {
    const { t } = useTranslation()
    // const { supabase } = useSupabaseContext()

    // const [producedAmount, setProducedAmount] = useState(5)
    // const [deliveredAmount, setDeliveredAmount] = useState(0)
    // const [balanceAmount, setBalanceAmount] = useState(0)

    // const getStatistics = useCallback(async () => {
    //     const { data: reportsData, error: reportsError } = await supabase.from('Report').select('quantity.sumget_report_total_quantity()')
    //     if (reportsError) {
    //         console.error('Error fetching statistics:', reportsError)
    //         return
    //     }
    //     console.log('Reports data:', reportsData)
    //     const produced = reportsData && reportsData.length > 0 ? reportsData[0].sum || 0 : 0
    //     setProducedAmount(produced)

    //     const { data: deliveriesData, error: deliveriesError } = await supabase.from('Delivery').select('sum:quantity')
    //     if (deliveriesError) {
    //         console.error('Error fetching statistics:', deliveriesError)
    //         return
    //     }
    //     const delivered = deliveriesData && deliveriesData.length > 0 ? deliveriesData[0].sum || 0 : 0
    //     setDeliveredAmount(delivered)

    //     setBalanceAmount(produced - delivered)
    // }, [supabase])

    // useEffect(() => {
    //     getStatistics()
    // }, [getStatistics])

    return (
        <Card title={`${t('dashboard.statistics.title')} (demo)`}>
            <Row gutter={24}>
                <Col span={8}>
                    <Statistic
                        title={t('common.actions.produced')}
                        value={1500}
                        precision={2}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={t('common.actions.delivered')}
                        value={1200}
                        precision={2}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={t('common.balance')}
                        value={300}
                        precision={2}
                        // loading
                    />
                </Col>
            </Row>
        </Card>
    )
}
export default Stats
