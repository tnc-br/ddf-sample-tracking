import { initializeApp, getApp } from 'firebase/app'
import { type User } from 'firebase/auth'
import {
  getDoc,
  doc,
  type Firestore,
  type DocumentReference,
} from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

export type UserData = {
  name: string
  org: string
  org_name: string
  role: string
  user_id: string
  email: string
  date_added: string
  photoUrl: string
}

export enum ValidityStatus {
  Possible = 'possibleLabel', // Indicates that the sample is possibly from the specified location.
  NotLikely = 'notLikelyLabel', // Indicates that the sample is unlikely to be from the specified location.
  Trusted = 'trustedLabel', // Indicates that the sample is trusted to be from the specified location.
  Undetermined = 'undeterminedLabel', // Default value for untrusted sample if the sample's validity has not been determined (e.g. if the cloud function failed to run)
}

export type Sample = {
  code_lab: string
  visibility: string
  sample_name: string
  species: string
  site: string
  state: string
  lat: string
  lon: string
  date_of_harvest: string
  created_by: string
  current_step: string
  status: string
  trusted: string
  created_on: string
  last_updated_by: string
  org: string
  org_name: string
  validity?: string
  header: string
  doc_id: string
  updated_state: boolean
  collected_by: string
  oxygen: string[]
  nitrogen: string[]
  n_wood: string[]
  carbon: string[]
  c_wood: string[]
  c_cel: string[]
  d13C_cel: string[]
  d18O_cel: string[]
  city: string
  supplier: string
  measureing_height: string
  sample_type: string
  diameter: string
  observations: string
  created_by_name: string
  last_updated_by_photo: string
  measurements: {}
  points?: []
  request: string
  validity_details?: ValidityDetails
}

export type ValidityDetails = {
  p_value: number
  p_value_threshold: number
  d18O_cel_sample_mean: number
  d18O_cel_sample_variance: number
  d18O_cel_reference_mean: number
  d18O_cel_reference_variance: number
  reference_oxygen_isoscape_creation_date: string
  reference_oxygen_isoscape_name: string
  reference_oxygen_isoscape_precision: string
  reference_oxygen_isoscape_recall: string
}

export type ErrorMessages = {
  originValueError: string
  originValueRequired: string
  latLonRequired: string
  shouldBeWithinTheRange: string
  and: string
  isRequired: string
}

export interface NestedSchemas {
  [key: string]: NestedSchemas
}

const env = !!process && process.env.NODE_ENV === 'development'

export const SampleErrorType = {
  IS_REQUIRED: 'isRequired',
  IS_OUT_OF_RANGE: 'isOutOfRange',
}

export type SampleError = {
  errorType: string // SampleErrorType,
  fieldWithError: string
  errorString: string
}

const resultRanges = {
  d18O_cel: {
    min: 20,
    max: 32,
  },
  d18O_wood: {
    min: 20,
    max: 32,
  },
  d15N_wood: {
    min: -5,
    max: 15,
  },
  n_wood: {
    min: 0,
    max: 1,
  },
  d13C_wood: {
    min: -38,
    max: 20,
  },
  c_wood: {
    min: 40,
    max: 60,
  },
  d13C_cel: {
    min: -35,
    max: -20,
  },
  c_cel: {
    min: 40,
    max: 60,
  },
  lat: {
    min: -90,
    max: 90,
  },
  lon: {
    min: -180,
    max: 180,
  },
}

export const resultValues = [
  'd18O_wood',
  'd15N_wood',
  'n_wood',
  'd13C_wood',
  'c_wood',
  'c_cel',
  'd13C_cel',
  'd18O_cel',
]

export function getRanHex(size: number): string {
  let result = []
  let hexRef = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
  ]

  for (let n = 0; n < size; n++) {
    result.push(hexRef[Math.floor(Math.random() * 16)])
  }
  return result.join('')
}

async function initializeAppIfNecessary() {
  try {
    getApp()
  } catch (any) {
    const app = await initializeApp({
      apiKey: process.env.NEXT_PUBLIC_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_APP_ID,
    })
    isSupported().then((isSupported: boolean) => {
      if (isSupported && isProd()) {
        const analytics = getAnalytics(app)
      }
    })
  }
}

export function showNavBar() {
  const navBar = document.getElementById('nav-wrapper')
  if (navBar) {
    navBar.style.display = 'block'
  }
}

export function showTopBar() {
  const navBar = document.getElementById('top-bar-wrapper')
  if (navBar) {
    navBar.style.display = 'block'
  }
}

export function hideTopBar() {
  const navBar = document.getElementById('top-bar-wrapper')
  if (navBar) {
    navBar.style.display = 'none'
  }
}

export function hideNavBar() {
  const navBar = document.getElementById('nav-wrapper')
  if (navBar) {
    navBar.style.display = 'none'
  }
}

export function verifyLatLonFormat(input: string) {
  return input.charAt(2) === '.' && input.length > 3
}

