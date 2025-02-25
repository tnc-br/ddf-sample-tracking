import { useTranslation } from 'react-i18next'

export function BackButton({
  attemptToUpdateCurrentTab,
  currentTab,
}: {
  attemptToUpdateCurrentTab: (tab: number) => void
  currentTab: number
}) {
  const { t } = useTranslation()

  return (
    <div
      onClick={() => attemptToUpdateCurrentTab(currentTab - 1)}
      className="back-button-wrapper add-sample-button-wrapper"
    >
      <div className="add-sample-slate-layer">
        <div className="add-sample-button-text green-button-text">
          {t('back')}
        </div>
      </div>
    </div>
  )
}

export function CancelButton({ onCancleClick }: { onCancleClick: () => void }) {
  const { t } = useTranslation()
  return (
    <div onClick={onCancleClick} className="add-sample-button-wrapper">
      <div className="add-sample-slate-layer">
        <div className="add-sample-button-text green-button-text">
          {t('cancel')}
        </div>
      </div>
    </div>
  )
}

export function NextButton({
  attemptToUpdateCurrentTab,
  currentTab,
}: {
  attemptToUpdateCurrentTab: (tab: number) => void
  currentTab: number
}) {
  const { t } = useTranslation()
  return (
    <div
      id="next-button-wrapper"
      onClick={() => attemptToUpdateCurrentTab(currentTab + 1)}
      className="add-sample-button-wrapper next-button-wrapper"
    >
      <div className="add-sample-slate-layer">
        <div className="add-sample-button-text white-button-text">
          {t('next')}
        </div>
      </div>
    </div>
  )
}

export function ActionButton({
  onActionButtonClick,
  actionButtonTitle,
}: {
  actionButtonTitle: string
  onActionButtonClick: () => void
}) {
  const { t } = useTranslation()
  return (
    <div
      id="action-button"
      onClick={onActionButtonClick}
      className="add-sample-button-wrapper next-button-wrapper"
    >
      <div className="add-sample-slate-layer">
        <div className="add-sample-button-text white-button-text">
          {actionButtonTitle}
        </div>
      </div>
    </div>
  )
}

export default { BackButton, CancelButton, NextButton, ActionButton }
