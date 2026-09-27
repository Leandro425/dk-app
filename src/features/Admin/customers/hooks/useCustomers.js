import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { toSavePayload } from '../lib/customer'

export const customersQueryKey = ['customers', 'admin']

const throwOnError = ({ data, error }) => {
    if (error) throw error
    return data
}

/** All customers, sorted by name. Filtering happens in the table. */
export const useCustomers = () => {
    const { supabase } = useSupabaseContext()

    return useQuery({
        queryKey: customersQueryKey,
        queryFn: async () =>
            throwOnError(await supabase.from('customer').select('*').order('name', { ascending: true })),
        enabled: Boolean(supabase),
    })
}

/** One customer and the number of its deliveries (a customer with deliveries cannot be deleted). */
export const useCustomer = (customerId) => {
    const { supabase } = useSupabaseContext()

    return useQuery({
        queryKey: [...customersQueryKey, customerId],
        queryFn: async () => {
            const [customer, deliveries] = await Promise.all([
                supabase.from('customer').select('*').eq('id', customerId).single(),
                supabase.from('delivery').select('id', { count: 'exact', head: true }).eq('customer_id', customerId),
            ])
            const failed = [customer, deliveries].find((result) => result.error)
            if (failed) throw failed.error

            return { ...customer.data, deliveryCount: deliveries.count ?? 0 }
        },
        enabled: Boolean(supabase && customerId),
    })
}

// Customer data is embedded in the delivery list, delivery page and delivery note.
const invalidateCustomers = (queryClient) =>
    Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
        queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
    ])

/** Creates (`id` null) or fully replaces a customer. Resolves to the id. */
export const useSaveCustomer = () => {
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, values }) => {
            const row = toSavePayload(values)
            const query = id
                ? supabase.from('customer').update(row).eq('id', id)
                : supabase.from('customer').insert(row)
            return throwOnError(await query.select('id').single()).id
        },
        onSuccess: () => invalidateCustomers(queryClient),
    })
}

/** Deletes a customer without deliveries (the foreign key on delivery.customer_id blocks it otherwise). */
export const useDeleteCustomer = () => {
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id) => throwOnError(await supabase.from('customer').delete().eq('id', id)),
        onSuccess: () => invalidateCustomers(queryClient),
    })
}
