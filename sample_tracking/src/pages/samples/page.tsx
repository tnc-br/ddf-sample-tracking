'use client'
import { useEffect, useMemo } from 'react'
import SamplesTable from '../../old_components/samples_table'
import SamplesTableNew from '../../old_components/samples_table_new'
import { type Sample } from '../../old_components/utils'
import { useTranslation } from 'react-i18next'
import '@i18n/config'
import { useGlobal } from '@hooks/useGlobal'
import Card from '@components/layout/home/Card'
import { useSamplesFromCollection } from '../../hooks/useFirebaseSamples'
import { useCurrentUser } from '@hooks/useCurrentUser'

const COMPLETED_SAMPLES = 'completed_samples'
const IN_PROGRESS_SAMPLES = 'in_progress_samples'

export default function Samples() {
  const { t } = useTranslation()
  const { setShowNavBar, setShowTopBar } = useGlobal()

  useEffect(() => {
    setShowNavBar(true)
    setShowTopBar(true)
  }, [])

  const {
    user: userData,
    loading: loadingUser,
    error: errorUser,
    isAuthenticated,
  } = useCurrentUser()

  const {
    data: trustedSamples,
    loading: loadingTrusted,
    error: errorTrusted,
  } = useSamplesFromCollection(userData, 'trusted_samples')

  const {
    data: untrustedSamples,
    loading: loadingUntrusted,
    error: errorUntrusted,
  } = useSamplesFromCollection(userData, 'untrusted_samples')

  const {
    data: unknownSamples,
    loading: loadingUnknown,
    error: errorUnknown,
  } = useSamplesFromCollection(userData, 'unknown_samples')

  const allSamples = useMemo(() => {
    if (!trustedSamples && !untrustedSamples && !unknownSamples) {
      return { inProgress: null, completed: null }
    }

    const inProgressSamples: Sample[] = []
    const completedSamples: Sample[] = []

    // Processar amostras trusted
    trustedSamples?.forEach((sample: Sample) => {
      const sampleWithTrust = { ...sample, trusted: 'trusted' }
      if (sample.status === 'concluded') {
        completedSamples.push(sampleWithTrust)
      } else {
        inProgressSamples.push(sampleWithTrust)
      }
    })

    // Processar amostras untrusted
    untrustedSamples?.forEach((sample: Sample) => {
      const sampleWithTrust = { ...sample, trusted: 'untrusted' }
      if (sample.status === 'concluded') {
        completedSamples.push(sampleWithTrust)
      } else {
        inProgressSamples.push(sampleWithTrust)
      }
    })

    // Processar amostras unknown
    unknownSamples?.forEach((sample: Sample) => {
      const sampleWithTrust = { ...sample, trusted: 'unknown' }
      if (sample.status === 'concluded') {
        completedSamples.push(sampleWithTrust)
      } else {
        inProgressSamples.push(sampleWithTrust)
      }
    })

    return {
      inProgress: inProgressSamples.length > 0 ? inProgressSamples : [],
      completed: completedSamples.length > 0 ? completedSamples : [],
    }
  }, [trustedSamples, untrustedSamples, unknownSamples])

  const isLoading =
    loadingUser || loadingTrusted || loadingUntrusted || loadingUnknown
  const hasError = errorUser || errorTrusted || errorUntrusted || errorUnknown
  const isAdmin = userData?.role === 'admin' || userData?.role === 'site_admin'

  const viewTab = (tab: string) => {}

  if (loadingUser || loadingUser) {
    return (
      <div className="loading">
        <span className="material-symbols-outlined loading-icon">
          hourglass_empty
        </span>
        {t('loading')}
      </div>
    )
  }

  if (errorUser || errorUser) {
    return (
      <div className="loading">
        <span className="material-symbols-outlined loading-icon">
          hourglass_empty
        </span>
        {t('errorLoading')}
      </div>
    )
  }

  if (!userData || (!userData && !loadingUser && !loadingUser)) {
    return (
      <div className="loading">
        <span className="material-symbols-outlined loading-icon">
          hourglass_empty
        </span>
        {t('errorLoading')}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="loading">
        <span className="material-symbols-outlined loading-icon">
          hourglass_empty
        </span>
        {t('loading')}
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="loading">
        <span className="material-symbols-outlined loading-icon">error</span>
        {t('errorLoading')}
      </div>
    )
  }

  return (
    <div className="px-4">
      <div className="flex gap-8 mt-12">
        {allSamples.inProgress && (
          <Card
            qtty={allSamples.inProgress.length}
            variant="inProgress"
            subtext={t('inProgress')}
            onClick={() => viewTab(IN_PROGRESS_SAMPLES)}
          />
        )}
        {allSamples.completed && (
          <Card
            qtty={allSamples.completed.length}
            variant="completed"
            subtext={t('completed')}
            onClick={() => viewTab(COMPLETED_SAMPLES)}
          />
        )}
      </div>

      <hr className="h-px color-[#F1F1F1] w-[95%] mx-auto my-6" />

      <div className="flex flex-col gap-4 mt-8" id={IN_PROGRESS_SAMPLES}>
        <div className="flex gap-2 items-center">
          <div className="text-[#006E2C] text-2xl font-bold rounded-lg size-12 bg-[#F3F3F3] flex items-center justify-center">
            {allSamples?.inProgress?.length ?? 0}
          </div>
          <div className="flex flex-col">
            <span className="samples-header">{t('inProgress')}</span>
            <span className="samples-subheader">
              {t('inProgressDescription')}
            </span>
          </div>
        </div>

        {allSamples.inProgress && (
          <SamplesTableNew
            samples={(allSamples?.inProgress as Sample[]) ?? ([] as Sample[])}
            onEdit={(sample) => {
              console.log('Edit sample:', sample)
            }}
            onDelete={
              isAdmin
                ? (sample) => {
                    console.log('Delete sample:', sample)
                  }
                : undefined
            }
          />
        )}
      </div>

      <div className="flex flex-col gap-4 mt-8" id={COMPLETED_SAMPLES}>
        <div className="flex gap-2 items-center">
          <div className="text-[#006E2C] text-2xl font-bold rounded-lg size-12 bg-[#F3F3F3] flex items-center justify-center">
            {allSamples?.completed?.length ?? 0}
          </div>
          <div className="flex flex-col">
            <span className="samples-header">{t('completed')}</span>
            <span className="samples-subheader">
              {t('completedDescription')}
            </span>
          </div>
        </div>

        {allSamples.completed && (
          <SamplesTable
            samplesData={
              allSamples.completed.map((item) => ({
                ...item,
                code_lab: item.code_lab ?? '',
                validity: item.validity ?? '',
                trusted: item.trusted ?? '',
              })) as Sample[]
            }
            canDeleteSamples={isAdmin}
            showValidity={true}
            allowExport={true}
          />
        )}
      </div>

      {(!allSamples.inProgress || allSamples.inProgress.length === 0) &&
        (!allSamples.completed || allSamples.completed.length === 0) && (
          <div>
            No samples to show. Wait to be accepted to an organization to view
            samples.
          </div>
        )}
    </div>
  )
}
