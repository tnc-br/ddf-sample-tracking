"use client";
import 'bootstrap/dist/css/bootstrap.css';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, getDocs, collection, query, or, and, where, getDoc, doc } from "firebase/firestore";
import { useState, useMemo, useRef } from 'react';
import './styles.css';
import { useRouter } from 'next/navigation'
// import Nav from '../nav';
import { MaterialReactTable, type MRT_ColumnDef, type MRT_TableInstance, type MRT_SortingState, type MRT_PaginationState } from 'material-react-table';

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
}

export default function SamplesTable({samplesData}) {

    const router = useRouter();

    const tableInstanceRef = useRef<MRT_TableInstance<Sample>>(null);

    const columns = useMemo<MRT_ColumnDef<Sample>[]>(
        () => [
            {
                accessorKey: 'code_lab',
                header: 'Internal code',
                size: 150,
                Cell: ({ cell, row, renderedCellValue }) => {                    
                    return (
                        <div id={row.original.trusted} onClick={onSampleClick} className="sample-link">
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
                accessorKey: 'current_step',
                header: 'Current step',
                size: 150,
            },
            {
                accessorKey: 'site',
                header: 'Collection site',
                size: 150,
            },
        ],
        [],
    );


    function onSampleClick(evt) {
        const url = `./sample-details?trusted=${evt.currentTarget.id}&id=${evt.target.id}`;
        router.push(url)
    }

    function onDowloadClick(evt) {
        if (!tableInstanceRef.current) {
            return;
        }
        const rowSelection = tableInstanceRef.current.getState().rowSelection;
        const selectedElements = document.getElementsByClassName('select-sample-checkbox');
        const selectedSamples: typeof Samples[] = [];
        Object.keys(rowSelection).forEach((index: string) => {
            selectedSamples.push(samplesData[parseInt(index)]);
        })
        let headers = Object.keys(selectedSamples[0]);
        let csv = headers.toString() + '\n';
        let isFirst = true;
        selectedSamples.forEach((sample) => {
            headers.forEach((header) => {
                csv += (isFirst ? sample[header] : ',' + sample[header]);
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
                    data={samplesData}
                    enableRowSelection
                    tableInstanceRef={tableInstanceRef}
                    renderTopToolbarCustomActions={({ table }) => (
                        <div sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}>
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
