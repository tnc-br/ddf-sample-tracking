

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Edit from '../app/edit/page';
import '@testing-library/jest-dom'
import { updateDoc } from "firebase/firestore";
import { act } from 'react-dom/test-utils';
import { useTranslation } from 'react-i18next';


const mockSamplesTableFn = jest.fn();
jest.mock('react-i18next');
jest.mock('../app/firebase_utils');
jest.mock('firebase/firestore', () => {
    return {
        getFirestore: jest.fn(),
        setDoc: jest.fn(),
        updateDoc: jest.fn(() => {
            return Promise.resolve("test")
        }),
        doc: jest.fn(),
    }
    
});
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
                    email: 'example@gmail.com', uid: 1, emailVerified: true, displayName: "Test name"
                }

            }
        }),
        onAuthStateChanged: jest.fn(() => {
            return "test";
        })
    }
})


jest.mock('../app/sample_data_input', () => (props) => {
    mockSamplesTableFn(props);
    return <mock-childComponent />;
});


describe('Samples', () => {

    it('sets up SampleDataInput', async () => {
        const mockedSignIn = jest.mocked(useTranslation);
        mockedSignIn.mockResolvedValue(Promise.resolve("Test"));
        act(() => {
            render(<Edit />)
        });
        await waitFor(() => expect(mockSamplesTableFn).toHaveBeenCalledTimes(1));
        const onActionButtonClick = mockSamplesTableFn.mock.calls[0][0].onActionButtonClick;
        const onStateUpdate = mockSamplesTableFn.mock.calls[0][0].onStateUpdate;
        const newFormState = {
            d18O_wood: ['12','13'],
            species: 'testSpecies',
        }
        act(() => {
            onActionButtonClick("12345", newFormState);
        })
        await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
        const sampleCreated = updateDoc.mock.calls[0][1];
        expect(sampleCreated.last_updated_by).toBe("Test name");
        expect(sampleCreated.species).toBe('testSpecies')
        expect(sampleCreated.d18O_wood).toStrictEqual([12, 13])
    });
});