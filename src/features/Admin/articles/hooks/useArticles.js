import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useSupabaseContext from '../../../../context/supabase/supabaseContext'
import { toSavePayload } from '../lib/article'

export const articlesQueryKey = ['articles', 'admin']

// PostgREST returns a 1:1 embed as an object, older versions as a one-element array.
const one = (embed) => (Array.isArray(embed) ? (embed[0] ?? null) : (embed ?? null))

const throwOnError = ({ data, error }) => {
    if (error) throw error
    return data
}

/** All articles with their sales price, sorted by name. Filtering happens in the table. */
export const useArticles = () => {
    const { supabase } = useSupabaseContext()

    return useQuery({
        queryKey: articlesQueryKey,
        queryFn: async () =>
            throwOnError(
                await supabase
                    .from('article')
                    .select('*, private:article_private(sales_price)')
                    .order('name', { ascending: true })
            ).map((article) => ({ ...article, private: one(article.private) })),
        enabled: Boolean(supabase),
    })
}

/**
 * One article with its private data and the number of reports and delivery items
 * (an article in use cannot be deleted).
 */
export const useArticle = (articleId) => {
    const { supabase } = useSupabaseContext()

    return useQuery({
        queryKey: [...articlesQueryKey, articleId],
        queryFn: async () => {
            const count = (table) =>
                supabase.from(table).select('id', { count: 'exact', head: true }).eq('article_id', articleId)

            const [article, reports, deliveryItems] = await Promise.all([
                supabase.from('article').select('*, private:article_private(*)').eq('id', articleId).single(),
                count('report'),
                count('delivery_item'),
            ])
            const failed = [article, reports, deliveryItems].find((result) => result.error)
            if (failed) throw failed.error

            return {
                ...article.data,
                private: one(article.data.private),
                usageCount: (reports.count ?? 0) + (deliveryItems.count ?? 0),
            }
        },
        enabled: Boolean(supabase && articleId),
    })
}

// Article data is embedded in reports, timestamps, deliveries (incl. the delivery note) and payroll.
const invalidateArticles = (queryClient) =>
    Promise.all(
        ['articles', 'reports', 'timestamps', 'deliveries', 'payroll', 'statistics'].map((key) =>
            queryClient.invalidateQueries({ queryKey: [key] })
        )
    )

/** Creates (`id` null) or fully replaces an article and its private data in one transaction. Resolves to the id. */
export const useSaveArticle = () => {
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, values }) => {
            const payload = toSavePayload(values)
            return throwOnError(
                await supabase.rpc('save_article', {
                    p_id: id ?? null,
                    p_article: payload.article,
                    p_private: payload.private,
                })
            )
        },
        onSuccess: () => invalidateArticles(queryClient),
    })
}

/** Deletes an article that is not in use (foreign keys block it otherwise); the private row goes with it. */
export const useDeleteArticle = () => {
    const { supabase } = useSupabaseContext()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id) => throwOnError(await supabase.from('article').delete().eq('id', id)),
        onSuccess: () => invalidateArticles(queryClient),
    })
}
