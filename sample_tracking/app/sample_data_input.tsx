"use client";

import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';
var QRCode = require('qrcode');
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from 'next/navigation'
import { doc, setDoc, getFirestore, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from './firebase_config';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from 'react';
import { speciesList } from './species_list';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { statesList } from './states_list';
import { municipalitiesList } from './municipalities_list';
import { getRanHex, hideNavBar } from './utils';
import { useTranslation } from 'react-i18next';
import './i18n/config';

type UserData = {
    name: string,
    org: string,
    org_name: string,
    role: string,
}

type SampleDataInputProps = {
    onStateUpdate: any,
    onActionButtonClick: any,
    baseState: {},
    actionButtonTitle: string,
    isNewSampleForm: boolean,
    userData: UserData,
    sampleId: string, 
}

export default function SampleDataInput(props: SampleDataInputProps) {
    const [user, setUser] = useState({});
    const [sampleTrust, setSampletrust] = useState('untrusted');
    // const [isMember, setIsMember] = useState(false);
    const [userData, setUserdata] = useState(props.userData);
    const [currentTab, setCurrentTab] = useState(1);

    const [formData, setFormData] = useState(props.baseState);

    const router = useRouter();
    const { t } = useTranslation();


    useEffect(() => {
        hideNavBar();
    })

    if (!props || !props.onStateUpdate || !props.onActionButtonClick || !props.baseState || !props.actionButtonTitle) return;

    if (Object.keys(props.baseState).length > Object.keys(formData).length) {
        setFormData(props.baseState);
    }


    function attemptToUpdateCurrentTab(newTab: number) {
        const currentTabRef = getCurrentTabFormRef();
        if (newTab < currentTab || checkCurrentTabFormValidity()) {
            setCurrentTab(newTab);
        }
    }

    function getSpeciesNames(): string[] {
        return speciesList.split('\n')
    }

    function getStatesList(): string[] {
        return statesList.split('\n');
    }

    function getMunicipalitiesList(): string[] {
        return municipalitiesList.split('\n');
    }

    function handleSelectPublicVisibility() {
        const newFormData = {
            ...formData,
            visibility: 'public',
        }
        setFormData(newFormData);
        props.onStateUpdate(newFormData);
    }

    function handleSelectPrivateVisibility() {
        const newFormData = {
            ...formData,
            visibility: 'private',
        }
        setFormData(newFormData);
        props.onStateUpdate(newFormData);
    }

    function handleSelectSupplier() {
        const newFormData = {
            ...formData,
            collected_by: 'supplier',
        }
        setFormData(newFormData);
        props.onStateUpdate(newFormData);

    }

    function handleSelectMyOrg() {
        const newFormData = {
            ...formData,
            collected_by: 'my_org',
        }
        setFormData(newFormData);
        props.onStateUpdate(newFormData);
    }


    function handleChange(evt: any) {
        const value =
            evt.target.type === "checkbox" ? evt.target.checked : evt.target.value;
        const newFormData = {
            ...formData,
            [evt.target.name]: value
        }
        setFormData(newFormData);
        let currentTabRef;
        if (currentTab === 1) {
            currentTabRef = document.getElementById('info-tab');
        } else {
            currentTabRef = document.getElementById('sample-measurements');
        }
        props.onStateUpdate(newFormData, currentTabRef);
    }

    function handleResultChange(evt: any) {
        const value = evt.target.value;
        const newFormData = {
            ...formData,
            [evt.target.name]: value.split(','),
        }
        setFormData(newFormData);
        const currentTabRef = document.getElementById('results-tab');
        props.onStateUpdate(formData, currentTabRef);
    }

    function onCancleClick() {
        router.push('samples');
    }

    function onActionButtonClick() {
        const currentTabRef = getCurrentTabFormRef();
        if (!checkCurrentTabFormValidity()) return;
        props.onActionButtonClick(props.sampleId);
        attemptToUpdateCurrentTab(4);
        // if (!props.isNewSampleForm) {
        //     props.onActionButtonClick();
        // } else {
        //     attemptToUpdateCurrentTab(4);
        // }
    }

    function getCurrentTabFormRef(): Element {
        if (currentTab === 1) {
            return document.getElementById('info-tab');
        } else if (currentTab === 2) {
            return document.getElementById('sample-measurements');
        } else {
            return document.getElementById('results-tab');
        }
    }

    function checkCurrentTabFormValidity(): boolean {
        const currentTabRef = getCurrentTabFormRef();
        if (currentTab === 3 && !validateSampleResultsTab()) return false; 
        if (currentTabRef.checkValidity()) {
            // Form is valid, forward to calling component handling.
            if (currentTab === 1 && !formData.trusted) {
                alert("Please select an origin value");
            } else {
                return true;
            }

        } else {
            currentTabRef.reportValidity();
            return false;
        }
    }

    function originIsKnownOrUncertain(): boolean {
        return formData.trusted === 'trusted' || formData.trusted === 'untrusted';
    }

    function validateSampleResultsTab(): boolean {
        if (!currentTab === 3) {
            return true;
        }
        const d18O_cel = formData.d18O_cel.map((value: string) => parseFloat(value));
        const oxygen = formData.oxygen.map((value: string) => parseFloat(value));
        const nitrogen = formData.nitrogen.map((value: string) => parseFloat(value));
        const n_wood = formData.n_wood.map((value: string) => parseFloat(value));
        const carbon = formData.carbon.map((value: string) => parseFloat(value));
        const c_wood = formData.c_wood.map((value: string) => parseFloat(value));
        const d13C_cel = formData.d13C_cel.map((value: string) => parseFloat(value));
        const c_cel = formData.c_cel.map((value: string) => parseFloat(value));

        let alertMessage = "";
        if (d18O_cel) {
            d18O_cel.forEach((value: number) => {
                if (value < 20 || value > 32) {
                    alertMessage = "d18O_cel should be within the range of 20-32";
                    alert(alertMessage);
                }
            })
        }
        if (oxygen) {
            oxygen.forEach((value: number) => {
                if (value < 20 || value > 32) {
                    alertMessage = "d180_wood should be within the range of 20-32";
                    alert(alertMessage);
                }
            })
        }
        if (nitrogen) {
            nitrogen.forEach((value: number) => {
                if (value < -5 || value > 15) {
                    alertMessage = "d15N_wood should be within the range of 20-32";
                    alert(alertMessage);
                }
            })
        }
        if (n_wood) {
            n_wood.forEach((value: number) => {
                if (value < 0 || value > 1) {
                    alertMessage = "%N_wood should be within the range of 20-32";
                    alert(alertMessage);
                }
            })
        }
        if (carbon) {
            carbon.forEach((value: number) => {
                if (value < -38 || value > -20) {
                    alertMessage = "d13C_wood should be within the range of 20-32";
                    alert(alertMessage);
                }
            })
        }
        if (c_wood) {
            c_wood.forEach((value: number) => {
                if (value < 40 || value > 60) {
                    alertMessage = "%C_wood should be within the range of 20-32";
                    alert(alertMessage);
                }
            })
        }
        if (d13C_cel) {
            carbon.forEach((value: number) => {
                if (value < -35 || value > -20) {
                    alertMessage = "d13C_cel should be within the range of 20-32";
                    alert(alertMessage);
                }
            })
        }
        if (c_cel) {
            carbon.forEach((value: number) => {
                if (value < 40 || value > 60) {
                    alertMessage = "%C_cel should be within the range of 20-32";
                    alert(alertMessage);
                }
            })
        }
        return alertMessage.length < 1;
    }

    function handlePrint(elem) {
        const mywindow = window.open('', 'PRINT', 'height=400,width=600');
        if (!mywindow) return;
        mywindow.document.write('<html><head><title>' + document.title + '</title>');
        mywindow.document.write('</head><body >');
        mywindow.document.write('<h1>' + document.title + '</h1>');
        mywindow.document.write(document.getElementById('qr-code').innerHTML);
        mywindow.document.write('</body></html>');

        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/

        mywindow.print();
        mywindow.close();

        return true;
    }



    function basicInfoTab() {
        return (
            <form id='info-tab' className='grid-columns'>
                <div className='column-one'>
                    <p>{t('visibility')}</p>
                    <div className="visibility_buttons">
                        <div onClick={handleSelectPublicVisibility}
                            className={formData.visibility === 'public' ? "button_select public_button selected" : "button_select public_button"}>{t('public')}</div>
                        <div onClick={handleSelectPrivateVisibility}
                            className={formData.visibility === 'private' ? "button_select private_button selected" : "button_select private_button"}>{t('private')}</div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sampleName">{t('sampleName')}</label>
                        <input onChange={handleChange} value={formData.sample_name} name='sample_name' required type="text" className="form-control" id="sampleName" />
                    </div>
                    <div>
                        <label htmlFor="sampleTrustSelected" defaultValue={sampleTrust}>{t('status')}</label>
                        <select onChange={handleChange} value={formData.status} required name='status' className="form-select" aria-label="Default select example" id="sampleTrustSelected">
                            <option value="unselected">-- Select option --</option>
                            <option value="not_started">{t('notStarted')}</option>
                            <option value="in_progress">{t('inProgress')}</option>
                            <option value="concluded">{t('concluded')}</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <datalist id="suggestions">
                            {getSpeciesNames().map((speciesName: string) => {
                                return (<option key={speciesName}>{speciesName}</option>)
                            })}
                        </datalist>
                        <label htmlFor="treeSpecies">{t('treeSpecies')}</label>
                        <input onChange={handleChange} value={formData.species} name='species' type="text" autoComplete="on" list="suggestions" className="form-control" id="treeSpecies" />
                    </div>

                    <div>
                        <label htmlFor="origin" defaultValue={sampleTrust}>{t('origin')}</label>
                        <select onChange={handleChange} value={formData.trusted} name='trusted' required className="form-select" aria-label="Default select example" id="origin">
                            <option value="unselected">-- Select option -- </option>
                            <option value="unknown">{t('unknown')}</option>
                            <option value="trusted">{t('known')}</option>
                            <option value="untrusted">{t('uncertain')}</option>
                        </select>
                    </div>
                    {originIsKnownOrUncertain() && <div>
                        <div className="form-group">
                            <label htmlFor="collectionSite">{t('collectionSite')}</label>
                            <input onChange={handleChange} value={formData.site} required name='site' type="text" className="form-control" id="collectionSite" />
                        </div>
                    </div>}
                    {<div className="form-row">
                        <div className="form-group latlon-input" id="inputLatFormGroup">
                            <label htmlFor="inputLat">{t('latitude')}</label>
                            <input onChange={handleChange} value={formData.lat} required={originIsKnownOrUncertain()} name='lat' type="text" className="form-control" id="inputLat" />
                            <div className="invalid-feedback">
                                Please provide a latitude.
                            </div>
                        </div>
                        <div className="form-group latlon-input">
                            <label htmlFor="inputLon">{t('longitude')}</label>
                            <input onChange={handleChange} value={formData.lon} required={originIsKnownOrUncertain()} name='lon' type="text" className="form-control" id="inputLon" />
                            <div className="invalid-feedback">
                                Please provide a longitude.
                            </div>
                        </div>
                    </div>}

                    {originIsKnownOrUncertain() && <div className="form-group">
                        <label htmlFor="inputState">State</label>
                        <select onChange={handleChange} value={formData.state} required name='state' className="form-select" aria-label="Default select example" id="state">
                            {getStatesList().map((state: string) => {
                                return (
                                    <option key={state} value={state}>{state}</option>
                                )
                            })}
                        </select>
                    </div>}
                    {originIsKnownOrUncertain() && <div className="form-group">
                        <datalist id="municipalitySuggestions">
                            {getMunicipalitiesList().map((municipality: string) => {
                                return (<option key={municipality}>{municipality}</option>)
                            })}
                        </datalist>
                        <label htmlFor="municipality">{t('municipality')}</label>
                        <input onChange={handleChange} value={formData.municipality} name='municipality' type="text" autoComplete="on" list="municipalitySuggestions" className="form-control" id="municipality" />
                    </div>}
                    <label htmlFor="date_collected">{t('dateCollected')}</label>
                    <br />
                    <input onChange={handleChange} value={formData.date_collected} name='date_collected' type="date" id="date_collected"></input>
                </div>
                <div className='column_two'>

                    <div>
                        <p>{t('collectedBy')}</p>
                        <div className="visibility_buttons">
                            <div onClick={handleSelectSupplier}
                                className={formData.collected_by === 'supplier' ? "button_select public_button selected" : "button_select public_button"}>{t('supplier')}</div>
                            <div onClick={handleSelectMyOrg}
                                className={formData.collected_by === 'my_org' ? "button_select private_button selected" : "button_select private_button"}>{t('myOrg')}</div>
                        </div>
                    </div>
                    <div>
                        {formData.collected_by === "supplier" && <div className="form-group">
                            <label htmlFor="supplier">{t('supplier')}</label>
                            <input onChange={handleChange} value={formData.supplier} name='supplier' type="text" className="form-control" id="supplier" />
                        </div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="city">{t('city')}</label>
                        <input onChange={handleChange} value={formData.city} name='city' type="text" className="form-control" id="city" />
                    </div>
                </div>
            </form>


        )
    }

    function sampleMeasurementsTab() {
        return (
            <form id='sample-measurements' className='grid-columns'>
                <div className='column-one'>
                    <div className="form-group">
                        <label htmlFor="measureing_height">{t('measuringHeight')}</label>
                        <input onChange={handleChange} value={formData.measureing_height} name='measureing_height' type="text" className="form-control" id="measureing_height" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="amount_of_measurements">{t('amountOfMeasurements')}</label>
                        <select onChange={handleChange} value={formData.amount_of_measurementste} required name='amount_of_measurementste' className="form-select" aria-label="Default select example" id="amount_of_measurementste">
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={7}>7</option>
                            <option value={8}>8</option>
                            <option value={9}>9</option>
                            <option value={10}>10</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sample_type" defaultValue={sampleTrust}>{t('sampleType')}</label>
                        <select onChange={handleChange} value={formData.sample_type} required name='sample_type' className="form-select" aria-label="Default select example" id="sample_type">
                            <option value="knonw">Disc</option>
                            <option value="unkown">Triangular</option>
                            <option value="uncertain">Chunk</option>
                            <option value="uncertain">Fiber</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="diameter">{t('diameter')}</label>
                        <input onChange={handleChange} value={formData.diameter} name='diameter' type="text" className="form-control" id="diameter" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="observations">{t('observations')}</label>
                        <input onChange={handleChange} value={formData.observations} name='observations' type="text" className="form-control" id="observations" />
                    </div>
                </div>
            </form>
        )
    }

    function createSampleTab() {
        const sampleId = props.sampleId;
        const today = new Date();
        const currentDateString = today.toLocaleDateString();
        const url = `timberid.org/sample-details?trusted=${formData.trusted}&id=${sampleId}`;

        return (<div>
            <p>Summary</p>
            <table className="table table-borderless sample-info-table">
                <tbody>
                    <tr>
                        <td className="sample-info">Id</td>
                        <td>{sampleId}</td>
                    </tr>
                    <tr>
                        <td className='sample-info'>{t('species')}</td>
                        <td>{formData.species}</td>
                    </tr>
                    <tr>
                        <td className='sample-info'>{t('dateCreated')}</td>
                        <td>{currentDateString}</td>
                    </tr>
                    <tr>
                        <td className='sample-info'>{t('collectedIn')}</td>
                        <td>{formData.state}</td>
                    </tr>
                    <tr>
                        <td className='sample-info'>{t('collectedOn')}</td>
                        <td>{formData.date_collected}</td>
                    </tr>
                </tbody>

            </table>
            <div>
                <p className='qr-title'>Sample QR code</p>
                <p className='qr-subtitle'>Print and paste this QR code on the sample to be analayzed</p>
                <div id='qr-code'>
                 <QRCodeSVG value={url} />
                </div>
                
                <button onClick={handlePrint} id="print-button" type="button" className="btn btn-primary print-button">Print</button>

            </div>

        </div>)
    }

    function sampleResultsTab() {
        if (formData.status !== 'concluded') {
            attemptToUpdateCurrentTab(currentTab + 1);
        }
        return (
            <div>
                <div className="result-instructions">
                Enter the values for each sample separated by a comma (,).
                </div>
                
                <form id='results-tab' className='grid-columns'>
                    <div className='column-one'>
                        <div className="form-group">
                            <label htmlFor="d18O_cel">d18O_cel</label>
                            <input onChange={handleResultChange} value={formData.d18O_cel ? formData.d18O_cel.toString() : ''} name='d18O_cel' type="text" className="form-control" id="d18O_cel" />
                        </div>
                    </div>
                    <div className='column-one'>
                        <div className="form-group">
                            <label htmlFor="oxygen">d18O_wood</label>
                            <input onChange={handleResultChange} value={formData.oxygen ? formData.oxygen.toString() : ''} name='oxygen' type="text" className="form-control" id="oxygen" />
                        </div>
                    </div>
                    <div className='column-one'>
                        <div className="form-group">
                            <label htmlFor="nitrogen">d15N_wood</label>
                            <input onChange={handleResultChange} value={formData.nitrogen ? formData.nitrogen.toString() : ''} name='nitrogen' type="text" className="form-control" id="nitrogen" />
                        </div>
                    </div>
                    <div className='column-one'>
                        <div className="form-group">
                            <label htmlFor="n_wood">N_wood</label>
                            <input onChange={handleResultChange} value={formData.n_wood ? formData.n_wood.toString() : ''} name='n_wood' type="text" className="form-control" id="n_wood" />
                        </div>
                    </div>
                    <div className='column-one'>
                        <div className="form-group">
                            <label htmlFor="carbon">d13C_wood</label>
                            <input onChange={handleResultChange} value={formData.carbon ? formData.carbon.toString() : ''} name='carbon' type="text" className="form-control" id="carbon" />
                        </div>
                    </div>
                    <div className='column-one'>
                        <div className="form-group">
                            <label htmlFor="d18O_wood">%C_wood</label>
                            <input onChange={handleResultChange} value={formData.c_wood ? formData.c_wood.toString() : ''} name='c_wood' type="text" className="form-control" id="c_wood" />
                        </div>
                    </div>
                    <div className='column-one'>
                        <div className="form-group">
                            <label htmlFor="d13C_cel">d13C_cel</label>
                            <input onChange={handleResultChange} value={formData.d13C_cel ? formData.d13C_cel.toString() : ''} name='d13C_cel' type="text" className="form-control" id="d13C_cel" />
                        </div>
                    </div>
                    <div className='column-one'>
                        <div className="form-group">
                            <label htmlFor="c_cel">%C_cel</label>
                            <input onChange={handleResultChange} value={formData.c_cel ? formData.c_cel.toString() : ''} name='c_cel' type="text" className="form-control" id="c_cel" />
                        </div>
                    </div>
                </form>
            </div>
        )
    }

    function userIsOnLastTab(): boolean {
        return currentTab === 4;
    }
    function shouldShowNextButton(): boolean {
        if (formData.status === 'concluded') {
            return currentTab < 3;
        } else {
            return currentTab < 2
        }

    }

    function shouldShowBackButton(): boolean {
        return currentTab !== 1 && !userIsOnLastTab();
    }

    function shouldShowCancelButton(): boolean {
        return !userIsOnLastTab();
    }
    function shouldShowActionItemButton(): boolean {
        const isTabBeforeCreateSample = (formData.status === 'concluded' && currentTab === 3) || (formData.status !== 'concluded' && currentTab === 2);
        return isTabBeforeCreateSample || !props.isNewSampleForm;
    }
    function handleReturnToDashboard() {
        router.push('/samples')
    }
    function handleNextButtonClick() {
        let nextTab = currentTab + 1;
        if (formData.status !== 'concluded' && nextTab === 3) {
            nextTab++;
        } 
        attemptToUpdateCurrentTab(nextTab);
    }



    return (
        <div className="add-sample-page-wrapper">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&display=optional" />
            <div className="sample-details-form">
                <div id='sample-form'>
                    <div className="tabs">
                        <div className={currentTab === 1 ? "current_tab" : "unselected_tab"}>{t('basicInfo')}</div>
                        <div className={currentTab === 2 ? "current_tab" : "unselected_tab"}>{t('sampleMeasurements')}</div>
                        {formData.status === 'concluded' && <div className={currentTab === 3 ? "current_tab" : "unselected_tab"}>{t('sampleResults')}</div>}
                        {props.isNewSampleForm && <div className={currentTab === 4 ? "current_tab" : "unselected_tab"}>{t('createSample')}</div>}
                    </div>
                    <div>
                        {currentTab === 1 && basicInfoTab()}
                        {currentTab === 2 && sampleMeasurementsTab()}
                        {currentTab === 3 && sampleResultsTab()}
                        {currentTab === 4 && createSampleTab()}
                    </div>
                </div>
                <div className='submit-buttons'>
                    {shouldShowCancelButton() && <button type="button" onClick={onCancleClick} className="btn btn-outline-primary">Cancel</button>}
                    {shouldShowBackButton() && <button type="button" onClick={() => attemptToUpdateCurrentTab(currentTab - 1)} className="btn btn-primary">Back</button>}
                    {shouldShowNextButton() && <button type="button" onClick={handleNextButtonClick} className="btn btn-primary next-button">Next</button>}
                    {shouldShowActionItemButton() && <button type="button" onClick={onActionButtonClick} className="btn btn-primary">{props.actionButtonTitle}</button>}
                    {userIsOnLastTab() && <button type="button" onClick={handleReturnToDashboard} className="btn btn-primary">Return to dashboard</button>}

                </div>
            </div>
        </div>
    )
}