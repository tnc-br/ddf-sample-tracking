"use client";
import 'bootstrap/dist/css/bootstrap.css';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, deleteDoc, doc, collection } from "firebase/firestore";
import { useState, useMemo, useRef, useCallback } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
// import Nav from '../nav';
import { MaterialReactTable, type MRT_ColumnDef, type MRT_Row, type MRT_TableInstance, type MRT_SortingState, type MRT_PaginationState } from 'material-react-table';
import { initializeAppIfNecessary, type Sample } from './utils';
import { Box, Button, ListItemIcon, MenuItem, Typography, IconButton, Tooltip, } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

import { firebaseConfig } from './firebase_config';

import { useReactTable } from '@tanstack/react-table'
import { ExportToCsv } from 'export-to-csv';
import { useTranslation } from 'react-i18next';
import './i18n/config';
import { ConfirmationBox, ConfirmationProps } from './confirmation_box';

interface SampleDataProps {
    samplesData: Sample[],
    canDeleteSamples: boolean,
    showValidity: boolean,
    allowExport: boolean,
}

type SampleData = {
    samples: Sample[],
    hasBeenUpdated: boolean,
}

/**
 * Component used to render samples in a table format. The following data is passed in through props:
 *  - samplesData: the samples to be rendered
 *  - canDeleteSamples: true if the delete sample functionality should be enabled 
 *  - showValidity: true if the 'validity' column should be shown in the table
 *  - allowExport: true if user can export samples from table 
 */
export default function SamplesTable(props: SampleDataProps) {

    const [sampleData, setSampleData] = useState({
        samples: props.samplesData as Sample[],
        hasBeenUpdated: false,
    });
    const [confirmationBoxData, setConfirmationBoxData] = useState(null as ConfirmationProps|null)

    const router = useRouter();
    const app = initializeAppIfNecessary();
    const db = getFirestore();
    const { t } = useTranslation();

    const tableInstanceRef = useRef<MRT_TableInstance<Sample>>(null);

    if (!sampleData.hasBeenUpdated && (sampleData.samples && sampleData.samples.length !== props.samplesData.length)) {
        setSampleData({
            samples: props.samplesData,
            hasBeenUpdated: false,
        });
    }

    const columns = useMemo<MRT_ColumnDef<Sample>[]>(
        () => [
            {
                accessorKey: 'code_lab',
                header: t('internalCode'),
                size: 150,
                Cell: ({ cell, row, renderedCellValue }) => {
                    return (

                        <div id={row.original.trusted} onClick={() => onSampleClick(row)} className="actions-button sample-link">
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
                accessorKey: 'validity',
                header: t('validity'),
                size: 100,
                enableColumnFilter: false, // Consider a range filter if we have ~complete data.
            },
            {
                accessorKey: 'created_by_name',
                header: t('createdBy'),
                size: 100,
            },

            {
                accessorKey: 'org',
                header: t('organization'),
                size: 100,
            },
            {
                accessorKey: 'trusted',
                header: t('origin'),
                size: 100,
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
                size: 50,
                Cell: ({ cell }) => {
                    const row = cell.getValue();
                    return (
                        <div className="action-buttons-wrapper">
                            <div id={(row as Sample).trusted} >
                                <IconButton onClick={() => onEditSampleClick(row)}>
                                    <Edit />
                                </IconButton>
                            </div>

                            {props.canDeleteSamples &&
                                <div id={(row as Sample).trusted}>
                                    <IconButton color="error" onClick={() => onDeleteSampleClick(row)}>
                                        <Delete />
                                    </IconButton>
                                </div>}
                        </div>

                    )
                },
            }
        ],
        [sampleData.samples],
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


    const onDeleteSampleClick = useCallback(
        (row: MRT_Row<Sample>) => {
            const deleteSampleFunction = () => {
                let collectionName = `${row.trusted}_samples`;
                const deletedDocRef = doc(db, collectionName, row.code_lab);
                deleteDoc(deletedDocRef);
                //send api delete request here, then refetch or update local table data for re-render
                const updatedSamples = sampleData.samples.slice();
                let index;
                updatedSamples.forEach((sample: Sample, sampleIndex: number) => {
                    if (sample.code_lab === row.code_lab) {
                        index = sampleIndex;
                        return;
                    }
                });
                if (index) {
                    updatedSamples.splice(index, 1);
                    setSampleData({
                        samples: updatedSamples,
                        hasBeenUpdated: true,
                    });
                } else {
                    console.log(`Error: Unable to find index for ${row.code_lab} and could not remove row from table.`);
                }

                setConfirmationBoxData(null);
            }
            const cancelDeleteFunction = () => {
                setConfirmationBoxData(null);
            }
            const title = t('confirmDeleteSample', {sample: row.code_lab});
            const actionButtonTitle = t('delete');
            setConfirmationBoxData({
                title: title,
                actionButtonTitle: actionButtonTitle,
                onActionButtonClick: deleteSampleFunction,
                onCancelButtonClick: cancelDeleteFunction,
            })
        },
        [sampleData],
    );


    function onSampleClick(evt: any) {
        const url = `./sample-details?trusted=${evt.original.trusted}&id=${evt.original.code_lab}`;
        router.push(url)
    }

    function onEditSampleClick(evt: any) {
        const url = `./edit?trusted=${evt.trusted}&id=${evt.code_lab}`;
        router.push(url)
    }

    function handleDownloadAllData() {
        csvExporter.generateCsv(getExportDataFromSampleList(sampleData.samples));
    }

    function onDowloadClick(rows: MRT_Row<Sample>[]) {
        const sampleData = rows.map((row) => row.original);
        csvExporter.generateCsv(getExportDataFromSampleList(sampleData));
    }

    function getExportDataFromSampleList(samples: Sample[]): Sample[] {
        let exportData: Sample[] = [];
        samples.forEach((sample: Sample) => {
            const sampleCopy = structuredClone(sample);
            if (sample.points && sample.points.length > 0) {
                delete sampleCopy.points;
                sample.points.forEach((point: {}) => {
                    exportData.push({
                        ...sampleCopy,
                        ...point
                    });
                });
            } else {
                exportData.push(sample);
            }
        });
        return exportData;

    }

    return (
        <div className='samples-page-wrapper' id="samples-table-wrapper">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
            <div>

                <MaterialReactTable
                    columns={columns}
                    data={sampleData.samples}
                    enableFacetedValues
                    enableRowSelection={props.allowExport}
                    tableInstanceRef={tableInstanceRef}
                    globalFilterFn="contains"
                    muiTablePaginationProps={{
                        rowsPerPageOptions: [5, 10],
                    }}
                    renderTopToolbarCustomActions={({ table }) => (
                        <div>
                            {props.allowExport && <div>
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
                            </div>}


                        </div>
                    )}
                />
            </div>
            {confirmationBoxData && <ConfirmationBox {...confirmationBoxData} />}
        </div>
    )
}
