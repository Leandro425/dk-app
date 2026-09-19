import {
    AppstoreOutlined,
    CarOutlined,
    ClockCircleOutlined,
    ControlOutlined,
    DashboardOutlined,
    EuroOutlined,
    FileTextOutlined,
    HomeOutlined,
} from '@ant-design/icons'

/**
 * Navigation config for the logged-in areas. Both areas render the same shell;
 * this object is the only thing that differs between them.
 *
 * - `base`      absolute path of the area; its index route decides which module opens
 * - `titleKey`  i18n key of the area name (shown in the header and as first breadcrumb)
 * - `adminOnly` area is only offered to supervisors with `is_admin`
 * - `items`     sidebar entries; `key` is the path segment below `base` ('' = the area's own page),
 *               `planned: true` renders the entry disabled until the module exists
 */
export const AREAS = {
    home: {
        key: 'home',
        base: '/app/home',
        titleKey: 'home.title',
        icon: HomeOutlined,
        items: [
            { key: 'dashboard', labelKey: 'dashboard.title', icon: DashboardOutlined },
            { key: 'reports', labelKey: 'reports.title', icon: FileTextOutlined },
            { key: 'timestamps', labelKey: 'timestamps.title', icon: ClockCircleOutlined },
            { key: 'deliveries', labelKey: 'deliveries.title', icon: CarOutlined },
        ],
    },
    admin: {
        key: 'admin',
        base: '/app/admin',
        titleKey: 'admin.title',
        icon: ControlOutlined,
        adminOnly: true,
        // Add further modules here as they are built.
        items: [
            { key: '', labelKey: 'admin.menu.overview', icon: AppstoreOutlined },
            { key: 'payroll', labelKey: 'admin.menu.payroll', icon: EuroOutlined },
        ],
    },
}

/** Full path of a sidebar item inside its area. */
export const itemPath = (area, item) => (item.key ? `${area.base}/${item.key}` : area.base)

const matchesPrefix = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)

/** The area whose `base` is a prefix of `pathname`, or undefined outside the logged-in areas. */
export const findArea = (pathname) => Object.values(AREAS).find((area) => matchesPrefix(pathname, area.base))

/** The item of `area` whose path is the longest prefix of `pathname`. */
export const findSelectedItem = (area, pathname) =>
    area.items
        .filter((item) => matchesPrefix(pathname, itemPath(area, item)))
        .sort((a, b) => itemPath(area, b).length - itemPath(area, a).length)[0]
