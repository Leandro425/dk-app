import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AREAS, findArea, findSelectedItem, itemPath } from '../config/navigation'

/**
 * Resolves the current area and sidebar state from the URL.
 *
 * Returns
 * - `area`         the AREAS entry for the current path (home when outside any area)
 * - `items`        the area's sidebar entries with `path` and translated `label`
 * - `selectedKey`  path of the item that matches the URL (longest prefix wins)
 * - `breadcrumbs`  `{ href, title }` list for ContentFrame: area, then the selected item
 */
const useAreaNav = () => {
    const { pathname } = useLocation()
    const { t } = useTranslation()

    return useMemo(() => {
        const area = findArea(pathname) ?? AREAS.home
        const items = area.items.map((item) => ({ ...item, path: itemPath(area, item), label: t(item.labelKey) }))
        const selected = findSelectedItem(area, pathname)
        const selectedKey = selected ? itemPath(area, selected) : undefined

        const breadcrumbs = [{ href: area.base, title: t(area.titleKey) }]
        if (selected && selected.key !== '') {
            breadcrumbs.push({ href: selectedKey, title: t(selected.labelKey) })
        }

        return { area, items, selectedKey, breadcrumbs }
    }, [pathname, t])
}

export default useAreaNav
