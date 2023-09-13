

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SampleDataInput from '../app/sample_data_input';
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils';

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


describe('Samples', () => {

    it('sets up SampleDataInput, validates input on next click, updates dom on next click, calls action function on submit', async () => {
        const actionButtonClick = jest.fn();
        const baseState = {
            visibility: 'private',
            trusted: 'unknown'
        }
        act(() => {
            render(<SampleDataInput
                onActionButtonClick={(id, formSampleData) => actionButtonClick(id, formSampleData)}
                baseState={baseState}
                actionButtonTitle='Test button'
                sampleId='12345'
                isCompletedSample={true} 
                />)
        });
        console.log("here")
        const infoTab = document.getElementById('info-tab');
        expect(infoTab).toBeTruthy();
        const nextButton = document.getElementById('next-button-wrapper');
        expect(nextButton).toBeTruthy();
        fireEvent(
            nextButton,
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
            }),
          )

          expect(document.getElementById('info-tab')).toBeTruthy();
          const sampleName = document.getElementById('sampleName');
          fireEvent.change(sampleName, { target: { value: "testName"}});
          fireEvent(
            nextButton,
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
            }),
          )
        //   expect(document.getElementById('sample-measurements')).toBeTruthy();
          expect(document.getElementById('info-tab')).toBeFalsy();
          fireEvent(
            nextButton,
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
            }),
          )
          expect(document.getElementById('review-and-submit')).toBeTruthy();
          expect(document.getElementById('sample-measurements')).toBeNull();
          const actionButton = document.getElementById('action-button');
          expect(actionButton).toBeTruthy();
          fireEvent(
            actionButton,
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
            }),
          )
          expect(actionButtonClick).toHaveBeenCalledTimes(1);

    });
});