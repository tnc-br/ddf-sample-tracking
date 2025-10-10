import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Edit from '../src/pages/edit/edit'
import '@testing-library/jest-dom'
import { updateDoc } from 'firebase/firestore'
import { act } from 'react-dom/test-utils'
import { useTranslation } from 'react-i18next'

const mockSamplesTableFn = jest.fn()
jest.mock('react-i18next')
// firebase_utils mock removed
jest.mock('firebase/firestore', () => {
  return {
    getFirestore: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(() => {
      return Promise.resolve('test')
    }),
    doc: jest.fn(),
  }
})

jest.mock('react-firebase-hooks/firestore', () => ({
  useDocument: jest.fn(() => [
    { data: () => ({ role: 'member', org: '12345', user_id: '12345' }) },
    false,
    null,
  ]),
}))

jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: jest.fn(() => [
    { uid: '12345', displayName: 'Test name', email: 'example@gmail.com' },
    false,
    null,
  ]),
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: { id: '12345', trusted: 'trusted' },
    push: jest.fn(),
  })),
}))

jest.mock('../src/old_components/utils', () => ({
  getPointsArrayFromSampleResults: jest.fn(() => []),
}))

jest.mock('../src/services/firebase/config', () => ({
  auth: {
    currentUser: {
      email: 'example@gmail.com',
      uid: '12345',
      displayName: 'Test name',
      photoURL: 'test-photo.jpg',
    },
  },
  db: {},
}))

jest.mock('../src/old_components/Sample/AddNewSample', () => (props) => {
  mockSamplesTableFn(props)
  return <mock-childComponent />
})

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
      render(<Edit />)
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
    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1))
    const sampleCreated = updateDoc.mock.calls[0][1]
    expect(sampleCreated.last_updated_by).toBe('Test name')
    expect(sampleCreated.species).toBe('testSpecies')
    expect(sampleCreated.d18O_wood).toStrictEqual([12, 13])
  })
})
