'use client'

import { useGlobal } from '@hooks/useGlobal'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@hooks/useCurrentUser'
import { useForm } from 'react-hook-form'
import Select from '@components/ui/Select'
import {
  DEFAULT_MAP_COLORS,
  DEFAULT_MAP_RADIUS,
  getMapConfigFromFirestore,
  saveMapConfigToFirestore,
  type MapColorsConfig,
  type MapConfig,
} from '@utils/mapColorsConfig'
import TextInput from '@components/ui/TextInput'

const LANGUAGE_OPTIONS = [
  { label: 'Português', value: 'pt', icon: '🇧🇷' },
  { label: 'English', value: 'en', icon: '🇺🇸' },
]

// Tipo para o formulário de configurações da organização
type OrgConfigFormData = {
  highColor: string
  mediumColor: string
  lowColor: string
  mapRadius: number
}

export default function Config() {
  const { setShowNavBar, setShowTopBar } = useGlobal()
  const { t, i18n } = useTranslation()
  const { user, loading: userLoading } = useCurrentUser()
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

  // Estados para a configuração do mapa
  const [loadingMapConfig, setLoadingMapConfig] = useState(true)
  const [showOrgAlert, setShowOrgAlert] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [savedConfig, setSavedConfig] = useState<OrgConfigFormData | null>(null)

  // Permissão: apenas admin e site_admin podem editar
  const canEdit =
    !!user?.org && (user?.role === 'site_admin' || user?.role === 'admin')

  // Configuração do formulário
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<OrgConfigFormData>({
    defaultValues: {
      highColor: DEFAULT_MAP_COLORS.high,
      mediumColor: DEFAULT_MAP_COLORS.medium,
      lowColor: DEFAULT_MAP_COLORS.low,
      mapRadius: DEFAULT_MAP_RADIUS,
    },
  })

  // Watch dos valores para preview
  const watchedColors = watch(['highColor', 'mediumColor', 'lowColor'])
  const watchedRadius = watch('mapRadius')

  useEffect(() => {
    setShowNavBar(true)
    setShowTopBar(true)
  }, [])

  const handleLanguageChange = (languageValue: string) => {
    setCurrentLanguage(languageValue)
    i18n.changeLanguage(languageValue)
    // Salvar no localStorage para persistir a escolha
    localStorage.setItem('timberid-language', languageValue)
  }

  // Função para submeter o formulário
  const onSubmitOrgConfig = async (data: OrgConfigFormData) => {
    if (!user?.org) {
      setShowOrgAlert(true)
      return
    }

    try {
      const mapConfig: MapConfig = {
        colors: {
          high: data.highColor,
          medium: data.mediumColor,
          low: data.lowColor,
        },
        radius: data.mapRadius,
      }

      await saveMapConfigToFirestore(user.org, mapConfig)
      setSaveError(false)
      setSaveSuccess(true)

      // Atualizar savedConfig para refletir os novos valores salvos
      setSavedConfig(data)

      // Esconder mensagem de sucesso após 3 segundos
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      setSaveSuccess(false)
      setSaveError(true)
      setTimeout(() => setSaveError(false), 5000)
    }
  }

  // Função para resetar ao padrão
  const resetToDefault = () => {
    reset({
      highColor: DEFAULT_MAP_COLORS.high,
      mediumColor: DEFAULT_MAP_COLORS.medium,
      lowColor: DEFAULT_MAP_COLORS.low,
      mapRadius: DEFAULT_MAP_RADIUS,
    })
  }

  // Carregar idioma salvo no localStorage na inicialização
  useEffect(() => {
    const savedLanguage = localStorage.getItem('timberid-language')
    if (savedLanguage && savedLanguage !== i18n.language) {
      setCurrentLanguage(savedLanguage)
      i18n.changeLanguage(savedLanguage)
    }
  }, [i18n])

  // Carregar configuração do mapa salva no Firestore
  useEffect(() => {
    const loadMapConfig = async () => {
      if (!userLoading && user?.org) {
        try {
          setLoadingMapConfig(true)
          const config = await getMapConfigFromFirestore(user.org)
          const formValues = {
            highColor: config.colors.high,
            mediumColor: config.colors.medium,
            lowColor: config.colors.low,
            mapRadius: config.radius,
          }
          reset(formValues)
          setSavedConfig(formValues)
        } catch (error) {
          console.error('Erro ao carregar configuração:', error)
          reset({
            highColor: DEFAULT_MAP_COLORS.high,
            mediumColor: DEFAULT_MAP_COLORS.medium,
            lowColor: DEFAULT_MAP_COLORS.low,
            mapRadius: DEFAULT_MAP_RADIUS,
          })
        } finally {
          setLoadingMapConfig(false)
        }
      } else if (!userLoading && !user?.org) {
        setLoadingMapConfig(false)
        setShowOrgAlert(true)
      }
    }

    loadMapConfig()
  }, [user?.org, userLoading, reset])

  return (
    <div className="px-6 py-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('configurations')}
        </h1>
        <p className="text-gray-600">{t('configPageDescription')}</p>
      </div>

      {/* Configurações do Site */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('siteSettings')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('siteSettingsDescription')}
          </p>
        </div>

        <div className="px-6 py-4">
          {/* Configuração de Idioma */}
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900 block mb-1">
                {t('systemLanguage')}
              </label>
              <p className="text-sm text-gray-600">
                {t('systemLanguageDescription')}
              </p>
            </div>
            <div className="w-48 ml-4">
              <Select
                options={LANGUAGE_OPTIONS}
                value={currentLanguage}
                onChange={handleLanguageChange}
                placeholder={t('selectLanguage')}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Configurações da Organização */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('sampleSettings')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('sampleSettingsDescription')}
          </p>
        </div>

        {/* Alerta quando não há organização */}
        {showOrgAlert && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {t('organizationRequired')}
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  {t('organizationRequiredMessage')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulário de Configurações */}
        <form onSubmit={handleSubmit(onSubmitOrgConfig)} className="px-6 py-4">
          {/* Mensagem de Sucesso */}
          {saveSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  {t('mapColorsSaved')}
                </span>
              </div>
            </div>
          )}

          {/* Configuração de Cores do Mapa */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {t('mapColors')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('mapColorsDescription')}
                </p>
              </div>
              <button
                type="button"
                onClick={resetToDefault}
                disabled={!canEdit || isSubmitting}
                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('loading') : t('resetToDefault')}
              </button>
            </div>

            {loadingMapConfig ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">
                    {t('loadingMapColors')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Alta Probabilidade */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {t('highProbability')}
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      {...register('highColor')}
                      disabled={!canEdit || isSubmitting}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('colorPickerLabel')}
                    />
                    <div className="flex-1">
                      <div
                        className="w-full h-6 rounded border border-gray-300"
                        style={{ backgroundColor: watch('highColor') }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {watch('highColor')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Média Probabilidade */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {t('mediumProbability')}
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      {...register('mediumColor')}
                      disabled={!canEdit || isSubmitting}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('colorPickerLabel')}
                    />
                    <div className="flex-1">
                      <div
                        className="w-full h-6 rounded border border-gray-300"
                        style={{ backgroundColor: watch('mediumColor') }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {watch('mediumColor')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Baixa Probabilidade */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {t('lowProbability')}
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      {...register('lowColor')}
                      disabled={!canEdit || isSubmitting}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('colorPickerLabel')}
                    />
                    <div className="flex-1">
                      <div
                        className="w-full h-6 rounded border border-gray-300"
                        style={{ backgroundColor: watch('lowColor') }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {watch('lowColor')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Configuração de Raio do Mapa */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {t('mapRadius')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('mapRadiusDescription')}
              </p>
            </div>

            {loadingMapConfig ? (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">
                    {t('loadingMapColors')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="max-w-sm">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    {t('radiusInKm')}
                  </label>
                  <TextInput
                    type="number"
                    {...register('mapRadius', {
                      valueAsNumber: true,
                      min: { value: 10, message: t('minRadius') },
                      max: { value: 1000, message: t('maxRadius') },
                    })}
                    placeholder={t('radiusPlaceholder')}
                    disabled={!canEdit || isSubmitting}
                    isErrored={!!errors.mapRadius}
                    className="w-full"
                  />
                  {errors.mapRadius && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.mapRadius.message}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>{t('defaultRadius')}</p>
                  <p>
                    {t('minRadius')} • {t('maxRadius')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mensagem de Erro */}
          {saveError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-red-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-red-800">
                  {t('errorSavingMapColors')}
                </span>
              </div>
            </div>
          )}

          {/* Botões do Formulário */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                if (savedConfig) {
                  reset(savedConfig)
                }
              }}
              disabled={isSubmitting || !isDirty}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!canEdit || isSubmitting || !isDirty}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
