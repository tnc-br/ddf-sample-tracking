"use client";
import 'bootstrap/dist/css/bootstrap.css';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, deleteDoc, doc, collection } from "firebase/firestore";
import { useState, useMemo, useRef } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
// import Nav from '../nav';
import { MaterialReactTable, type MRT_ColumnDef, type MRT_TableInstance, type MRT_SortingState, type MRT_PaginationState } from 'material-react-table';
import { initializeAppIfNecessary } from './utils';

import { firebaseConfig } from './firebase_config';

import { useReactTable } from '@tanstack/react-table'

type Sample = {
    code_lab: string,
    visibility: string,
    sample_name: string,
    species: string,
    site: string,
    state: string,
    lat: string,
    lon: string,
    date_of_harvest: string,
    created_by: string,
    current_step: string,
    status: string,
    trusted: string,
    created_on: string,
    last_updated_by: string,
    org: string,
    validity: number,
    header: string,
    doc_id: string,
    updated_state: boolean,
}

interface SampleDataProps {
    samplesData: any,
    canDeleteSamples: boolean,
}

export default function SamplesTable(props: SampleDataProps) {

    const [sampleData, setSampleData] = useState(props.samplesData as Sample[]);
    // const [hasDeletedSample, setHasDeletedSample] = useState(false);

    const router = useRouter();
    const app = initializeAppIfNecessary();
    const db = getFirestore();

    const tableInstanceRef = useRef<MRT_TableInstance<Sample>>(null);

    if (!sampleHasBeenDeletedFromList() && sampleData.length !== props.samplesData.length) {
        setSampleData(props.samplesData);
    }

    function updateSampleData(newSampleData: Sample[]) {
        setSampleData(newSampleData);
    }

    const columns = useMemo<MRT_ColumnDef<Sample>[]>(
        () => [
            {
                accessorKey: 'code_lab',
                header: 'Internal code',
                size: 150,
                Cell: ({ cell, row, renderedCellValue }) => {
                    return (
                        <div id={row.original.trusted} onClick={onSampleClick} className="actions-button sample-link">
                            <span id={cell.getValue()}>{renderedCellValue}</span>
                        </div>
                    )
                },
            },
            {
                accessorKey: 'sample_name',
                header: 'Name',
                size: 150,

            },
            {
                accessorKey: 'status',
                header: 'Status',
                size: 200,
            },
            {
                accessorKey: 'trusted',
                header: 'Trusted',
                size: 150,
            },
            {
                accessorKey: 'validity',
                header: 'Validity',
                size: 150,
            },

            {
                accessorKey: 'last_updated_by',
                header: 'Last updated by',
                size: 150,
            },
            {
                accessorFn: (row) => row,
                header: 'Actions',
                size: 100,
                Cell: ({ cell }) => {
                    const row = cell.getValue();
                    return (
                        <div className="action-buttons-wrapper">
                            <div id={(row as Sample).trusted} onClick={onEditSampleClick} className="actions-button">
                                <span id={(row as Sample).doc_id}>Edit</span>
                            </div>
                            {props.canDeleteSamples && <div id={(row as Sample).trusted} onClick={onDeleteSampleClick} className="actions-button">
                                <span id={(row as Sample).doc_id}>Delete</span>
                            </div>}
                        </div>

                    )
                },
            }
        ],
        [sampleData],
    );

    function onDeleteSampleClick(evt: any) {
        const sampleId = evt.target.id;
        const trustedValue = evt.currentTarget.id;
        let confirmText = `Are you sure you want to delete sample ${sampleId}?`
        if (confirm(confirmText) === true) {
            let collectionName = `${trustedValue}_samples`;
            const deletedDocRef = doc(db, collectionName, sampleId);
            deleteDoc(deletedDocRef);
        }
        deleteSampleFromSampleState({
            trusted: trustedValue,
            doc_id: sampleId,
        } as Sample);
    }

    function deleteSampleFromSampleState(sample: Sample) {
        let sampleIndex = -1;
        for(let i = 0; i < sampleData.length; i ++) {
            if (sampleData[i].trusted === sample.trusted && sampleData[i].doc_id === sample.doc_id) {
                sampleIndex = i;
                break;
            }
        }
        let newSamplesState = [...sampleData];
        newSamplesState.splice(sampleIndex, 1);
        if (!sampleHasBeenDeletedFromList()) {
            newSamplesState.push({
                updated_state: true,
            } as Sample);
        }
        updateSampleData(newSamplesState);
    }

    function sampleHasBeenDeletedFromList(): boolean {
        return sampleData[sampleData.length-1].updated_state;   
    }


    function onSampleClick(evt: any) {
        const url = `./sample-details?trusted=${evt.currentTarget.id}&id=${evt.target.id}`;
        router.replace(url)
    }

    function onEditSampleClick(evt: any) {
        const url = `./edit?trusted=${evt.currentTarget.id}&id=${evt.target.id}`;
        router.push(url)
    }

    function onDowloadClick(evt: any) {
        if (!tableInstanceRef.current) {
            return;
        }
        const rowSelection = tableInstanceRef.current.getState().rowSelection;
        const selectedElements = document.getElementsByClassName('select-sample-checkbox');
        const selectedSamples: Sample[] = [];
        Object.keys(rowSelection).forEach((index: string) => {
            selectedSamples.push(props.samplesData[parseInt(index)]);
        })
        let headers = Object.keys(selectedSamples[0]);
        let csv = headers.toString() + '\n';
        let isFirst = true;
        selectedSamples.forEach((sample) => {
            headers.forEach((header) => {
                csv += (isFirst ? sample.header : ',' + sample.header);
                isFirst = false;
            });
            csv += '\n';
            isFirst = true;
        });
        console.log(csv);
        let hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'SampleDetails.csv'
        hiddenElement.click();
    }

    return (
        <div className='samples-page-wrapper'>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />

            {/* <div>
                <Nav />
            </div> */}
            <div >

                <MaterialReactTable
                    columns={columns}
                    data={sampleData}
                    enableRowSelection
                    tableInstanceRef={tableInstanceRef}
                    renderTopToolbarCustomActions={({ table }) => (
                        <div>
                            <button
                                disabled={!table.getIsSomeRowsSelected()}
                                type="button" className="btn btn-primary"
                                onClick={onDowloadClick}>
                                Export selected
                            </button>
                        </div>
                    )}
                />
            </div>
        </div>
    )
}
