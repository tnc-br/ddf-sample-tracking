"use client";
import 'bootstrap/dist/css/bootstrap.css';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, deleteDoc, doc, collection } from "firebase/firestore";
import { useState, useMemo, useRef } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
// import Nav from '../nav';
import { MaterialReactTable, type MRT_ColumnDef, type MRT_Row, type MRT_TableInstance, type MRT_SortingState, type MRT_PaginationState } from 'material-react-table';
import { initializeAppIfNecessary } from './utils';

import { firebaseConfig } from './firebase_config';

import { useReactTable } from '@tanstack/react-table'
import { ExportToCsv } from 'export-to-csv';
import { useTranslation } from 'react-i18next';
import './i18n/config';

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
    const { t } = useTranslation();

    


    const tableInstanceRef = useRef<MRT_TableInstance<Sample>>(null);

    if (!sampleHasBeenDeletedFromList() && (sampleData && sampleData.length !== props.samplesData.length)) {
        setSampleData(props.samplesData);
    }

    function updateSampleData(newSampleData: Sample[]) {
        setSampleData(newSampleData);
    }

    const columns = useMemo<MRT_ColumnDef<Sample>[]>(
        () => [
            {
                accessorKey: 'code_lab',
                header: t('internalCode'),
                size: 150,
                Cell: ({ cell, row, renderedCellValue }) => {
                    return (
                        <div id={row.original.trusted} onClick={onSampleClick} className="actions-button sample-link">
                            <span id={row.original.code_lab}>{renderedCellValue}</span>
                        </div>
                    )
                },
            },
            {
                accessorFn: (row) => (row as Sample).sample_name ?? '',
                header: t('name'),
                size: 150,
            },
            {
                accessorFn: (row) => (row as Sample).status ?? '',
                header: t('status'),
                size: 200,
                filterVariant: 'select',

            },
            {
                accessorKey: 'validity',
                header: t('validity'),
                size: 100,
                enableColumnFilter: false, // Consider a range filter if we have ~complete data.
            },
            {
                accessorFn: (row) => (row as Sample).last_updated_by ?? '',
                header: t('lastUpdatedBy'),
                size: 150,
                filterVariant: 'select',
            },
            {
                accessorFn: (row) => row,
                header: t('actions'),
                size: 100,
                Cell: ({ cell }) => {
                    const row = cell.getValue();
                    return (
                        <div className="action-buttons-wrapper">
                            <div id={(row as Sample).trusted} onClick={onEditSampleClick} className="actions-button">
                                <span id={(row as Sample).code_lab}>Edit</span>
                            </div>
                            {props.canDeleteSamples && <div id={(row as Sample).trusted} onClick={onDeleteSampleClick} className="actions-button">
                                <span id={(row as Sample).code_lab}>Delete</span>
                            </div>}
                        </div>

                    )
                },
            }
        ],
        [sampleData],
    );

    const csvOptions = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      };
    const csvExporter = new ExportToCsv(csvOptions);

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
        for (let i = 0; i < sampleData.length; i++) {
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
        if (!sampleData) return false;
        if(sampleData.length > 0) {
            return sampleData[sampleData.length - 1].updated_state;
        }
        return false;
        
    }


    function onSampleClick(evt: any) {
        const url = `./sample-details?trusted=${evt.currentTarget.id}&id=${evt.target.id}`;
        router.push(url)
    }

    function onEditSampleClick(evt: any) {
        const url = `./edit?trusted=${evt.currentTarget.id}&id=${evt.target.id}`;
        router.push(url)
    }

    function handleDownloadAllData() {
        csvExporter.generateCsv(sampleData);
    }

    function onDowloadClick(rows: MRT_Row<Sample>[]) {
        csvExporter.generateCsv(rows.map((row) => row.original));
    }

    return (
        <div className='samples-page-wrapper'>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
            <div>

                <MaterialReactTable
                    columns={columns}
                    data={sampleData}
                    enableFacetedValues
                    enableRowSelection
                    tableInstanceRef={tableInstanceRef}
                    globalFilterFn="contains"
                    muiTablePaginationProps={{
                        rowsPerPageOptions: [5, 10],
                    }}
                    renderTopToolbarCustomActions={({ table }) => (
                        <div>
                            <button
                                type="button" className="btn btn-primary export-button"
                                onClick={handleDownloadAllData}>
                                Export all data
                            </button>
                            <button
                                disabled={!table.getIsSomeRowsSelected()}
                                type="button" className="btn btn-primary export-button"
                                onClick={() => onDowloadClick(table.getSelectedRowModel().rows)}>
                                Export selected
                            </button>
                            
                        </div>
                    )}
                />
            </div>
        </div>
    )
}
