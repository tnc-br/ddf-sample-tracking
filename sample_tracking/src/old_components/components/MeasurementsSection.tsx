import React from 'react'
import { type Sample } from '../utils'
import { useTranslation } from 'react-i18next'

type Props = {
  selectedDoc: Sample
}

const MeasurementsSection = ({ selectedDoc }: Props) => {
  const { t } = useTranslation()

  return (
    <div className="details">
      <div className="section-title">{t('sampleMeasurements')}</div>{' '}
      <table className="w-full border-collapse border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
              {t('point')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
              δ<sup>13</sup>C {t('wood')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
              δ<sup>13</sup>C {t('cel')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
              δ<sup>18</sup>O {t('wood')}
            </th>
            <th>
              δ<sup>18</sup>O {t('cel')}
            </th>
            <th>
              δ<sup>15</sup>N {t('wood')}
            </th>
          </tr>
        </thead>
        <tbody>
          {selectedDoc['points']
            ? selectedDoc['points'].map(function (point, i) {
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{point['d13C_wood']}</td>
                    <td>{point['d13C_cel']}</td>
                    <td>{point['d18O_wood']}</td>
                    <td>{point['d18O_cel']}</td>
                    <td>{point['d15N_wood']}</td>
                  </tr>
                )
              })
            : ''}
        </tbody>
      </table>
    </div>
  )
}

export default MeasurementsSection
