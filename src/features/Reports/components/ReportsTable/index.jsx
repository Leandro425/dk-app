import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Flex, Table } from 'antd'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'

const ReportsTable = () => {
    const { t } = useTranslation()
    const { supabase } = useSupabaseContext()

    const { data } = useQuery({
        queryKey: ['reports'],
        queryFn: async () => {
            const { data, error } = await supabase.from('Note').select('*')
            if (error) {
                console.error('Error fetching note:', error)
                return []
            }
            return data
        },
    })

    const columns = [
        { title: t('reports.table.columns.id'), dataIndex: 'id', key: 'id' },
        { title: t('reports.table.columns.text'), dataIndex: 'text', key: 'text' },
        { title: t('reports.table.columns.createdAt'), dataIndex: 'created_at', key: 'created_at' },
    ]

    return (
        <Flex vertical>
            <Table
                columns={columns}
                dataSource={data}
            />
        </Flex>
    )
}
export default ReportsTable
