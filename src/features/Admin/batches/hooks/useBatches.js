import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { toSavePayload } from '../lib/batch'

export const batchesQueryKey = ['batches', 'admin']

const throwOnError = ({ data, error }) => {
    if (error) throw error
    return data
}

/** All batches, sorted by batch number. Filtering happens in the table. */
export const useBatches = () => {
    const { supabase } = useSupabaseContext()

    return useQuery({
        queryKey: batchesQueryKey,
        queryFn: async () =>
            throwOnError(await supabase.from('batch').select('*').order('batch_number', { ascending: true })),
        enabled: Boolean(supabase),
    })
}

/** One batch and the number of reports and delivery items using it (a batch in use cannot be deleted). */
export const useBatch = (batchId) => {
    const { supabase } = useSupabaseContext()

    return useQuery({
        queryKey: [...batchesQueryKey, batchId],
        queryFn: async () => {
            const count = (table) =>
                supabase.from(table).select('id', { count: 'exact', head: true }).eq('batch_id', batchId)

            const [batch, reports, deliveryItems] = await Promise.all([
                supabase.from('batch').select('*').eq('id', batchId).single(),
                count('report'),
                count('delivery_item'),
            ])
            const failed = [batch, reports, deliveryItems].find((result) => result.error)
            if (failed) throw failed.error

            return { ...batch.data, usageCount: (reports.count ?? 0) + (deliveryItems.count ?? 0) }
        },
        enabled: Boolean(supabase && batchId),
    })
}

// Batch data is embedded in reports, deliveries (incl. the delivery note) and the dashboard filter.
const invalidateBatches = (queryClient) =>
    Promise.all(
        ['batches', 'reports', 'deliveries', 'statistics'].map((key) =>
            queryClient.invalidateQueries({ queryKey: [key] })
        )
    )

/** Creates (`id` null) or fully replaces a batch. Resolves to the id. */
export const useSaveBatch = () => {
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, values }) => {
            const row = toSavePayload(values, !id)
            const query = id ? supabase.from('batch').update(row).eq('id', id) : supabase.from('batch').insert(row)
            return throwOnError(await query.select('id').single()).id
        },
        onSuccess: () => invalidateBatches(queryClient),
    })
}

/** Deletes a batch that is not in use (the foreign keys from report and delivery_item block it otherwise). */
export const useDeleteBatch = () => {
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id) => throwOnError(await supabase.from('batch').delete().eq('id', id)),
        onSuccess: () => invalidateBatches(queryClient),
    })
}
