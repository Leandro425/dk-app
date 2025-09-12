import { Button } from 'antd'
import { SettingFilled } from '@ant-design/icons'
import { Fragment, useState } from 'react'
import SettingsDialog from '../dialogs/SettiingsDialog'
const SettingsIconButton = () => {
    const [open, setOpen] = useState(false)
    return (
        <Fragment>
            <Button
                type="default"
                icon={<SettingFilled />}
                onClick={() => setOpen(true)}
            />
            <SettingsDialog
                open={open}
                onClose={() => setOpen(false)}
            />
        </Fragment>
    )
}

export default SettingsIconButton
