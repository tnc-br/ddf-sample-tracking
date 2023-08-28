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
import { getRanHex, hideNavBar, hideTopBar, verifyLatLonFormat } from './utils';
import { useTranslation } from 'react-i18next';
import { TextField, Autocomplete, MenuItem, InputAdornment } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs';
import './i18n/config';

type UserData = {
    name: string,
    org: string,
    org_name: string,
    role: string,
}

type SampleDataInputProps = {
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

    if (!props || !props.onActionButtonClick || !props.baseState || !props.actionButtonTitle) return;

    if (Object.keys(props.baseState).length > Object.keys(formData).length) {
        setFormData(props.baseState);
    }


    function attemptToUpdateCurrentTab(newTab: number) {
        const currentTabRef = getCurrentTabFormRef();
        if (newTab < currentTab || checkCurrentTabFormValidity()) {
            setCurrentTab(newTab);
            if (props.onTabChange) props.onTabChange(newTab);
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
    }

    function handleSelectPrivateVisibility() {
        const newFormData = {
            ...formData,
            visibility: 'private',
        }
        setFormData(newFormData);
    }

    function handleSelectSupplier() {
        const newFormData = {
            ...formData,
            collected_by: 'supplier',
        }
        setFormData(newFormData);

    }

    function handleSelectMyOrg() {
        const newFormData = {
            ...formData,
            collected_by: 'my_org',
        }
        setFormData(newFormData);
    }


    function handleChange(evt: any, newValue?: any) {
        let newFormData;
        if (evt.$d) {
            const value = evt.$d;
            newFormData = {
                ...formData,
                date_collected: evt.$d
            }
        } else {
            let value;
            let name;
            if (newValue && newValue.length) {
                value = newValue;
                const id = evt.target.id;
                name = id.substring(0, id.indexOf('-option'));
            } else {
                value = evt.target.type === "checkbox" ? evt.target.checked : evt.$d ? evt.$d : evt.target.value;
                name = evt.target.name;
            }

            newFormData = {
                ...formData,
                [name]: value
            }
        }
        setFormData(newFormData);
    }

    function handleResultChange(evt: any) {
        const value = evt.target.value;
        let newFormDataMeasurementsArray = structuredClone(formData[evt.target.name]);
        if (!newFormDataMeasurementsArray) {
            newFormDataMeasurementsArray = [];
        }
        newFormDataMeasurementsArray[currentMeasurementsTab] = value;
        const newFormData = {
            ...formData,
            [evt.target.name]: newFormDataMeasurementsArray,
        }
        setFormData(newFormData);
    }

    function onCancleClick() {
        router.push('samples');
    }

    function onActionButtonClick() {
        const currentTabRef = getCurrentTabFormRef();
        if (!checkCurrentTabFormValidity()) return;
        props.onActionButtonClick(props.sampleId, formData);
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
            if (currentTab === 1) {
                if (!formData.trusted) {
                    alert("Please select an origin value");
                    return false;
                }
                if ((document.getElementById('inputLat') && !verifyLatLonFormat(document.getElementById('inputLat').value)) ||
                    (document.getElementById('inputLon') && !verifyLatLonFormat(document.getElementById('inputLon').value))) {
                    alert("Latitude and longitude should be in the format xx.xxxx");
                    return false;
                }
            } else {
                return true;
            }

        } else {
            currentTabRef.reportValidity();
            return false;
        }
        return true;
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

    const originValues = {
        Unknown: 'unknown',
        Known: 'trusted',
        Uncertain: 'untrusted'
    }

    const sampleTypeValues = {
        Disc: 'disk',
        Triangular: 'triangular',
        Chunk: 'chunk',
        Fiber: 'fiber'

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
                    {/* <div className="form-group">
                        <label htmlFor="sampleName">{t('sampleName')}*</label>
                        <input onChange={handleChange} value={formData.sample_name} name='sample_name' required type="text" className="form-control" id="sampleName" />
                    </div> */}
                    <div className='input-text-field-wrapper'>
                        <TextField
                            required
                            size='small'
                            fullWidth
                            id="sampleName"
                            name="sample_name"
                            label={t('sampleName')}
                            onChange={handleChange}
                            value={formData.sample_name}
                        />
                    </div>

                    <div className='input-text-field-wrapper'>
                        <Autocomplete
                            disablePortal
                            size='small'
                            fullWidth
                            id="species"
                            name="species"
                            // onHighlightChange={((evt: any) => console.log(evt))}
                            // onInputChange={handleChange}
                            onChange={handleChange}
                            value={formData.species}
                            options={getSpeciesNames()}
                            sx={{ width: 300 }}
                            renderInput={(params) =>
                                <TextField
                                    {...params}
                                    label={t('treeSpecies')}
                                />}
                        />
                    </div>

                    <div className='input-text-field-wrapper'>
                        <TextField
                            id="origin"
                            size='small'
                            fullWidth
                            select
                            required
                            name="trusted"
                            label={t('origin')}
                            onChange={handleChange}
                            value={formData.trusted ? formData.trusted : "unknown"}
                        >
                            {Object.keys(originValues).map((originLabel: string) => (
                                <MenuItem key={originLabel} value={originValues[originLabel]}>
                                    {originLabel}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                    {originIsKnownOrUncertain() &&
                        <div className='input-text-field-wrapper'>
                            <TextField
                                required
                                size='small'
                                fullWidth
                                id="collectionSite"
                                name="site"
                                label={t('collectionSite')}
                                onChange={handleChange}
                                value={formData.site}
                            />
                        </div>}
                    {originIsKnownOrUncertain() && <div className="form-row">
                        <TextField
                            required
                            size='small'
                            fullWidth
                            id="inputLat"
                            name="lat"
                            label={t('latitude')}
                            onChange={handleChange}
                            value={formData.lat}
                        />
                        <TextField
                            required
                            size='small'
                            fullWidth
                            id="inputLon"
                            name="lon"
                            label={t('longitude')}
                            onChange={handleChange}
                            value={formData.lon}
                        />
                        {/* <div className="form-group latlon-input" id="inputLatFormGroup">
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
                        </div> */}
                    </div>}

                    {originIsKnownOrUncertain() &&
                        <div className='input-text-field-wrapper'>
                            <Autocomplete
                                disablePortal
                                size='small'
                                fullWidth
                                id="state"
                                options={getStatesList()}
                                sx={{ width: 300 }}
                                renderInput={(params) => <TextField {...params} label={t('state')} />}
                                onChange={handleChange}
                                value={formData.state}
                            />
                        </div>}
                    {originIsKnownOrUncertain() &&

                        <div className='input-text-field-wrapper'>
                            <Autocomplete
                                disablePortal
                                size='small'
                                fullWidth
                                id="municipality"
                                options={getMunicipalitiesList()}
                                sx={{ width: 300 }}
                                renderInput={(params) => <TextField {...params} label={t('municipality')} />}
                                onChange={handleChange}
                                value={formData.municipality}
                            />
                        </div>}

                    <div className='input-text-field-wrapper'>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label={t('dateCollected')}
                                value={dayjs(formData.date_collected)}
                                slotProps={{ textField: { size: 'small' } }}
                                onChange={handleChange} />
                        </LocalizationProvider>
                    </div>
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
                    {formData.collected_by === "supplier" &&
                        <div className='input-text-field-wrapper'>
                            <TextField
                                size='small'
                                fullWidth
                                id="supplier"
                                name="supplier"
                                label={t('supplier')}
                                onChange={handleChange}
                                value={formData.supplier}
                            />
                        </div>}

                    <div className='input-text-field-wrapper'>
                        <TextField
                            size='small'
                            fullWidth
                            id="city"
                            name="city"
                            label={t('city')}
                            onChange={handleChange}
                            value={formData.city}
                        />
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
                        <div className='input-text-field-wrapper half-width'>
                            <TextField
                                size='small'
                                fullWidth
                                id="supplier"
                                name="measureing_height"
                                label={t('measuringHeight')}
                                onChange={handleChange}
                                value={formData.measureing_height}
                            />
                        </div>
                        {/* <div className="form-group half-width-entry">
                            <label htmlFor="measureing_height">{t('measuringHeight')}</label>
                            <input onChange={handleChange} value={formData.measureing_height} name='measureing_height' type="text" className="form-control" id="measureing_height" />
                        </div> */}

                        <div className='input-text-field-wrapper half-width'>
                            <TextField
                                id="sample_type"
                                size='small'
                                fullWidth
                                select
                                name="sample_type"
                                label={t('sampleType')}
                                onChange={handleChange}
                                value={formData.sample_type ? formData.sample_type : ""}
                            >
                                {Object.keys(sampleTypeValues).map((sampleTypeLabel: string) => (
                                    <MenuItem key={sampleTypeLabel} value={sampleTypeValues[sampleTypeLabel]}>
                                        {sampleTypeLabel}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>


                        {/* <div className='form-group  half-width-entry'>
                            <label htmlFor="sample_type" defaultValue={sampleTrust}>{t('sampleType')}*</label>
                            <select onChange={handleChange} value={formData.sample_type} required name='sample_type' className="form-select" aria-label="Default select example" id="sample_type">
                                <option value="knonw">Disc</option>
                                <option value="unkown">Triangular</option>
                                <option value="uncertain">Chunk</option>
                                <option value="uncertain">Fiber</option>
                            </select>
                        </div> */}
                    </div>
                    <div className='sample-measurements-overview-row'>
                        <div className='input-text-field-wrapper half-width'>
                            <TextField
                                size='small'
                                fullWidth
                                id="supplier"
                                name="diameter"
                                label={t('diameter')}
                                onChange={handleChange}
                                value={formData.diameter}
                            />
                        </div>
                        {/* <div className='form-group  half-width-entry'>
                            <label htmlFor="diameter">{t('diameter')}</label>
                            <input onChange={handleChange} value={formData.diameter} name='diameter' type="text" className="form-control" id="diameter" />
                        </div> */}

                    </div>
                    <div className='sample-measurements-overview-row'>
                        <div className='input-text-field-wrapper full-width'>
                            <TextField
                                size='small'
                                fullWidth
                                id="supplier"
                                name="observations"
                                label={t('observations')}
                                onChange={handleChange}
                                value={formData.observations}
                            />
                        </div>
                        {/* <div className="form-group full-width-entry">
                            <label htmlFor="observations">{t('observations')}</label>
                            <input onChange={handleChange} value={formData.observations} name='observations' type="text" className="form-control" id="observations" />
                        </div> */}
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
                                    <div key={index} onClick={handleMeasurementsTabClick}>
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
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            id="d18O_cel"
                                            name="d18O_cel"
                                            label={t('d18O_cel')}
                                            onChange={handleResultChange}
                                            value={formData.d18O_cel ? formData.d18O_cel[currentMeasurementsTab] || '' : ''}
                                        />
                                    </div>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            id="oxygen"
                                            name="oxygen"
                                            label="d18O_wood"
                                            onChange={handleResultChange}
                                            value={formData.oxygen ? formData.oxygen[currentMeasurementsTab] || '' : ''}
                                        />
                                    </div>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            id="nitrogen"
                                            name="nitrogen"
                                            label="d15N_wood"
                                            onChange={handleResultChange}
                                            value={formData.nitrogen ? formData.nitrogen[currentMeasurementsTab] || '' : ''}
                                        />
                                    </div>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            id="n_wood"
                                            name="n_wood"
                                            label="N_wood"
                                            onChange={handleResultChange}
                                            value={formData.n_wood ? formData.n_wood[currentMeasurementsTab] || '' : ''}

                                        />
                                    </div>
                                    {/* <div className="form-group">
                                        <label htmlFor="oxygen">d18O_wood</label>
                                        <input onChange={handleResultChange} value={formData.oxygen ? formData.oxygen[currentMeasurementsTab] || '' : ''} name='oxygen' type="text" className="form-control" id="oxygen" />
                                    </div> */}
                                    {/* <div className="form-group">
                                        <label htmlFor="nitrogen">d15N_wood</label>
                                        <input onChange={handleResultChange} value={formData.nitrogen ? formData.nitrogen[currentMeasurementsTab] || '' : ''} name='nitrogen' type="text" className="form-control" id="nitrogen" />
                                    </div> */}
                                    {/* <div className="form-group">
                                        <label htmlFor="n_wood">N_wood</label>
                                        <input onChange={handleResultChange} value={formData.n_wood ? formData.n_wood[currentMeasurementsTab] || '' : ''} name='n_wood' type="text" className="form-control" id="n_wood" />
                                    </div> */}
                                </div>
                                <div className='measurements-row'>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            id="carbon"
                                            name="carbon"
                                            label="d13C_wood"
                                            onChange={handleResultChange}
                                            value={formData.carbon ? formData.c_cel[currentMeasurementsTab] || '' : ''}
                                        />
                                    </div>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            id="c_wood"
                                            name="c_wood"
                                            label="%C_wood"
                                            onChange={handleResultChange}
                                            value={formData.c_wood ? formData.c_wood[currentMeasurementsTab] || '' : ''}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                                            }}
                                        />
                                    </div>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            id="d13C_cel"
                                            name="d13C_cel"
                                            label="d13C_cel"
                                            onChange={handleResultChange}
                                            value={formData.d13C_cel ? formData.d13C_cel[currentMeasurementsTab] || '' : ''}
                                        />
                                    </div>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            id="c_cel"
                                            name="c_cel"
                                            label="%C_cel"
                                            onChange={handleResultChange}
                                            value={formData.c_cel ? formData.c_cel[currentMeasurementsTab] || '' : ''}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                                            }}
                                        />
                                    </div>
                                    {/* <div className="form-group">
                                        <label htmlFor="carbon">d13C_wood</label>
                                        <input onChange={handleResultChange} value={formData.carbon ? formData.carbon[currentMeasurementsTab] || '' : ''} name='carbon' type="text" className="form-control" id="carbon" />
                                    </div> */}
                                    {/* <div className="form-group">
                                        <label htmlFor="d18O_wood">%C_wood</label>
                                        <input onChange={handleResultChange} value={formData.c_wood ? formData.c_wood[currentMeasurementsTab] || '' : ''} name='c_wood' type="text" className="form-control" id="c_wood" />
                                    </div> */}
                                    {/* <div className="form-group">
                                        <label htmlFor="d13C_cel">d13C_cel</label>
                                        <input onChange={handleResultChange} value={formData.d13C_cel ? formData.d13C_cel[currentMeasurementsTab] || '' : ''} name='d13C_cel' type="text" className="form-control" id="d13C_cel" />
                                    </div> */}
                                    {/* <div className="form-group">
                                        <label htmlFor="c_cel">%C_cel</label>
                                        <input onChange={handleResultChange} value={formData.c_cel ? formData.c_cel[currentMeasurementsTab] || '' : ''} name='c_cel' type="text" className="form-control" id="c_cel" />
                                    </div> */}
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
                            <span className='detail-value'>{formData['trusted']}</span>
                        </div>
                    </div>
                </div>
                <div className='measurements-table'>
                    <div className='measurements-table-tabs'>
                        <div className='measurements-table-tabs-group'>
                            {Array.from({ length: numMeasurements }, (_, index) => (
                                <div key={index} onClick={handleMeasurementsTabClick}>
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
        return currentTab < 3;
        // if (formData.status === 'concluded') {
        //     return currentTab < 3;
        // } else {
        //     return currentTab < 2
        // }

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



    return (
        <div className="add-sample-page-wrapper">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&display=optional" />
            <div>
                <div id='sample-form'>

                    <div>
                        {currentTab === 1 && basicInfoTab()}
                        {currentTab === 2 && sampleMeasurementsTab()}
                        {currentTab === 3 && reviewAndSubmitTab()}
                        {/* {currentTab === 4 && createSampleTab()} */}
                    </div>
                </div>
                <div className='submit-buttons'>
                    {shouldShowCancelButton() && <button type="button" onClick={onCancleClick} className="btn btn-outline-primary">Cancel</button>}
                    {shouldShowBackButton() && <button type="button" onClick={() => attemptToUpdateCurrentTab(currentTab - 1)} className="btn btn-primary">Back</button>}
                    {shouldShowNextButton() && <button type="button" onClick={() => attemptToUpdateCurrentTab(currentTab + 1)} className="btn btn-primary next-button">Next</button>}
                    {shouldShowActionItemButton() && <button type="button" onClick={onActionButtonClick} className="btn btn-primary">{props.actionButtonTitle}</button>}
                    {userIsOnLastTab() && <button type="button" onClick={handleReturnToDashboard} className="btn btn-primary">Return to dashboard</button>}

                </div>
            </div>
        </div>
    )
}