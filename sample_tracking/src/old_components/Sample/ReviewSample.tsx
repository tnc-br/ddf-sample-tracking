import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getLargestIndex } from './old/SampleMeasurementTab'
import { MdArrowBack } from 'react-icons/md'

interface ReviewAndSubmitTabProps {
  formData: any
  onNextClick: () => void
  onCancelClick: () => void
}

function ReviewAndSubmitTab({
  formData,
  onNextClick,
  onCancelClick,
}: ReviewAndSubmitTabProps) {
  const { t } = useTranslation()

  const numMeasurements = getLargestIndex([
    formData.d18O_cel,
    formData.d18O_wood,
    formData.d15N_wood,
    formData.n_wood,
    formData.d13C_wood,
    formData.c_wood,
    formData.c_cel,
    formData.d13C_cel,
  ])

  const [currentMeasurementsTab, setCurentMeasurementsTab] = useState(0)

  function handleMeasurementsTabClick(evt: any) {
    setCurentMeasurementsTab(parseInt(evt.target.id))
  }

  return (
    <>
      {/* <div className="flex justify-between items-center">
        <div className="flex gap-2.5">
          <div className="bg-[#F7F7F7] size-6 rounded text-[#006E2C] flex items-center justify-center">
            <MdArrowBack className="text-base" />
          </div>
          <span className="bg-white">Voltar</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Revisar Amostra
        </h1>
        <div></div>
      </div> */}

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Revisar dados da amostra
          </h1>
          <p className="text-gray-600">
            Confira os dados abaixo antes de finalizar
          </p>
        </div>

        {/* Details Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Detalhes da Amostra
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nome da amostra */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sampleName')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData['sample_name'] || 'Amostrada coletada no dia 25/08'}
              </div>
            </div>

            {/* Local de coleta */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('collectionSite')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData['site'] || 'Rio de Janeiro'}
              </div>
            </div>

            {/* Fornecedor */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('supplierName')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData['supplier'] || '-'}
              </div>
            </div>

            {/* Código */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData['code_lab'] || '123456'}
              </div>
            </div>

            {/* Latitude */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('latitude')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData['lat'] || '-22.95'}
              </div>
            </div>

            {/* Cidade */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('city')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData['city'] || 'Não preenchido'}
              </div>
            </div>

            {/* Espécies */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('treeSpecies')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData['species'] || '-'}
              </div>
            </div>

            {/* Longitude */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('longitude')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData['lon'] || '-22.95183'}
              </div>
            </div>

            {/* Coletado por */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('collectedBy')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData['collected_by'] || 'Polícia florestal'}
              </div>
            </div>

            {/* Origem */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('origin')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData['trusted'] || 'Untrusted'}
              </div>
            </div>
          </div>
        </div>

        {/* Measurements Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Medições</h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {numMeasurements.map((_, index) => (
              <button
                key={index}
                onClick={handleMeasurementsTabClick}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentMeasurementsTab === index
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span id={index.toString()}>Medição {index + 1}</span>
              </button>
            ))}
          </div>

          {/* Measurements Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* d18O_cel */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('d18O_cel')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData.d18O_cel
                  ? formData.d18O_cel[currentMeasurementsTab] || '12'
                  : '12'}
              </div>
            </div>

            {/* d18O_wood */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                d18O_wood:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData.d18O_wood
                  ? formData.d18O_wood[currentMeasurementsTab] || '13'
                  : '13'}
              </div>
            </div>

            {/* d15N_wood */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('d15N_wood')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData.d15N_wood
                  ? formData.d15N_wood[currentMeasurementsTab] || '11'
                  : '11'}
              </div>
            </div>

            {/* n_wood */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('n_wood')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData.n_wood
                  ? formData.n_wood[currentMeasurementsTab] || '44'
                  : '44'}
              </div>
            </div>

            {/* d13C_wood */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('d13C_wood')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData.d13C_wood
                  ? formData.d13C_wood[currentMeasurementsTab] || '55'
                  : '55'}
              </div>
            </div>

            {/* c_wood */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('c_wood')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData.c_wood
                  ? formData.c_wood[currentMeasurementsTab] || '145'
                  : '145'}
              </div>
            </div>

            {/* d13C_cel */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('d13C_cel')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData.d13C_cel
                  ? formData.d13C_cel[currentMeasurementsTab] || '165'
                  : '165'}
              </div>
            </div>

            {/* c_cel */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('c_cel')}:
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-900">
                {formData.c_cel
                  ? formData.c_cel[currentMeasurementsTab] || '10'
                  : '10'}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onCancelClick}
            type="button"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 font-medium transition-colors"
          >
            {t('back')}
          </button>
          <button
            onClick={onNextClick}
            type="button"
            className="px-6 py-3 bg-[#006E2C] rounded-full hover:bg-green-700 text-white font-medium transition-colors"
          >
            Finalizar amostra
          </button>
        </div>
      </div>
    </>
  )
}

export default ReviewAndSubmitTab
