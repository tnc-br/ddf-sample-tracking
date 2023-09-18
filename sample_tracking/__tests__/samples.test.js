import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Samples from '../app/samples/page';
import '@testing-library/jest-dom'
import { getSamplesFromCollection } from '../app/firebase_utils';
import { act } from 'react-dom/test-utils';


jest.mock('firebase/auth');
// jest.mock('firebase/firestore');
jest.mock('next/navigation');
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
        initializeAppIfNecessary: jest.fn()
    }

});

const mockSamplesTableFn = jest.fn();
jest.mock('../app/samples_table', () => (props) => {
    mockSamplesTableFn(props);
    return <mock-childComponent />;
  });


 describe('Samples', () => {

    it('calls SamplesTable for incomplete and complete samples with correct data', async () => {

        act(() => {
            render(<Samples />)
        });
        await waitFor(() => expect(getSamplesFromCollection).toHaveBeenCalledTimes(3));
        expect(getSamplesFromCollection).toHaveBeenCalledTimes(3)
        expect(mockSamplesTableFn.mock.calls[1][0].samplesData[0].status).toBe('concluded')
        expect(mockSamplesTableFn.mock.calls[1][0].samplesData[1].status).toBe('concluded')
        expect(mockSamplesTableFn.mock.calls[1][0].samplesData[2].status).toBe('concluded')
        expect(mockSamplesTableFn.mock.calls[0][0].samplesData[0].status).toBe('incomplete')
        expect(mockSamplesTableFn.mock.calls[0][0].samplesData[1].status).toBe('incomplete')
        expect(mockSamplesTableFn.mock.calls[0][0].samplesData[2].status).toBe('incomplete')
        expect(mockSamplesTableFn.mock.calls[0][0].samplesData[2].status).toBe('incomplete')
        expect(mockSamplesTableFn.mock.calls[0][0].samplesData[2].trusted).toBe('unknown')
        expect(mockSamplesTableFn.mock.calls[0][0].samplesData[1].trusted).toBe('untrusted')
        expect(mockSamplesTableFn.mock.calls[0][0].samplesData[0].trusted).toBe('trusted')
        expect(mockSamplesTableFn.mock.calls[1][0].samplesData[2].trusted).toBe('unknown')
        expect(mockSamplesTableFn.mock.calls[1][0].samplesData[1].trusted).toBe('untrusted')
        expect(mockSamplesTableFn.mock.calls[1][0].samplesData[0].trusted).toBe('trusted')
        expect(mockSamplesTableFn.mock.calls[0][0].canDeleteSamples).toBe(false);
        expect(mockSamplesTableFn.mock.calls[0][0].showValidity).toBe(false);
        expect(mockSamplesTableFn.mock.calls[0][0].allowExport).toBe(false);
        expect(mockSamplesTableFn.mock.calls[1][0].canDeleteSamples).toBe(false);
        expect(mockSamplesTableFn.mock.calls[1][0].showValidity).toBe(true);
        expect(mockSamplesTableFn.mock.calls[1][0].allowExport).toBe(true);
    });
});