export function confirmUserLoggedIn(
  user: User | null,
  db: Firestore,
  router: any,
  requredRoles?: string[],
): UserData {
  if (!user) {
    router.push('/login')
  } else {
    const userDocRef = doc(db, 'users', user.uid)
    getDoc(userDocRef).then((docRef) => {
      if (docRef.exists()) {
        const docData = docRef.data()
        if (!docData.role) {
          router.push('/login')
        } else {
          if (requredRoles) {
            if (requredRoles.includes(docData.org)) {
              return docData as UserData
            } else {
              router.push('/login')
            }
          }
          return docData as UserData
        }
      } else {
        return {
          name: user.displayName ? user.displayName : '',
        } as UserData
      }
    })
  }
  // This code will never run because the user will either be navigated to the login screen or the user data will be returned.
  return {} as UserData
}

export function getDocRefForTrustedValue(
  trusted: string,
  db: Firestore,
  sampleId: string,
): DocumentReference {
  let docRef = doc(db, 'trusted_samples', sampleId!)
  if (trusted === 'untrusted') {
    docRef = doc(db, 'untrusted_samples', sampleId!)
  } else if (trusted === 'unknown') {
    docRef = doc(db, 'unknown_samples', sampleId!)
  }
  return docRef
}

export function validateImportedEntry(
  data: Sample,
  errorMessages: ErrorMessages,
): string {
  let errorString = ''
  const errors = validateSample(data, [1, 2], errorMessages)
  errors.forEach((error: SampleError) => {
    errorString += error.errorString + ' ; '
  })
  return errorString
}

export function validateSample(
  data: Sample,
  categories: number[],
  errorMessages: ErrorMessages,
): SampleError[] {
  let errors: SampleError[] = []
  const headers = Object.keys(data)

  if (categories.includes(2)) {
    headers.forEach((header: string) => {
      if (!Object.keys(resultRanges).includes(header)) return
      const value = parseFloat(data[header])
      if (
        value < resultRanges[header].min ||
        value > resultRanges[header].max
      ) {
        errors.push({
          errorType: SampleErrorType.IS_OUT_OF_RANGE,
          fieldWithError: header,
          errorString: `${header} ${errorMessages.shouldBeWithinTheRange} ${resultRanges[header].min} ${errorMessages.and} ${resultRanges[header].max}`,
        })
      }
    })
  }

  if (categories.length > 1) {
    // Only imported samples are testing more than one category at a time.
    if (!headers.includes('code')) {
      errors.push({
        errorType: SampleErrorType.IS_REQUIRED,
        fieldWithError: 'code',
        errorString: `code ${errorMessages.isRequired}`,
      })
    }
  }
  if (categories.includes(1)) {
    if (!headers.includes('trusted')) {
      errors.push({
        errorType: SampleErrorType.IS_REQUIRED,
        fieldWithError: 'origin',
        errorString: `trusted ${errorMessages.isRequired}`,
      })
    } else {
      if (!['trusted', 'unknown', 'untrusted'].includes(data.trusted)) {
        errors.push({
          errorType: SampleErrorType.IS_OUT_OF_RANGE,
          fieldWithError: 'origin',
          errorString: errorMessages.originValueError,
        })
      }
    }
    if (headers.includes('trusted') && data.trusted !== 'unknown') {
      if (!headers.includes('lat')) {
        errors.push({
          errorType: SampleErrorType.IS_REQUIRED,
          fieldWithError: 'lat',
          errorString: `lat ${errorMessages.isRequired}`,
        })
      }
      if (!headers.includes('lon')) {
        errors.push({
          errorType: SampleErrorType.IS_REQUIRED,
          fieldWithError: 'lon',
          errorString: `lon ${errorMessages.isRequired}`,
        })
      }
      const lat = data['lat']
      const lon = data['lon']
      if (lat && (lat < -90 || lat > 90)) {
        errors.push({
          errorType: SampleErrorType.IS_OUT_OF_RANGE,
          fieldWithError: 'lat',
          errorString: `lat ${errorMessages.shouldBeWithinTheRange} ${resultRanges['lat'].min} ${errorMessages.and} ${resultRanges['lat'].max}`,
        })
      }
      if (lon && (lon < -180 || lon > 180)) {
        errors.push({
          errorType: SampleErrorType.IS_OUT_OF_RANGE,
          fieldWithError: 'lon',
          errorString: `lon ${errorMessages.shouldBeWithinTheRange} ${resultRanges['lon'].min} ${errorMessages.and} ${resultRanges['lon'].max}`,
        })
      }
    }
  }

  return errors
}

export function getMaxLength(formSampleData: Sample): number {
  let maxValue = 0
  resultValues.forEach((resultValue: string) => {
    if (formSampleData[resultValue]) {
      if (formSampleData[resultValue].length > maxValue)
        maxValue = formSampleData[resultValue].length
    }
  })
  return maxValue
}

export function getPointsArrayFromSampleResults(
  formSampleData: Sample,
): Sample[] {
  const maxValue = getMaxLength(formSampleData)
  let pointsArray: Sample[] = []
  for (let i = 0; i < maxValue; i++) {
    const currPoint = {} as Sample
    resultValues.forEach((value: string) => {
      if (formSampleData[value] && formSampleData[value][i]) {
        currPoint[value] = formSampleData[value][i]
      }
    })
    pointsArray.push(currPoint)
  }
  return pointsArray
}

export function isProd(): boolean {
  return !env
}
