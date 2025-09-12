import { Flex, Modal, Typography } from 'antd'

import { useTranslation } from 'react-i18next'
import LanguageSelect from './LanguageSelect'

const { Text } = Typography

const SettingsDialog = ({ open, onClose }) => {
    const { t } = useTranslation()

    const handleOnCancel = () => {
        onClose()
    }

    return (
        <Modal
            title={t('settings.title')}
            open={open}
            onCancel={handleOnCancel}
            centered
            footer={null}
        >
            <Flex
                vertical
                gap={16}
                align="start"
            >
                <Text>{t('settings.description')}</Text>
                <LanguageSelect />
            </Flex>
        </Modal>
    )
}

export default SettingsDialog
