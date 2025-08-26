import React from 'react'
import { type Sample } from './utils'

interface SamplesTableProps {
  samples: Sample[]
  onEdit?: (sample: Sample) => void
  onDelete?: (sample: Sample) => void
}

export default function SamplesTableNew({
  samples,
  onEdit,
  onDelete,
}: SamplesTableProps) {
  const getValidityBadge = (validity: string) => {
    const isValid =
      validity === 'Possível' || validity === 'Valid' || validity === 'Possible'
    return (
      <span
        className={`px-2 py-1 rounded text-sm font-medium ${
          isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {validity || 'N/A'}
      </span>
    )
  }

  const getOriginBadge = (trusted: string) => {
    const isTrusted = trusted === 'Trusted' || trusted === 'trusted'
    return (
      <span
        className={`px-2 py-1 rounded text-sm font-medium ${
          isTrusted
            ? 'bg-gray-100 text-gray-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {trusted || 'Unknown'}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white px-1">
        <thead className="bg-gray-50 mb-4">
          <tr>
            <th className="py-3 text-left text-sm text-[#1E1E1E] font-bold tracking-wider pl-4">
              Código interno
            </th>
            <th className="py-3 text-left text-sm text-[#1E1E1E] font-bold tracking-wider">
              Validade
            </th>
            <th className="py-3 text-left text-sm text-[#1E1E1E] font-bold tracking-wider">
              Origem
            </th>
            <th className="py-3 text-left text-sm text-[#1E1E1E] font-bold tracking-wider">
              Última atualização
            </th>
            <th className="py-3 text-left text-sm text-[#1E1E1E] font-bold tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 px-1">
          {samples.map((sample, index) => (
            <tr
              key={sample.doc_id || index}
              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="py-4 whitespace-nowrap pl-4">
                <div className="text-sm font-medium text-green-600">
                  {sample.code_lab || sample.sample_name || 'N/A'}
                </div>
              </td>
              <td className="py-4 whitespace-nowrap">
                {getValidityBadge(sample.validity || 'N/A')}
              </td>
              <td className="py-4 whitespace-nowrap">
                {getOriginBadge(sample.trusted)}
              </td>
              <td className="py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(sample.created_on)}
              </td>
              <td className="py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex flex-col gap-1">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(sample)}
                      className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center transition-colors"
                      title="Editar"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}

                  <hr className="h-px w-6 color-[#F1F1F1] my-1" />

                  {onDelete && (
                    <button
                      onClick={() => onDelete(sample)}
                      className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition-colors"
                      title="Excluir"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {samples.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma amostra encontrada</p>
        </div>
      )}
    </div>
  )
}
