'use client'

import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import '../../i18n/config'
import { type User } from 'firebase/auth'
import { getDoc, doc, writeBatch } from 'firebase/firestore'
import Papa from 'papaparse'
import { ExportToCsv } from 'export-to-csv'

import { auth, db } from '@services/firebase/config'

import {
  type Sample,
  type UserData,
  type ErrorMessages,
  validateImportedEntry,
} from '../../old_components/utils'
import { MdInfo } from 'react-icons/md'
import HoverIcon from '@components/ui/HoverIcon'

const AddCSVSample = () => {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)

  const [userData, setUserData] = useState(null as UserData | null)

  const [errorSamples, setErrorSamples] = useState([] as Sample[])
  const [errorTexts, setErrorTexts] = useState([] as string[])
  const [samples, setSample] = useState<Sample[] | null>(null)
  const errorSampleRef = useRef({})
  errorSampleRef.current = errorSamples

  const { t } = useTranslation()

  const errorMessages: ErrorMessages = {
    originValueError: t('originValueError'),
    originValueRequired: t('originValueRequired'),
    latLonRequired: t('latLonRequired'),
    shouldBeWithinTheRange: t('shouldBeWithinTheRange'),
    and: t('and'),
    isRequired: t('isRequired'),
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])

      onFileChanged(e)
    }
  }

  const handleUpload = () => {
    if (!file || !samples || samples.length <= 0)
      return alert('Sem dados para realizar ação!')

    const batch = writeBatch(db)
    samples.forEach((sample: Sample) => {
      if (!sample.trusted) return
      const docRef = doc(db, sample.trusted! + '_samples', sample.code_lab)
      const completed =
        sample.d18O_cel.length > 0 ||
        sample.d18O_wood.length > 0 ||
        sample.d15N_wood.length > 0 ||
        sample.n_wood.length > 0 ||
        sample.d13C_wood.length > 0 ||
        sample.c_wood.length > 0 ||
        sample.c_cel.length > 0 ||
        sample.d13C_cel.length > 0

      let payload = {
        ...sample,
        status: completed ? 'concluded' : 'in_progress',
      }

      batch.set(docRef, payload)
    })

    batch
      .commit()
      .then(async (data) => {
        console.log(data)
        alert(`Sucesso!`)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const handleDeleteCSV = () => {
    setFile(null)
    setErrorSamples([])
    setErrorTexts([])
    setSample(null)

    const fileInput = document.getElementById('fileInput') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const csvOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: true,
  }

  function handleDownloadClick() {
    let errorSamples = errorSampleRef.current
    if (errorSamples) {
      // If there is no error data in the first row, the errors column won't be
      // picked up by the csvExporter and no errors will be exported. We need to
      // artifically add an empty errors string to the first row if there isn't
      // an error there already.
      if (!errorSamples[0].errors) {
        errorSamples[0].errors = ''
      }
      csvExporter.generateCsv(errorSamples)
    } else {
      alert(t('unableToDownlaodCsv'))
    }
    handleCloseBarClick()
  }

  function handleCloseBarClick() {
    const statusBarWrapper = document.getElementById('import-status-bar')
    if (statusBarWrapper && statusBarWrapper.hasChildNodes()) {
      statusBarWrapper.removeChild(statusBarWrapper.firstChild!)
    }
    return
  }

  async function getCurrentUserData(user: User) {
    let currentUserData = userData
    if (!currentUserData) {
      const userDocRef = doc(db, 'users', user.uid)
      const docRef = await getDoc(userDocRef)
      if (docRef.exists()) {
        const docData = docRef.data()
        if (docData.org) {
          currentUserData = docData as UserData
          setUserData(currentUserData)
        }
      }
    }
    return currentUserData
  }

  function onFileChanged(event: any) {
    if (event.target.files.length === 0) return

    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const user = auth.currentUser

        if (!user) {
          alert('Usuário não autenticado!')
          return
        }

        let currentUserData = userData

        if (!currentUserData) {
          currentUserData = await getCurrentUserData(user)
        }

        if (!user || !currentUserData) {
          alert('Usuário não autenticado!')
          return
        }

        const rowsArray = []
        const csvValuesArray = []

        results.data.map((d) => {
          rowsArray.push(Object.keys(d))
          csvValuesArray.push(Object.values(d))
        })

        const codeList = {}
        let foundErrors = false
        let errorsArray: any = []
        let row = 1

        for (const data of results.data) {
          const errors = validateImportedEntry(data as Sample, errorMessages)

          if (errors.length > 0) {
            data.errors = errors
            foundErrors = true
            errorsArray.push({ row: row, error: errors })
            row += 1
            continue
          }

          const code = data.Code ? data.Code : data.code

          if (code) {
            if (codeList[code]) {
              codeList[code].push(data)
            } else {
              codeList[code] = [data]
            }
          }

          row += 1
        }

        if (foundErrors) {
          errorsArray.forEach((item: any, index) => {
            setErrorTexts((prev) => [...prev, `row ${item.row}: ${item.error}`])
          })
          setErrorSamples(results.data as Sample[])
        }

        let samples = [] as Sample[]
        const date = new Date()

        const formattedDateString = date.toISOString()

        Object.keys(codeList).forEach((key: string) => {
          const sampleId = key
          const resultValues = codeList[key]
          const newSample = {
            points: codeList[resultValues[0].code],
            lat: parseFloat(resultValues[0].lat),
            lon: parseFloat(resultValues[0].lon),
            site: resultValues[0].site || '',
            state: resultValues[0].state || '',
            municipality: resultValues[0].municipality || '',
            trusted: resultValues[0].trusted,
            species: resultValues[0].species || '',
            created_by: user.uid,
            genus: resultValues[0].genus || '',
            family: resultValues[0].family || '',
            created_on: formattedDateString,
            createdAt: date,
            last_updated_by: currentUserData.name,
            org: currentUserData.org,
            org_name: currentUserData.org_name ? currentUserData.org_name : '',
            created_by_name: currentUserData.name,
            code_lab: sampleId,
            visibility: 'private',
            d18O_cel: codeList[resultValues[0].code]
              .filter((data) => data.d18O_cel)
              .map((data) => parseFloat(data.d18O_cel)),
            d18O_wood: codeList[resultValues[0].code]
              .filter((data) => data.d18O_wood)
              .map((data) => parseFloat(data.d18O_wood)),
            d15N_wood: codeList[resultValues[0].code]
              .filter((data) => data.d15N_wood)
              .map((data) => parseFloat(data.d15N_wood)),
            n_wood: codeList[resultValues[0].code]
              .filter((data) => data.n_wood)
              .map((data) => parseFloat(data.n_wood)),
            d13C_wood: codeList[resultValues[0].code]
              .filter((data) => data.d13C_wood)
              .map((data) => parseFloat(data.d13C_wood)),
            c_wood: codeList[resultValues[0].code]
              .filter((data) => data.c_wood)
              .map((data) => parseFloat(data.c_wood)),
            c_cel: codeList[resultValues[0].code]
              .filter((data) => data.c_cel)
              .map((data) => parseFloat(data.c_cel)),
            d13C_cel: codeList[resultValues[0].code]
              .filter((data) => data.d13C_cel)
              .map((data) => parseFloat(data.d13C_cel)),
          }
          samples.push(newSample)
        })

        setSample(samples)
      },
    })
  }

  const csvExporter = new ExportToCsv(csvOptions)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nova Amostra
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            As amostras padrão são inseridas no nosso modelo de planilha.
          </p>
          <a
            href="https://firebasestorage.googleapis.com/v0/b/river-sky-386919.appspot.com/o/planilha_exemplo.csv?alt=media&token=46e4c9eb-790b-459b-acd1-037385bfad86"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#006E2C] font-medium hover:text-[#006E2C] transition-colors underline"
          >
            Baixe ele aqui agora mesmo.
          </a>
        </div>
        {/* Drag and Drop Area */}
        <div
          className={`w-full px-20 py-32 border-2 border-dashed rounded-lg bg-white text-center transition-all mb-8 ${
            dragging ? 'border-[#006E2C] bg-green-50' : 'border-[#006E2C]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="hidden"
            id="fileInput"
            accept=".csv"
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" className="cursor-pointer block">
            <p className="text-gray-500 text-lg">
              Arraste e solte ou clique aqui para adicionar uma amostra.
            </p>
          </label>
          {file && (
            <p className="mt-4 text-green-600 font-medium">📄 {file.name}</p>
          )}
        </div>

        {/* Import Button */}
        <button
          disabled={!file || (samples?.length ?? 0) == 0}
          onClick={handleUpload}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-4 px-8 rounded-full text-lg transition-colors shadow-lg"
        >
          🔒 Importar amostra
        </button>

        {/* Status Messages */}
        {samples && samples.length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status da Importação
            </h3>
            <p className="text-green-600 mb-2">
              ✅ {samples.length} amostras processadas com sucesso
            </p>
            {errorSamples.length > 0 && (
              <p className="text-red-600">
                ❌ {errorSamples.length} amostras com erro
              </p>
            )}
          </div>
        )}

        {/* Remove CSV Button */}
        {file && (
          <div className="mt-6">
            <button
              onClick={handleDeleteCSV}
              className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Remover arquivo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddCSVSample
