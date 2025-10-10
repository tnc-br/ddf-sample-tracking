import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AllUsers from '../src/pages/all-users/page'
import '@testing-library/jest-dom'
import { getDocs } from 'firebase/firestore'
import { act } from 'react-dom/test-utils'

const userDataDoc = {
  data: jest.fn(() => {
    return {
      name: 'test name',
      email: 'testname@gmail.com',
      org: 'testorg',
    }
  }),
}

const orgDataDoc = {
  data: jest.fn(() => {
    return {
      name: 'Google org',
      admin: 'test admin',
    }
  }),
}

jest.mock('react-i18next')
// firebase_utils mock removed as we're using hooks now
jest.mock('next/navigation', () => {
  return {
    useSearchParams: jest.fn(() => {
      return {
        get: jest.fn(),
      }
    }),
    useRouter: jest.fn(() => {
      return {
        push: jest.fn(),
      }
    }),
  }
})

// Remove firebase_utils mock - using direct Firebase calls now

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
    onAuthStateChanged: jest.fn((auth, callback) => {
      callback({
        uid: '12345',
      })
      return 'test'
    }),
  }
})

jest.mock('firebase/firestore', () => {
  return {
    getDoc: jest.fn((docRef) => {
      return Promise.resolve({
        exists: jest.fn(() => true),
        data: jest.fn(() => {
          return {
            role: 'site_admin',
            org: '12345',
            name: 'Test Name',
          }
        }),
      })
    }),
    getDocs: jest.fn((request) => {
      if (request === 'users') {
        return Promise.resolve([userDataDoc, userDataDoc])
      } else {
        return Promise.resolve([orgDataDoc])
      }
    }),
    getFirestore: jest.fn(),
    setDoc: jest.fn(),
    doc: jest.fn(),
    collection: jest.fn((db, collection) => {
      return collection
    }),
  }
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

const mockSamplesTableFn = jest.fn()

jest.mock('material-react-table', () => ({
  MaterialReactTable: (props) => {
    mockSamplesTableFn(props)
    return <mock-table data-testid="modal" />
  },
}))

describe('All users', () => {
  it('Creates two available tabs for site admin with correct number', async () => {
    act(() => {
      render(<AllUsers />)
    })
    await waitFor(() => expect(getDocs).toHaveBeenCalledTimes(2))
    const usersTitle = document.getElementById('individuals-title')
    const numUsers = usersTitle.textContent.charAt(
      usersTitle.textContent.length - 2,
    )
    expect(numUsers).toBe('2')
    const orgsTitle = document.getElementById('organizations-title')
    const numOrts = orgsTitle.textContent.charAt(
      orgsTitle.textContent.length - 2,
    )
    expect(numOrts).toBe('1')
  })
})
