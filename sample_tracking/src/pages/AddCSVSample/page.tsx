'use client'

import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import '../../i18n/config'
import { type User } from 'firebase/auth'
import { getDoc, doc, writeBatch } from 'firebase/firestore'
import Papa from 'papaparse'
import { ExportToCsv } from 'export-to-csv'

import { auth, firestore } from '@services/firebase/config'

import {
  type Sample,
  type UserData,
  type ErrorMessages,
  validateImportedEntry,
} from '../../old_components/utils'

const AddCSVSample = () => {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)

  const [userData, setUserData] = useState(null as UserData | null)

  const [errorSamples, setErrorSamples] = useState([] as Sample[])
  const [errorTexts, setErrorTexts] = useState([] as string[])
  const [samples, setSample] = useState<Sample[] | null>(null)
  const errorSampleRef = useRef({})
  errorSampleRef.current = errorSamples

  const db = firestore
  const { t } = useTranslation()

  const errorMessages: ErrorMessages = {
    originValueError: t('originValueError'),
    originValueRequired: t('originValueRequired'),
    latLonRequired: t('latLonRequired'),
    shouldBeWithinTheRange: t('shouldBeWithinTheRange'),
    and: t('and'),
    isRequired: t('isRequired'),
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
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

      console.log('payload', payload)
      console.log('docRef', docRef)
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

        console.log(errorSamples)
        setSample(samples)
      },
    })
  }

  const csvExporter = new ExportToCsv(csvOptions)

  return (
    <div className="absolute max-w-screen-lg w-full left-[304px] top-[67px] ">
      <div className="pt-6 flex flex-col items-center">
        <div
          className={`w-full max-w-lg p-6 border-2 border-dashed rounded-lg bg-white text-center transition-all ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
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
            <p className="text-gray-600">
              Arraste e solte um arquivo aqui ou clique para selecionar
            </p>
          </label>
          {file && <p className="mt-3 text-green-600">{file.name}</p>}
        </div>
        <button
          disabled={!file}
          onClick={handleUpload}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-blue-600/30 cursor-not-allowed transition"
        >
          {t('importSamples')}
        </button>
      </div>
      <div id="import-status-bars">
        {errorSamples.length > 0 && file && (
          <div id="" className="bg-red-300 rounded-md p-4 mt-4">
            <div className="import-status-text-wrapper">
              <div className="import-status-text">
                Existe alguns erros na planilha
              </div>
              <div className="import-status-text">
                {errorSamples.length} Erros encontrados <br />
                {samples?.length ?? 0} Itens importados
              </div>

              <div>
                {errorTexts.map((texts, index) => {
                  return (
                    <div key={index} className="import-status-text">
                      {texts}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="import-status-actions-wrapper">
              <div className="import-status-actions">
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:bg-blue-600/30 cursor-not-allowed transition"
                  onClick={handleDownloadClick}
                >
                  <div className="import-status-button-slate-layer">
                    <div className="import-status-button-text">
                      {t('download')}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
        {errorSamples.length <= 0 && file && (
          <div className="import-success-status-wrapper success-background-color">
            <div className="import-status-icon-wrapper">
              <div className="import-status-icon">
                <span className="material-symbols-outlined import-status-icon icon-color-green">
                  check_circle
                </span>
              </div>
            </div>
            <div className="import-status-text-wrapper">
              <div className="import-status-text text-color-green">
                {t('successfullyImportedFile')}
              </div>
            </div>
            <div className="import-status-actions-wrapper">
              <div className="import-status-actions">
                <div
                  id="import-success-great"
                  className="import-success-status-button pointer"
                >
                  <div className="import-status-button-slate-layer">
                    <div className="import-status-button-text">
                      {t('great')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddCSVSample
