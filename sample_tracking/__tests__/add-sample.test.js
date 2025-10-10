import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddSample from '../src/pages/add-sample/page'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import { useTranslation } from 'react-i18next'

const mockSamplesTableFn = jest.fn()

// Mock Firebase before other imports
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  setDoc: jest.fn(),
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
}))

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  isSupported: jest.fn(() => Promise.resolve(false)),
}))

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}))

jest.mock('../src/services/firebase/config', () => ({
  db: {},
  auth: {},
  app: {},
}))
jest.mock('next/navigation', () => {
  return {
    useSearchParams: jest.fn(() => {
      return {
        get: jest.fn(),
      }
    }),
    useRouter: jest.fn(),
  }
})

jest.mock('../src/hooks/useFirebaseSamples', () => ({
  useUserData: jest.fn(() => ({
    data: {
      role: 'member',
      org: '12345',
      user_id: '12345',
    },
    loading: false,
    error: null,
  })),
}))

jest.mock('../src/old_components/utils', () => {
  return {
    getRanHex: jest.fn(() => {
      return '12345'
    }),
    initializeAppIfNecessary: jest.fn(() => {
      return 'test'
    }),
    hideNavBar: jest.fn(() => {
      return 'test'
    }),
    hideTopBar: jest.fn(() => {
      return 'test'
    }),
    getPointsArrayFromSampleResults: jest.fn(() => {
      return ['1', '2']
    }),
  }
})

jest.mock('firebase/auth', () => {
  return {
    getAuth: jest.fn(() => {
      return {
        currentUser: {
          email: 'example@gmail.com',
          uid: 1,
          emailVerified: true,
        },
      }
    }),
    onAuthStateChanged: jest.fn(() => {
      return 'test'
    }),
  }
})

jest.mock('../src/old_components/Sample/AddNewSample', () => (props) => {
  mockSamplesTableFn(props)
  return <mock-childComponent />
})

jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: jest.fn(() => [
    { uid: '12345', email: 'test@example.com' },
    false,
    null,
  ]),
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    query: {},
  })),
}))
jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    }
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}))

describe('Samples', () => {
  it('sets up SampleDataInput', async () => {
    act(() => {
      render(<AddSample />)
    })
    await waitFor(() => expect(mockSamplesTableFn).toHaveBeenCalledTimes(1))
    const onActionButtonClick =
      mockSamplesTableFn.mock.calls[0][0].onActionButtonClick
    const onStateUpdate = mockSamplesTableFn.mock.calls[0][0].onStateUpdate
    const newFormState = {
      d18O_wood: ['12', '13'],
      species: 'testSpecies',
    }
    act(() => {
      onActionButtonClick('12345', newFormState)
    })
    await waitFor(() => expect(setSample).toHaveBeenCalledTimes(1))
    const sampleCreated = setSample.mock.calls[0][2]
    expect(sampleCreated.created_by).toBe(1)
    expect(sampleCreated.code_lab).toBe('12345')
    expect(sampleCreated.d18O_wood).toStrictEqual([12, 13])
    expect(sampleCreated.points.length).toStrictEqual(2)
  })
})
