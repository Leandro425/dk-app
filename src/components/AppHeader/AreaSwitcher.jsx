import { Segmented } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { AREAS } from '../../config/navigation'
import useAreaNav from '../../hooks/useAreaNav'
import useSupervisorContext from '../../context/user/supervisorContext'

/**
 * Switches between the logged-in areas. Rendered only when the supervisor may enter
 * more than one area; everyone else gets nothing (the header shows the area title instead).
 * Switching always lands on the target area's overview.
 */
const AreaSwitcher = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { area } = useAreaNav()
    const { supervisor } = useSupervisorContext()

    const available = Object.values(AREAS).filter((candidate) => !candidate.adminOnly || supervisor?.is_admin)
    if (available.length < 2) return null

    const options = available.map((candidate) => ({
        value: candidate.key,
        label: t(candidate.titleKey),
        icon: <candidate.icon />,
    }))

    return (
        <Segmented
            options={options}
            value={area.key}
            onChange={(key) => navigate(AREAS[key].base)}
        />
    )
}

export default AreaSwitcher
