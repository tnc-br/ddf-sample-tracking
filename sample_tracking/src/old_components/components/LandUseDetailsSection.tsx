import React from 'react'
import { type Sample } from '../utils'
import { useTranslation } from 'react-i18next'
import { Trans } from 'react-i18next'
import axios from 'axios'

type Props = {
  selectedDoc: Sample & {
    water_pct?: {
      is_point_water: boolean
      water_mean_in_1km_buffer: number
      water_mean_in_10km_buffer: number
    }
    land_use_anthropic_pct?: Record<string, number>
    land_use_primary_vegetation_pct?: Record<string, number>
    land_use_secondary_vegetation_or_regrowth_pct?: Record<string, number>
  }
  sampleId: string
}

/**
 * Component that displays the land use details for the given lat,lon.
 * Data from MapBiomas (https://mapbiomas.org/)
 */
const LandUseDetailsSection = ({ selectedDoc, sampleId }: Props) => {
  const { t } = useTranslation()
  const mapUrl = (selectedDoc as any).map_landuse_percentage_probability

  function formatAsPercentage(num: number) {
    return new Intl.NumberFormat('default', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const showMap = selectedDoc?.d18O_cel?.length > 2

  const handleOpenPDF = () => {
    if (mapUrl) {
      window.open(mapUrl, '_blank')
    }
  }

  return (
    <div className="details">
      <div className="section-title">{t('waterAndLandUseDetails')}</div>
      <div className="iframe-wrapper">
        {mapUrl ? (
          <div className="relative w-full" style={{ height: '600px' }}>
            {/* Visualizador de PDF embutido */}
            <embed
              src={mapUrl}
              type="application/pdf"
              width="100%"
              height="100%"
              className="border border-gray-300 rounded-lg"
            />
            
            {/* Botão flutuante para abrir em nova aba */}
            <button
              onClick={handleOpenPDF}
              className="absolute top-2 right-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10"
              title={t('openInNewTab') || 'Abrir em nova aba'}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {t('openInNewTab') || 'Nova Aba'}
            </button>
          </div>
        ) : !showMap ? (
          <p>{t('need_d18O_cel')}</p>
        ) : !selectedDoc.lat || !selectedDoc.lon ? (
          <div className="flex items-center justify-center h-full">
            Sem Coordenadas
          </div>
        ) : null}
      </div>
      <div className="water-land-use-details">
        <div className="table-title-land-use">{t('water')}</div>
        <div className="detail-row">
          <div className="detail">
            <span className="detail-name">{t('waterAndLandUseDetails')}</span>
            <span className="detail-value">
              {selectedDoc['water_pct']
                ? selectedDoc['water_pct']['is_point_water']
                  ? 'YES'
                  : 'NO'
                : 'unknown'}
            </span>
          </div>
          <div className="detail">
            <span className="detail-name">
              {t('percentageOfWaterIn1kmBufferZone')}
            </span>
            <span className="detail-value">
              {selectedDoc['water_pct']
                ? formatAsPercentage(
                    selectedDoc['water_pct']['water_mean_in_1km_buffer'],
                  )
                : 'unknown'}
            </span>
          </div>
          <div className="detail">
            <span className="detail-name">
              {t('percentageOfWaterIn10kmBufferZone')}
            </span>
            <span className="detail-value">
              {selectedDoc['water_pct']
                ? formatAsPercentage(
                    selectedDoc['water_pct']['water_mean_in_10km_buffer'],
                  )
                : 'unknown'}
            </span>
          </div>
        </div>
      </div>{' '}
      <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            {/* TODO: read the keys in the Record instead of creating an array */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300 table-title-land-use">
              {t('landUseType')}
            </th>
            {Array.from({ length: 11 }, (_, index) => (
              <th scope="col" key={index}>
                {2011 + index}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              <div className="anthropic legend"></div> {t('anthropicUse')}
            </th>
            {Array.from({ length: 11 }, (_, index) => (
              <td key={index}>
                {selectedDoc['land_use_anthropic_pct']
                  ? formatAsPercentage(
                      selectedDoc['land_use_anthropic_pct'][
                        '' + (2011 + index)
                      ],
                    )
                  : 'unknown'}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">
              <div className="primary-vegetation legend"></div>{' '}
              {t('primaryVegetation')}
            </th>
            {Array.from({ length: 11 }, (_, index) => (
              <td key={index}>
                {selectedDoc['land_use_primary_vegetation_pct']
                  ? formatAsPercentage(
                      selectedDoc['land_use_primary_vegetation_pct'][
                        '' + (2011 + index)
                      ],
                    )
                  : 'unknown'}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">
              <div className="secondary-vegetation legend"></div>{' '}
              {t('secondaryVegetationAndRegrowth')}
            </th>
            {Array.from({ length: 11 }, (_, index) => (
              <td key={index}>
                {selectedDoc['land_use_secondary_vegetation_or_regrowth_pct']
                  ? formatAsPercentage(
                      selectedDoc[
                        'land_use_secondary_vegetation_or_regrowth_pct'
                      ]['' + (2011 + index)],
                    )
                  : 'unknown'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="land-use-source-footer">
        <b>{t('source')}</b>
        <p>
          <Trans i18nKey="landUseSourceFooterP1" t={t}>
            Data from{' '}
            <a target="_blank" href="http://mapbiomas.org">
              MapBiomas
            </a>{' '}
            showing
          </Trans>
          <br></br>
          {t('landUseSourceFooterP2')}
          <br></br>
          {t('landUseSourceFooterP3')}
        </p>
      </div>
    </div>
  )
}

export default LandUseDetailsSection
