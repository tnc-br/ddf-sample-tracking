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
import { getRanHex, hideNavBar, hideTopBar } from './utils';
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
    onTabChange: any,
    baseState: {},
    actionButtonTitle: string,
    isNewSampleForm: boolean,
    userData: UserData,
    sampleId: string,
    currentTab: number,
    isCompletedSample: boolean,
}

export default function SampleDataInput(props: SampleDataInputProps) {
    const [user, setUser] = useState({});
    const [sampleTrust, setSampletrust] = useState('untrusted');
    // const [isMember, setIsMember] = useState(false);
    const [userData, setUserdata] = useState(props.userData);
    const [currentTab, setCurrentTab] = useState(1);

    const [formData, setFormData] = useState(props.baseState);
    const [numMeasurements, setNumMeasurements] = useState(2);
    const [currentMeasurementsTab, setCurentMeasurementsTab] = useState(0);

    const router = useRouter();
    const { t } = useTranslation();


    useEffect(() => {
        hideNavBar();
        hideTopBar();
    })

    if (!props || !props.onStateUpdate || !props.onActionButtonClick || !props.baseState || !props.actionButtonTitle) return;

    if (Object.keys(props.baseState).length > Object.keys(formData).length) {
        setFormData(props.baseState);
    }


    function attemptToUpdateCurrentTab(newTab: number) {
        const currentTabRef = getCurrentTabFormRef();
        if (newTab < currentTab || checkCurrentTabFormValidity()) {
            setCurrentTab(newTab);
            props.onTabChange(newTab);
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
        props.onStateUpdate(newFormData, currentTab);
    }

    function handleSelectPrivateVisibility() {
        const newFormData = {
            ...formData,
            visibility: 'private',
        }
        setFormData(newFormData);
        props.onStateUpdate(newFormData, currentTab);
    }

    function handleSelectSupplier() {
        const newFormData = {
            ...formData,
            collected_by: 'supplier',
        }
        setFormData(newFormData);
        props.onStateUpdate(newFormData, currentTab);

    }

    function handleSelectMyOrg() {
        const newFormData = {
            ...formData,
            collected_by: 'my_org',
        }
        setFormData(newFormData);
        props.onStateUpdate(newFormData, currentTab);
    }


    function handleChange(evt: any) {
        const value =
            evt.target.type === "checkbox" ? evt.target.checked : evt.target.value;
        const newFormData = {
            ...formData,
            [evt.target.name]: value
        }
        setFormData(newFormData);
        props.onStateUpdate(newFormData, currentTab);
    }

    function handleResultChange(evt: any) {
        const value = evt.target.value;
        let newFormDataMeasurementsArray = formData[evt.target.name];
        if (!newFormDataMeasurementsArray) {
            newFormDataMeasurementsArray = [];
        }
        newFormDataMeasurementsArray[currentMeasurementsTab] = value;
        const newFormData = {
            ...formData,
            [evt.target.name]: newFormDataMeasurementsArray,
        }
        setFormData(newFormData);
        props.onStateUpdate(formData, currentTab);
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
        if (currentTab === 3) return true;
        const currentTabRef = getCurrentTabFormRef();
        if (currentTab === 2 && !validateSampleResultsTab()) return false;
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
        if (!currentTab === 2) {
            return true;
        }
        const d18O_cel = formData.d18O_cel ? formData.d18O_cel.map((value: string) => parseFloat(value)) : [];
        const oxygen = formData.oxygen ? formData.oxygen.map((value: string) => parseFloat(value)) : [];
        const nitrogen = formData.nitrogen ? formData.nitrogen.map((value: string) => parseFloat(value)) : [];
        const n_wood = formData.n_wood ? formData.n_wood.map((value: string) => parseFloat(value)) : [];
        const carbon = formData.carbon ? formData.carbon.map((value: string) => parseFloat(value)) : [];
        const c_wood = formData.c_wood ? formData.c_wood.map((value: string) => parseFloat(value)) : [];
        const d13C_cel = formData.d13C_cel ? formData.d13C_cel.map((value: string) => parseFloat(value)) : [];
        const c_cel = formData.c_cel ? formData.c_cel.map((value: string) => parseFloat(value)) : [];

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
                    alertMessage = "d15N_wood should be within the range of -5-15";
                    alert(alertMessage);
                }
            })
        }
        if (n_wood) {
            n_wood.forEach((value: number) => {
                if (value < 0 || value > 1) {
                    alertMessage = "%N_wood should be within the range of 0-1";
                    alert(alertMessage);
                }
            })
        }
        if (carbon) {
            carbon.forEach((value: number) => {
                if (value < -38 || value > -20) {
                    alertMessage = "d13C_wood should be within the range of -38- -20";
                    alert(alertMessage);
                }
            })
        }
        if (c_wood) {
            c_wood.forEach((value: number) => {
                if (value < 40 || value > 60) {
                    alertMessage = "%C_wood should be within the range of 40-60";
                    alert(alertMessage);
                }
            })
        }
        if (d13C_cel) {
            d13C_cel.forEach((value: number) => {
                if (value < -35 || value > -20) {
                    alertMessage = "d13C_cel should be within the range of -35 - -20";
                    alert(alertMessage);
                }
            })
        }
        if (c_cel) {
            c_cel.forEach((value: number) => {
                if (value < 40 || value > 60) {
                    alertMessage = "%C_cel should be within the range of 40-60";
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

    function handleMeasurementsTabClick(evt: any) {
        console.log(evt);
        setCurentMeasurementsTab(parseInt(evt.target.id));
    }

    function handleAddMeasurementClick() {
        setNumMeasurements(numMeasurements + 1);
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
                        <label htmlFor="sampleName">{t('sampleName')}*</label>
                        <input onChange={handleChange} value={formData.sample_name} name='sample_name' required type="text" className="form-control" id="sampleName" />
                    </div>
                    {!props.isNewSampleForm && <div>
                        <label htmlFor="sampleTrustSelected" defaultValue={sampleTrust}>{t('status')}*</label>
                        <select onChange={handleChange} value={formData.status} required name='status' className="form-select" aria-label="Default select example" id="sampleTrustSelected">
                            <option value="unselected">-- Select option --</option>
                            <option value="in_progress">{t('inProgress')}</option>
                            <option value="concluded">{t('concluded')}</option>
                        </select>
                    </div>}
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
                        <label htmlFor="origin" defaultValue={sampleTrust}>{t('origin')}*</label>
                        <select onChange={handleChange} value={formData.trusted} name='trusted' required className="form-select" aria-label="Default select example" id="origin">
                            <option value="unselected">-- Select option -- </option>
                            <option value="unknown">{t('unknown')}</option>
                            <option value="trusted">{t('known')}</option>
                            <option value="untrusted">{t('uncertain')}</option>
                        </select>
                    </div>
                    {originIsKnownOrUncertain() && <div>
                        <div className="form-group">
                            <label htmlFor="collectionSite">{t('collectionSite')}*</label>
                            <input onChange={handleChange} value={formData.site} required name='site' type="text" className="form-control" id="collectionSite" />
                        </div>
                    </div>}
                    {originIsKnownOrUncertain() && <div className="form-row">
                        <div className="form-group latlon-input" id="inputLatFormGroup">
                            <label htmlFor="inputLat">{t('latitude')}{originIsKnownOrUncertain() && "*"}</label>
                            <input onChange={handleChange} value={formData.lat} required={originIsKnownOrUncertain()} name='lat' type="text" className="form-control" id="inputLat" />
                            <div className="invalid-feedback">
                                Please provide a latitude.
                            </div>
                        </div>
                        <div className="form-group latlon-input">
                            <label htmlFor="inputLon">{t('longitude')}{originIsKnownOrUncertain() && "*"}</label>
                            <input onChange={handleChange} value={formData.lon} required={originIsKnownOrUncertain()} name='lon' type="text" className="form-control" id="inputLon" />
                            <div className="invalid-feedback">
                                Please provide a longitude.
                            </div>
                        </div>
                    </div>}

                    {originIsKnownOrUncertain() && <div className="form-group">
                        <label htmlFor="inputState">State*</label>
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
            <form id="sample-measurements">
                <div className='sample-measurements-overview'>
                    <div className='sample-measurements-overview-row'>
                        <div className="form-group half-width-entry">
                            <label htmlFor="measureing_height">{t('measuringHeight')}</label>
                            <input onChange={handleChange} value={formData.measureing_height} name='measureing_height' type="text" className="form-control" id="measureing_height" />
                        </div>
                        <div className='form-group  half-width-entry'>
                            <label htmlFor="sample_type" defaultValue={sampleTrust}>{t('sampleType')}*</label>
                            <select onChange={handleChange} value={formData.sample_type} required name='sample_type' className="form-select" aria-label="Default select example" id="sample_type">
                                <option value="knonw">Disc</option>
                                <option value="unkown">Triangular</option>
                                <option value="uncertain">Chunk</option>
                                <option value="uncertain">Fiber</option>
                            </select>
                        </div>
                    </div>
                    <div className='sample-measurements-overview-row'>
                        <div className='form-group  half-width-entry'>
                            <label htmlFor="diameter">{t('diameter')}</label>
                            <input onChange={handleChange} value={formData.diameter} name='diameter' type="text" className="form-control" id="diameter" />
                        </div>
                        {/* <div className='form-group  half-width-entry'>
                            <label htmlFor="amount_of_measurements">{t('amountOfMeasurements')}*</label>
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
                        </div> */}
                    </div>
                    <div className='sample-measurements-overview-row'>
                        <div className="form-group full-width-entry">
                            <label htmlFor="observations">{t('observations')}</label>
                            <input onChange={handleChange} value={formData.observations} name='observations' type="text" className="form-control" id="observations" />
                        </div>
                    </div>
                </div>
                <div className="sample-measurements-entry">
                    <div className="sample-measurements-title">Sample measurements</div>
                    <div className="sample-measurements-instructions">Enter all the measurements of at least 1 sample to continue</div>
                    <div onClick={handleAddMeasurementClick} className="button">
                        <div className="add-measurement-button-wrapper">
                            <span className="material-symbols-outlined">
                                add
                            </span>
                            <span className='add-measurement-button-text'>Add measurement</span>
                        </div>
                    </div>
                    <div className='measurements-table'>
                        <div className='measurements-table-tabs'>
                            <div className='measurements-table-tabs-group'>
                                {Array.from({ length: numMeasurements }, (_, index) => (
                                    <div onClick={handleMeasurementsTabClick}>
                                        <div className={currentMeasurementsTab === index ? "selected-measurements-tab-wrapper measurements-tab-wrapper" : "measurements-tab-wrapper"}>
                                            <div className='measurements-tab-state-layer'>
                                                <div className='measurements-tab-contents'>
                                                    <div id={index.toString()} className='measurements-tab-text'>
                                                        Measurement {index + 1}
                                                    </div>
                                                </div>
                                                {currentMeasurementsTab === 0 && <div className='measurements-tab-indicator'></div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className='measurements-entry-wrapper'>
                                <div className='measurements-row'>
                                    <div className="form-group">
                                        <label htmlFor="d18O_cel">d18O_cel</label>
                                        <input onChange={handleResultChange} value={formData.d18O_cel ? formData.d18O_cel[currentMeasurementsTab] || '' : ''} name='d18O_cel' type="text" className="form-control" id="d18O_cel" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="oxygen">d18O_wood</label>
                                        <input onChange={handleResultChange} value={formData.oxygen ? formData.oxygen[currentMeasurementsTab] || '' : ''} name='oxygen' type="text" className="form-control" id="oxygen" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="nitrogen">d15N_wood</label>
                                        <input onChange={handleResultChange} value={formData.nitrogen ? formData.nitrogen[currentMeasurementsTab] || '' : ''} name='nitrogen' type="text" className="form-control" id="nitrogen" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="n_wood">N_wood</label>
                                        <input onChange={handleResultChange} value={formData.n_wood ? formData.n_wood[currentMeasurementsTab] || '' : ''} name='n_wood' type="text" className="form-control" id="n_wood" />
                                    </div>
                                </div>
                                <div className='measurements-row'>
                                    <div className="form-group">
                                        <label htmlFor="carbon">d13C_wood</label>
                                        <input onChange={handleResultChange} value={formData.carbon ? formData.carbon[currentMeasurementsTab] || '' : ''} name='carbon' type="text" className="form-control" id="carbon" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="d18O_wood">%C_wood</label>
                                        <input onChange={handleResultChange} value={formData.c_wood ? formData.c_wood[currentMeasurementsTab] || '' : ''} name='c_wood' type="text" className="form-control" id="c_wood" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="d13C_cel">d13C_cel</label>
                                        <input onChange={handleResultChange} value={formData.d13C_cel ? formData.d13C_cel[currentMeasurementsTab] || '' : ''} name='d13C_cel' type="text" className="form-control" id="d13C_cel" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="c_cel">%C_cel</label>
                                        <input onChange={handleResultChange} value={formData.c_cel ? formData.c_cel[currentMeasurementsTab] || '' : ''} name='c_cel' type="text" className="form-control" id="c_cel" />
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>

            </form>
        )
    }

    function reviewAndSubmitTab() {
        return (
            <div>
                <div className="details">
                    <div className='section-title'>
                        Details
                    </div>
                    <div className="detail-row">
                        <div className='detail'>
                            <span className="detail-name">{t('sampleName')}</span>
                            <span className='detail-value'>{formData['visibility'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('collectionSite')}</span>
                            <span className='detail-value'>{formData['site'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('supplierName')}</span>
                            <span className='detail-value'>{formData['supplier'] || "unknown"}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className='detail'>
                            <span className="detail-name">{t('sampleName')}</span>
                            <span className='detail-value'>{formData['sample_name'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('latitude')}</span>
                            <span className='detail-value'>{formData['lat'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('city')}</span>
                            <span className='detail-value'>{formData['city'] || "unknown"}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className='detail'>
                            <span className="detail-name">{t('treeSpecies')}</span>
                            <span className='detail-value'>{formData['species'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('longitude')}</span>
                            <span className='detail-value'>{formData['lon'] || "unknown"}</span>
                        </div>
                        <div className='detail'>
                            <span className="detail-name">{t('collectedBy')}</span>
                            <span className='detail-value'>{formData['collected_by']}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className='detail'>
                            <span className="detail-name">{t('origin')}</span>
                            <span className='detail-value'>{formData['d18O_cel']}</span>
                        </div>
                    </div>
                </div>
                <div className='measurements-table'>
                    <div className='measurements-table-tabs'>
                        <div className='measurements-table-tabs-group'>
                            {Array.from({ length: numMeasurements }, (_, index) => (
                                <div onClick={handleMeasurementsTabClick}>
                                    <div className={currentMeasurementsTab === index ? "selected-measurements-tab-wrapper measurements-tab-wrapper" : "measurements-tab-wrapper"}>
                                        <div className='measurements-tab-state-layer'>
                                            <div className='measurements-tab-contents'>
                                                <div id={index.toString()} className='measurements-tab-text'>
                                                    Measurement {index + 1}
                                                </div>
                                            </div>
                                            {currentMeasurementsTab === 0 && <div className='measurements-tab-indicator'></div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className='measurements-entry-wrapper'>
                            <div className="detail-row">
                                <div className='detail'>
                                    <span className="detail-name">{t('d18O_cel')}</span>
                                    <span className='detail-value'>{formData.d18O_cel ? formData.d18O_cel[currentMeasurementsTab] || '' : ''}</span>
                                </div>
                                <div className='detail'>
                                    <span className="detail-name">{t('oxygen')}</span>
                                    <span className='detail-value'>{formData.oxygen ? formData.oxygen[currentMeasurementsTab] || '' : ''}</span>
                                </div>
                                <div className='detail'>
                                    <span className="detail-name">{t('nitrogen')}</span>
                                    <span className='detail-value'>{formData.nitrogen ? formData.nitrogen[currentMeasurementsTab] || '' : ''}</span>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className='detail'>
                                    <span className="detail-name">{t('n_wood')}</span>
                                    <span className='detail-value'>{formData.n_wood ? formData.n_wood[currentMeasurementsTab] || '' : ''}</span>
                                </div>
                                <div className='detail'>
                                    <span className="detail-name">{t('carbon')}</span>
                                    <span className='detail-value'>{formData.carbon ? formData.carbon[currentMeasurementsTab] || '' : ''}</span>
                                </div>
                                <div className='detail'>
                                    <span className="detail-name">{t('c_wood')}</span>
                                    <span className='detail-value'>{formData.c_wood ? formData.c_wood[currentMeasurementsTab] || '' : ''}</span>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className='detail'>
                                    <span className="detail-name">{t('d13C_cel')}</span>
                                    <span className='detail-value'>{formData.d13C_cel ? formData.d13C_cel[currentMeasurementsTab] || '' : ''}</span>
                                </div>
                                <div className='detail'>
                                    <span className="detail-name">{t('c_cel')}</span>
                                    <span className='detail-value'>{formData.c_cel ? formData.c_cel[currentMeasurementsTab] || '' : ''}</span>
                                </div>

                            </div>

                            <div className="detail-row">
                                <div className='detail'>
                                    <span className="detail-name">{t('origin')}</span>
                                    <span className='detail-value'>{formData['d18O_cel']}</span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
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
        if (!props.isCompletedSample) return false;
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
        const isTabBeforeCreateSample = (props.isCompletedSample && currentTab === 3) || (!props.isCompletedSample && currentTab === 1);
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
            <div>
                <div id='sample-form'>

                    <div>
                        {currentTab === 1 && basicInfoTab()}
                        {currentTab === 2 && sampleMeasurementsTab()}
                        {currentTab === 3 && reviewAndSubmitTab()}
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