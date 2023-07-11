"use client";
import 'bootstrap/dist/css/bootstrap.css';

import fs from 'fs';
import csv from 'csv-parser';

import { renderToStaticMarkup } from "react-dom/server"
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import Nav from '../nav';
import { initializeApp } from "firebase/app";
import { useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from '../firebase_config';

export default function AddSamples() {
    const [tableHeaders, setTableHeaders] = useState([]);
    const [tableData, setTableData] = useState([]);

    const app = initializeApp(firebaseConfig);
    const router = useRouter();

    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            router.push('/login');
        }
      });


    function onFileChanged(evt) {
        console.log(evt);
        const target = evt.target;
        if (target && target.files.length > 0) {
            // updateCsvFile(target.files[0]);
            readCSVFile(target.files[0]);
        }
    }

    async function readCSVFile(file: File) {

        const reader = new FileReader();
        reader.readAsText(file as File);
        reader.onload = function (event) {
            if (!event || !event.target) {
                return;
            }
            var csvdata = event.target.result;
            if (!csvdata) return;
            var rowData = (csvdata as string).split('\n');
            console.log(rowData);
            const titles = rowData[0].split(',');
            const titlesRoot = createRoot(document.getElementById('table-header') as Element);
            const titlesHtml = titles.map((title: string) => {
                return (<th scope="col">{title}</th>);
            });
            titles.forEach((title: string) => {
                titlesRoot.render(titlesHtml);
            });
            rowData.shift();
            const samplesHtml = rowData.map((sample) => {
                return (<tr>
                    {sample.split(',').map((dataPoint) => {
                        return (<td>{dataPoint}</td>);
                    })}
                </tr>)
            });
            const samplesRoot = createRoot(document.getElementById('samples-data') as Element);
            samplesRoot.render(samplesHtml);

        }
    }

    function getTableTitle(title: string) {
        return (<th scope="col">{title}</th>);
    }


    return (<div>
        <div>
            <Nav />
        </div>
        <div className="mb-3">
            <label htmlFor="formFile" className="form-label">Upload CSV file</label>
            <input capture onChange={onFileChanged} accept=".csv" className="form-control" type="file" id="formFile" />
        </div>
        <div id="fileTable">
            <table className="table table-bordered">
                <thead>
                    <tr id="table-header">
                    </tr>
                </thead>
                <tbody id="samples-data">

                </tbody>
            </table>

        </div>
    </div>)
}