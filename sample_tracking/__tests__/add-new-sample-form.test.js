import { render, fireEvent, screen } from '@testing-library/react'
import AddNewSample from '../src/old_components/Sample/AddNewSample'
import '@testing-library/jest-dom'

// Mock Firebase before other imports
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
}))

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  isSupported: jest.fn(() => Promise.resolve(false)),
}))

jest.mock('../src/services/firebase/config', () => ({
  db: {},
  auth: {},
  app: {},
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    query: {},
  })),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str) => str,
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}))

jest.mock('../src/hooks/useFirebaseSamples', () => ({
  useUserData: jest.fn(() => ({
    data: {
      role: 'member',
      org: '12345',
      user_id: '12345',
      name: 'Test User',
      org_name: 'Test Org',
    },
    loading: false,
    error: null,
  })),
}))

jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: jest.fn(() => [
    { uid: '12345', email: 'test@example.com' },
    false,
    null,
  ]),
}))

describe('AddNewSample form (origin verification flow)', () => {
  const defaultValue = {
    visibility: 'private',
    collected_by: 'supplier',
    status: 'concluded',
    trusted: 'untrusted', // add sample -> origin verification
  }

  it('permite digitar no campo sample name', () => {
    const { container } = render(
      <AddNewSample
        defaultValue={defaultValue}
        onActionButtonClick={jest.fn()}
        actionButtonTitle="Create sample"
        isNewSampleForm={true}
        sampleId="abc123"
      />,
    )

    const input = container.querySelector('input[name="sample_name"]')
    expect(input).not.toBeNull()
    expect(input).not.toBeDisabled()

    fireEvent.change(input, { target: { value: 'Minha Amostra' } })
    expect(input).toHaveValue('Minha Amostra')
  })

  it('permite digitar no sample name pelo fluxo completo da pagina add-sample', () => {
    // Full page flow as reported in tnc-br/TimberID-Bugs#133:
    // add sample -> origin verification -> type in "sample name"
    jest.requireMock('next/router').useRouter.mockReturnValue({
      push: jest.fn(),
      query: { status: 'originVerification' },
    })
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AddSample = require('../src/pages/add-sample/page').default

    const { container } = render(<AddSample />)

    const input = container.querySelector('input[name="sample_name"]')
    expect(input).not.toBeNull()
    expect(input).not.toBeDisabled()

    fireEvent.change(input, { target: { value: 'Amostra Origem' } })
    expect(input).toHaveValue('Amostra Origem')
  })
})
