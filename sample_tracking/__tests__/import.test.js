

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ImportSamples from '../app/import-samples';
import '@testing-library/jest-dom'
import { updateDoc } from "firebase/firestore";
import { act } from 'react-dom/test-utils';
import { useTranslation } from 'react-i18next';
import Papa from 'papaparse';

jest.mock('react-i18next');
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


const mockParse = jest.fn((file, mockParse) => {
    mockParse;
});


jest.mock('papaparse', () => {
    return {
        parse: (file, options) => {
            mockParse(file, options)
        },
    }
})


const samples = {
    data: [
        {
            Code: "test1",
            lat: "1",
            lon: "1",
            d18O_wood: 24.94,
            trusted: "trusted"
        },
        {
            Code: "test1",
            lat: "1",
            lon: "1",
            d18O_wood: 25.94,
            trusted: "trusted"
        },
        {
            Code: "test2",
            lat: "4",
            lon: "4",
            trusted: "unknown"
        },
        {
            Code: "test2",
            lat: "4",
            lon: "4",
            trusted: "unknown"
        }
    ]
}

    const batchSet = jest.fn();
    const batchCommit = jest.fn(() => Promise.resolve('test'));
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
                            org_name: 'Test org'
                        }
                    })
                })
            }),
            getFirestore: jest.fn(),
            setDoc: jest.fn(),
            doc: jest.fn(),
            collection: jest.fn((db, collection) => {
                return collection;
            }),
            writeBatch: jest.fn((docRef) => {
                return {
                    set: batchSet,
                    commit: batchCommit,
                }
            }),
        }
    })

describe('Import', () => {

    it('uploads data correctly', async () => {
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
                validateImportedEntry: jest.fn(() => {
                    return [];
                })
            }
        });
        const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
        act(() => {
            render(<ImportSamples />)
        });
        const uploader = document.getElementById('fileInput');
        expect(uploader).toBeTruthy();

        await waitFor(() =>
            fireEvent.change(uploader, {
                target: { files: [file] },
            })
        );

        expect(mockParse).toHaveBeenCalledTimes(1)
        const completeFunction = mockParse.mock.calls[0][1].complete;
        act(() => {
            completeFunction(samples);
        })
        await waitFor(() => expect(batchSet).toHaveBeenCalledTimes(2));
        console.log("done calling first round")
        expect(batchCommit).toHaveBeenCalledTimes(1);
        expect(batchSet.mock.calls[0][1].points.length).toBe(2);
        expect(batchSet.mock.calls[0][1].lat).toBe(1);
        expect(batchSet.mock.calls[0][1].created_by_name).toBe('Test Name');
        expect(batchSet.mock.calls[0][1].org_name).toBe('Test org');
        expect(batchSet.mock.calls[0][1].status).toBe('concluded');
        expect(batchSet.mock.calls[0][1].trusted).toBe('trusted');

        expect(batchSet.mock.calls[1][1].points.length).toBe(2);
        expect(batchSet.mock.calls[1][1].lat).toBe(4);
        expect(batchSet.mock.calls[1][1].created_by_name).toBe('Test Name');
        expect(batchSet.mock.calls[1][1].org_name).toBe('Test org');
        expect(batchSet.mock.calls[1][1].status).toBe('in_progress');
        expect(batchSet.mock.calls[1][1].trusted).toBe('unknown');
    });

    it('doesnt upload incorrect data', async () => {
        const badSamples = {
            data: [
                {
                    Code: "test4",
                    d18O_wood: 24.94,
                    trusted: "trusted"
                },
                {
                    Code: "test4",
                    d18O_wood: 25.94,
                    trusted: "trusted"
                },
                {
                    Code: "test5",
                    lat: 4,
                    lon: 4,
                    trusted: "unknown"
                },
                {
                    Code: "test5",
                    lat: 4,
                    lon: 4,
                    trusted: "unknown"
                }
            ]
        }

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
                validateImportedEntry: jest.fn(() => {
                    return [];
                })
            }
        });
        const file = new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" });
        act(() => {
            render(<ImportSamples />)
        });
        const uploader = document.getElementById('fileInput');
        expect(uploader).toBeTruthy();

        await waitFor(() =>
            fireEvent.change(uploader, {
                target: { files: [file] },
            })
        );

        expect(mockParse).toHaveBeenCalledTimes(2)
        const completeFunction = mockParse.mock.calls[0][1].complete;
        act(() => {
            completeFunction(badSamples);
        })
        await waitFor(() => expect(batchSet).toHaveBeenCalledTimes(2));
        expect(batchCommit).toHaveBeenCalledTimes(1);
    });
});