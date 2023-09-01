

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Profile from '../app/profile/page';
import '@testing-library/jest-dom'
import { getDocs, getDoc, deleteDoc } from "firebase/firestore";
import { act } from 'react-dom/test-utils';
import { deleteUser } from "firebase/auth";


const userDataDoc = {
    data: jest.fn(() => {
        return {
            name: 'test name',
            email: 'testname@gmail.com',
            org: 'testorg'
        }
    })
}

const orgDataDoc = {
    data: jest.fn(() => {
        return {
            name: 'Google org',
            admin: 'test admin'
        }
    })
}

jest.mock('react-i18next');
jest.mock('../app/firebase_utils');
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
        })
    }
});


jest.mock('../app/firebase_utils', () => {
    return {
        getSamplesFromCollection: jest.fn(() => {
            return [{ code_lab: 1, name: "testname", created_by: "Joshua", status: 'concluded' },
            { code_lab: 2, name: "nametest", created_by: "Auhsoj", status: 'incomplete' }];
        }),
        getUserData: jest.fn(() => {
            return {
                role: 'member',
                org: '12345',
                user_id: '12345',
            }
        }),
        setSample: jest.fn(() => {
            return "test";
        })
    }
});

jest.mock('../app/utils', () => {
    return {
        getSearchParam: jest.fn(() => {
            return 'completed'
        }),
        getRanHex: jest.fn(() => {
            return '12345';
        }),
        initializeAppIfNecessary: jest.fn(() => {
            return 'test';
        }),
        hideNavBar: jest.fn(() => {
            return 'test';
        }),
        hideTopBar: jest.fn(() => {
            return 'test';
        }),
    }
});

jest.mock('firebase/auth', () => {
    return {
        getAuth: jest.fn(() => {
            return {
                currentUser: {
                    email: 'example@gmail.com', uid: 1, emailVerified: true,
                }

            }
        }),
        onAuthStateChanged: jest.fn((auth, callback) => {
            callback({
                uid: '12345',
            })
            return "test";
        }),
        deleteUser: jest.fn((docRef) => {
            return Promise.resolve("deleted")
        })
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
                        user_id: '12345'
                    }
                })
            })
        }),
        deleteDoc: jest.fn(),
        getFirestore: jest.fn(),
        setDoc: jest.fn(),
        doc: jest.fn(),
        collection: jest.fn((db, collection) => {
            return collection;
        })
    }
})


jest.mock('react-i18next', () => ({
    // this mock makes sure any components using the translate hook can use it without a warning being shown
    useTranslation: () => {
        return {
            t: (str) => str,
            i18n: {
                changeLanguage: () => new Promise(() => { }),
            },
        };
    },
    initReactI18next: {
        type: '3rdParty',
        init: () => { },
    }
}));

const mockSamplesTableFn = jest.fn();

jest.mock("material-react-table", () => ({
    MaterialReactTable: (props) => {
        mockSamplesTableFn(props);
        return <mock-table data-testid="modal" />;
    },
}));

describe('Profile', () => {

    it('renders page correctly', async () => {
        act(() => {
            render(<Profile />)
        });
        await waitFor(() => expect(getDoc).toHaveBeenCalledTimes(1));
        const userName = document.getElementById('profile-name');
        expect(userName).toBeTruthy();
        expect(userName.textContent).toBe('Test Name');
        const deleteButton = document.getElementById('delete-button');
        expect(deleteButton).toBeTruthy();
    });

    it('deletes user correctly', async () => {
        const confirmMethod = jest.fn(() => true);
        global.confirm = confirmMethod;
        
        act(() => {
            render(<Profile />)
        });
        await waitFor(() => expect(getDoc).toHaveBeenCalledTimes(2));
        const deleteButton = document.getElementById('delete-button');
        expect(deleteButton).toBeTruthy();
        fireEvent(
            deleteButton,
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
            }),
          );
          expect(confirmMethod).toHaveBeenCalledTimes(1);
          expect(deleteUser).toHaveBeenCalledTimes(1);
          await waitFor(() => expect(deleteDoc).toHaveBeenCalledTimes(1));
    });
});