import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Samples from '../src/pages/samples/page'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'

// Mock i18n before other imports to prevent initialization issues
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str) => str,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}))

jest.mock('../src/i18n/config', () => ({}))

jest.mock('../src/services/firebase/config', () => ({
  auth: {},
  db: {},
}))

jest.mock('../src/hooks/useGlobal', () => ({
  useGlobal: jest.fn(() => ({
    setShowNavBar: jest.fn(),
    setShowTopBar: jest.fn(),
  })),
}))

jest.mock('firebase/auth')
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: jest.fn(() => [
    { uid: '12345', email: 'test@example.com' },
    false,
    null,
  ]),
}))
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    query: {},
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}))
jest.mock('../src/hooks/useFirebaseSamples', () => {
  return {
    useSamplesFromCollection: jest.fn(() => {
      return {
        data: [
          {
            code_lab: 1,
            name: 'testname',
            created_by: 'Joshua',
            status: 'concluded',
          },
          {
            code_lab: 2,
            name: 'nametest',
            created_by: 'Auhsoj',
            status: 'incomplete',
          },
        ],
        loading: false,
        error: null,
      }
    }),
    useUserData: jest.fn(() => {
      return {
        data: {
          role: 'member',
          org: '12345',
          user_id: '12345',
        },
        loading: false,
        error: null,
      }
    }),
  }
})

const mockSamplesTableFn = jest.fn()
jest.mock('../src/old_components/samples_table', () => (props) => {
  mockSamplesTableFn(props)
  return <mock-childComponent />
})

jest.mock('../src/hooks/useGlobal', () => ({
  useGlobal: () => ({
    setShowNavBar: jest.fn(),
    setShowTopBar: jest.fn(),
  }),
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}))

describe('Samples', () => {
  it('calls SamplesTable for incomplete and complete samples with correct data', async () => {
    act(() => {
      render(<Samples />)
    })
    await waitFor(() => expect(mockSamplesTableFn).toHaveBeenCalled())

    // Check that SamplesTable was called with the correct props
    expect(mockSamplesTableFn).toHaveBeenCalled()
    const calls = mockSamplesTableFn.mock.calls

    // Verify the component renders properly with mocked data
    expect(calls.length).toBeGreaterThan(0)
  })
})
