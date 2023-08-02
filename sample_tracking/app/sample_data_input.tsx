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
}

export default function SampleDataInput(props: any) {
    const [user, setUser] = useState({});
    const [sampleTrust, setSampletrust] = useState('untrusted');
    // const [isMember, setIsMember] = useState(false);
    const [userData, setUserdata] = useState({} as UserData);
    const [currentTab, setCurrentTab] = useState(1);

    const [formData, setFormData] = useState(props.baseState);

    if (!props || !props.onStateUpdate || !props.onActionButtonClick || !props.baseState || !props.actionButtonTitle) return;

    if (Object.keys(props.baseState).length > Object.keys(formData).length) {
        setFormData(props.baseState);
    }

    const router = useRouter();

    function attemptToUpdateCurrentTab(newTab: number) {
        const currentTabRef = getCurrentTabFormRef();
        if (checkCurrentTabFormValidity()) {
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
        } else if (currentTab === 2) {
            currentTabRef = document.getElementById('sample-origin-tab');
        } else {
            currentTabRef = document.getElementById('sample-measurements');
        }
        props.onStateUpdate(newFormData, currentTabRef);
    }

    function onCancleClick() {
        router.push('samples');
    }

    function onActionButtonClick() {
        const currentTabRef = getCurrentTabFormRef();
        if (checkCurrentTabFormValidity()) {
            props.onActionButtonClick();
        }
    }

    function getCurrentTabFormRef(): Element {
        if (currentTab === 1) {
            return document.getElementById('info-tab');
        } else if (currentTab === 2) {
            return document.getElementById('sample-origin-tab');
        } else {
            return document.getElementById('sample-measurements');
        }
    }

    function checkCurrentTabFormValidity(): boolean {
        const currentTabRef = getCurrentTabFormRef();
        if (currentTabRef.checkValidity()) {
            // Form is valid, forward to calling component handling.
            return true;
        } else {
            currentTabRef.reportValidity();
            return false;
        }
    }
  


    function basicInfoTab() {
        return (
            <form id='info-tab' className='grid-columns'>
                <div className='column-one'>
                    <div className="visibility_buttons">
                        <div onClick={handleSelectPublicVisibility}
                            className={formData.visibility === 'public' ? "button_select public_button selected" : "button_select public_button"}>Public</div>
                        <div onClick={handleSelectPrivateVisibility}
                            className={formData.visibility === 'private' ? "button_select private_button selected" : "button_select private_button"}>Private</div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sampleName">Sample name</label>
                        <input onChange={handleChange} value={formData.sample_name} name='sample_name' required type="text" className="form-control" id="sampleName" />
                    </div>
                    <div>
                        <label htmlFor="sampleTrustSelected" defaultValue={sampleTrust}>Status</label>
                        <select onChange={handleChange} value={formData.trusted} name='trusted' className="form-select" aria-label="Default select example" id="sampleTrustSelected">
                            <option selected>Open this select menu</option>
                            <option value="not_started">Not started</option>
                            <option value="in_progress">In progress</option>
                            <option value="concluded">Concluded</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <datalist id="suggestions">
                            {getSpeciesNames().map((speciesName: string) => {
                                return (<option key={speciesName}>{speciesName}</option>)
                            })}
                        </datalist>
                        <label htmlFor="treeSpecies">Tree species</label>
                        <input onChange={handleChange} value={formData.species} name='species' type="text" autoComplete="on" list="suggestions" className="form-control" id="treeSpecies" />
                    </div>
                </div>
            </form>


        )
    }


    function sampleOriginTab() {
        return (
            <form id='sample-origin-tab' className='grid-columns'>
                <div className='column-one'>
                    <div>
                        <label htmlFor="origin" defaultValue={sampleTrust}>Origin</label>
                        <select onChange={handleChange} value={formData.trusted} name='trusted' className="form-select" aria-label="Default select example" id="origin">
                            <option selected>Open this select menu</option>
                            <option value="trusted">Known</option>
                            <option value="untrusted">Unkown</option>
                            <option value="unknown">Uncertain</option>
                        </select>
                    </div>
                    <div>
                        <div className="form-group">
                            <label htmlFor="collectionSite">Collection site</label>
                            <input onChange={handleChange} value={formData.site} name='site' type="text" className="form-control" id="collectionSite" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group latlon-input" id="inputLatFormGroup">
                            <label htmlFor="inputLat">Latitude</label>
                            <input onChange={handleChange} value={formData.lat} name='lat' type="text" className="form-control" id="inputLat" />
                            <div className="invalid-feedback">
                                Please provide a latitude.
                            </div>
                        </div>
                        <div className="form-group latlon-input">
                            <label htmlFor="inputLon">Longitude</label>
                            <input onChange={handleChange} value={formData.lon} name='lon' type="text" className="form-control" id="inputLon" />
                            <div className="invalid-feedback">
                                Please provide a longitude.
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="inputState">State</label>
                        <select onChange={handleChange} value={formData.state} name='state' className="form-select" aria-label="Default select example" id="state">
                            {getStatesList().map((state: string) => {
                                return (
                                    <option value={state}>{state}</option>
                                )
                            })}
                        </select>
                    </div>
                    <div className="form-group">
                        <datalist id="suggestions">
                            {getMunicipalitiesList().map((municipality: string) => {
                                return (<option key={municipality}>{municipality}</option>)
                            })}
                        </datalist>
                        <label htmlFor="municipality">Municipality</label>
                        <input onChange={handleChange} value={formData.municipality} name='municipality' type="text" autoComplete="on" list="suggestions" className="form-control" id="municipality" />
                    </div>
                    <label htmlFor="date_collected">Date collected</label>
                    <br />
                    <input onChange={handleChange} value={formData.date_collected} name='date_collected' type="date" id="date_collected"></input>
                </div>
                <div className='column_two'>

                    <div>
                        <p>Collected by</p>
                        <div className="visibility_buttons">
                            <div onClick={handleSelectSupplier}
                                className={formData.collected_by === 'supplier' ? "button_select public_button selected" : "button_select public_button"}>Supplier</div>
                            <div onClick={handleSelectMyOrg}
                                className={formData.collected_by === 'my_org' ? "button_select private_button selected" : "button_select private_button"}>My org</div>
                        </div>
                    </div>
                    <div>
                        {formData.collected_by === "supplier" && <div className="form-group">
                            <label htmlFor="supplier">Supplier</label>
                            <input onChange={handleChange} value={formData.supplier} name='supplier' type="text" className="form-control" id="supplier" />
                        </div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input onChange={handleChange} value={formData.city} name='city' type="text" className="form-control" id="city" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="collectionSite">Collection site</label>
                        <input onChange={handleChange} value={formData.site} name='site' type="text" className="form-control" id="collectionSite" />
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
                        <label htmlFor="measureing_height">Measuring height</label>
                        <input onChange={handleChange} name='measureing_height' type="text" className="form-control" id="measureing_height" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="amount_of_measurements">Amount of measurements</label>
                        <input onChange={handleChange} name='amount_of_measurements' type="text" className="form-control" id="amount_of_measurements" />
                    </div>
                    <div>
                        <label htmlFor="origin" defaultValue={sampleTrust}>Sample type</label>
                        <select onChange={handleChange} name='origin' className="form-select" aria-label="Default select example" id="origin">
                            <option value="knonw">Disc</option>
                            <option value="unkown">Triangular</option>
                            <option value="uncertain">Chunk</option>
                            <option value="uncertain">Fiber</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="diameter">Diameter</label>
                        <input onChange={handleChange} name='diameter' type="text" className="form-control" id="diameter" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="observations">Observations</label>
                        <input onChange={handleChange} name='observations' type="text" className="form-control" id="observations" />
                    </div>
                </div>
            </form>
        )
    }

    return (
        <div className="add-sample-page-wrapper">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&display=optional" />
            <div className="sample-details-form">
                <p>Define the details of your new sample</p>
                <form id='sample-form'>
                    <div className="tabs">
                        <div onClick={() => attemptToUpdateCurrentTab(1)} className={currentTab === 1 ? "current_tab" : "unselected_tab"}>Basic info</div>
                        <div onClick={() => attemptToUpdateCurrentTab(2)} className={currentTab === 2 ? "current_tab" : "unselected_tab"}>Sample origin</div>
                        <div onClick={() => attemptToUpdateCurrentTab(3)} className={currentTab === 3 ? "current_tab" : "unselected_tab"}>Sample measurements</div>
                    </div>
                    <div>
                        {currentTab === 1 && basicInfoTab()}
                        {currentTab === 2 && sampleOriginTab()}
                        {currentTab === 3 && sampleMeasurementsTab()}
                    </div>
                </form>
                <div className='submit-buttons'>
                    <button type="button" onClick={onCancleClick} className="btn btn-outline-primary">Cancel</button>
                    <button type="button" onClick={onActionButtonClick} className="btn btn-primary">{props.actionButtonTitle}</button>
                </div>
            </div>
        </div>
    )
}