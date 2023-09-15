"use client";

import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';
var QRCode = require('qrcode');
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';
import { speciesList } from './species_list';
import { statesList } from './states_list';
import { municipalitiesList } from './municipalities_list';
import { getRanHex, hideNavBar, hideTopBar, verifyLatLonFormat, validateSample, type UserData, Sample, SampleError, ErrorMessages } from './utils';
import { useTranslation } from 'react-i18next';
import { TextField, Autocomplete, MenuItem, InputAdornment } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs';
import './i18n/config';

type SampleDataInputProps = {
    onActionButtonClick: any,
    onTabChange: any,
    baseState: Sample,
    actionButtonTitle: string,
    isNewSampleForm: boolean,
    sampleId: string,
    currentTab: number,
}

/**
 * Component used to input sample data for the AddSample and Edit components. The following data is passed in:
 * - onActionButtonClick: function to call when the action button is clicked
 * - onTabChange: function to call when the tab of the input form is changed
 * - baseState: the initial data for the input form
 * - actionButtonTitle: the label for the action button
 * - isNewSampleForm: boolean representing if this is a new sample or represents an already existing sample
 * - sampleId: 20 character hex ID for the sample
 * - currentTab: the tab of the sample form that should be shown
 * 
 * This is a very large file but at its core its just a form to enter Sample data. 
 */
export default function SampleDataInput(props: SampleDataInputProps) {
    const [currentTab, setCurrentTab] = useState(props.currentTab ? props.currentTab : 1);
    const [formData, setFormData] = useState(props.baseState);
    const [numMeasurements, setNumMeasurements] = useState(2);
    const [currentMeasurementsTab, setCurentMeasurementsTab] = useState(0);
    const [errorText, setErrorText] = useState({} as Sample);

    const router = useRouter();
    const { t } = useTranslation();

    const errorMessages: ErrorMessages = {
        originValueError: t('originValueError'),
        originValueRequired: t('originValueRequired'),
        latLonRequired: t('latLonRequired'),
        shouldBeWithinTheRange: t('shouldBeWithinTheRange'),
        and: t('and'),
        isRequired: t('isRequired')
    }

    useEffect(() => {
        hideNavBar();
        hideTopBar();
    })

    if (!props || !props.onActionButtonClick || !props.baseState || !props.actionButtonTitle) return;

    if (Object.keys(props.baseState).length > Object.keys(formData).length) {
        setFormData(props.baseState);
    }


    function attemptToUpdateCurrentTab(newTab: number) {
        if (newTab < currentTab || checkCurrentTabFormValidity()) {
            setCurrentTab(newTab);
            if (props.onTabChange) props.onTabChange(newTab);
            setErrorText({});
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

    function getCurrentTabFormRef(): HTMLElement {
        if (currentTab === 1) {
            return document.getElementById('info-tab')!;
        } else if (currentTab === 2) {
            return document.getElementById('sample-measurements')!;
        } else {
            return document.getElementById('results-tab')!;
        }
    }

    function checkCurrentTabFormValidity(): boolean {
        if (currentTab === 3) return true;

        const currentTabRef = getCurrentTabFormRef();
        // if (currentTab === 2 && !validateSampleResultsTab()) return false;


        if (currentTabRef.checkValidity()) {
            const possibleErrors = validateSample(formData, [currentTab], errorMessages);
            let tempErrorText = {} as Sample;
            if (possibleErrors.length > 0) {
                possibleErrors.forEach((error: SampleError) => {
                    tempErrorText[error.fieldWithError] = error.errorString;
                })
                setErrorText(tempErrorText);
                return false;
            }
            return true;

        } else {
            currentTabRef.reportValidity();
            return false;
        }
    }

    function originIsKnownOrUncertain(): boolean {
        return formData.trusted === 'trusted' || formData.trusted === 'untrusted';
    }

    function handleMeasurementsTabClick(evt: any) {
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

    const statusValues = {
        'In transit': 'in_transit',
        'Not started': 'not_started',
        'In progress': 'in_progress',
        'Completed': 'concluded'
    }

    const style = {
        "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
                borderColor: "green"
            }
        }
    }


    function basicInfoTab() {
        return (
            <form id='info-tab' className='grid-columns'>
                <div className='column-one'>
                    <div className='input-text-field-wrapper'>
                        <TextField
                            required
                            sx={style}
                            size='small'
                            fullWidth
                            id="sampleName"
                            name="sample_name"
                            label={t('sampleName')}
                            onChange={handleChange}
                            value={formData.sample_name ? formData.sample_name : ''}
                        />
                    </div>

                    <div className='input-text-field-wrapper'>
                        <TextField
                            id="status"
                            size='small'
                            sx={style}
                            fullWidth
                            select
                            required
                            name="status"
                            label={t('status')}
                            onChange={handleChange}
                            value={formData.status ? formData.status : "concluded"}
                        >
                            {Object.keys(statusValues).map((statusLabel: string) => (
                                <MenuItem key={statusLabel} value={statusValues[statusLabel]}>
                                    {statusLabel}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>

                    <div className='input-text-field-wrapper'>
                        <Autocomplete
                            disablePortal
                            sx={style}
                            size='small'
                            fullWidth
                            id="species"
                            name="species"
                            onChange={handleChange}
                            value={formData.species}
                            options={getSpeciesNames()}
                            // sx={{ width: 300 }}
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
                            sx={style}
                            fullWidth
                            select
                            required
                            name="trusted"
                            label={t('origin')}
                            helperText={errorText.trusted}
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
                                sx={style}
                                id="collectionSite"
                                name="site"
                                label={t('collectionSite')}
                                onChange={handleChange}
                                value={formData.site}
                            />
                        </div>}
                    {originIsKnownOrUncertain() && <div className="form-row">
                        <div className='latlon-entry'>
                            <TextField
                                required
                                size='small'
                                fullWidth
                                sx={style}
                                id="inputLat"
                                name="lat"
                                helperText={errorText.lat}
                                label={t('latitude')}
                                onChange={handleChange}
                                value={formData.lat}


                            />
                        </div>
                        <TextField
                            required
                            size='small'
                            fullWidth
                            id="inputLon"
                            sx={style}
                            name="lon"
                            helperText={errorText.lon}
                            label={t('longitude')}
                            onChange={handleChange}
                            value={formData.lon}
                        />
                    </div>}

                    {originIsKnownOrUncertain() &&
                        <div className='input-text-field-wrapper'>
                            <Autocomplete
                                disablePortal
                                size='small'
                                fullWidth
                                id="state"
                                sx={style}
                                options={getStatesList()}
                                // sx={{ width: 300 }}
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
                                sx={style}
                                fullWidth
                                id="municipality"
                                options={getMunicipalitiesList()}
                                // sx={{ width: 300 }}
                                renderInput={(params) => <TextField {...params} label={t('municipality')} />}
                                onChange={handleChange}
                                value={formData.municipality}
                            />
                        </div>}

                    <div className='input-text-field-wrapper'>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label={t('dateCollected')}
                                sx={style}
                                value={dayjs(formData.date_collected)}
                                slotProps={{ textField: { size: 'small' } }}
                                onChange={handleChange} />
                        </LocalizationProvider>
                    </div>
                </div>
                <div className='column_two'>
                    <div className='collected-by-wrapper'>
                        <div className='collected-by-text-wrapper'>
                            <div className='collected-by-text'>{t('collectedBy')}</div>
                        </div>
                        <div className='collected-by-button-wrapper'>
                            <div onClick={handleSelectSupplier} className='supplier-button-wrapper'>
                                <div
                                    className={formData.collected_by === 'supplier' ? "supplier-button-container collected-by-button-container selected" :
                                        "supplier-button-container collected-by-button-container"}>
                                    <div className='supplier-button-slate-layer'>
                                        <div className='supplier-button-text'>{t('supplier')}</div>
                                    </div>
                                </div>
                            </div>
                            <div onClick={handleSelectMyOrg} className='supplier-button-wrapper'>
                                <div
                                    className={formData.collected_by === 'my_org' ? "org-button-container collected-by-button-container selected" :
                                        "org-button-container collected-by-button-container"}>
                                    <div className='supplier-button-slate-layer'>
                                        <div className='supplier-button-text'>{t('myOrg')}</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    {formData.collected_by === "supplier" &&
                        <div className='input-text-field-wrapper'>
                            <TextField
                                size='small'
                                sx={style}
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
                            sx={style}
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
                                sx={style}
                                onChange={handleChange}
                                value={formData.measureing_height}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">cm</InputAdornment>
                                }}
                            />
                        </div>

                        <div className='input-text-field-wrapper half-width'>
                            <TextField
                                id="sample_type"
                                size='small'
                                fullWidth
                                sx={style}
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
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">cm</InputAdornment>
                                }}
                                sx={style}
                            />
                        </div>
                        <div className='input-text-field-wrapper half-width'>
                            <TextField
                                size='small'
                                fullWidth
                                id="avp"
                                sx={style}
                                name="avp"
                                label="AVP"
                                onChange={handleChange}
                                value={formData.avp}
                            />
                        </div>
                    </div>
                    <div className='sample-measurements-overview-row'>
                        <div className='input-text-field-wrapper half-width'>
                            <TextField
                                size='small'
                                fullWidth
                                id="mean_annual_temperature"
                                sx={style}
                                name="mean_annual_temperature"
                                label={t('meanAnnualTemperature')}
                                onChange={handleChange}
                                value={formData.mean_annual_temperature}
                            />
                        </div>
                        <div className='input-text-field-wrapper half-width'>
                            <TextField
                                size='small'
                                fullWidth
                                id="mean_annual_precipitation"
                                name="mean_annual_precipitation"
                                label={t('meanAnnualPrecipitation')}
                                sx={style}
                                onChange={handleChange}
                                value={formData.mean_annual_precipitation}
                            />
                        </div>
                    </div>
                    <div className='sample-measurements-overview-row'>
                        <div className='input-text-field-wrapper full-width'>
                            <TextField
                                size='small'
                                fullWidth
                                id="supplier"
                                name="observations"
                                label={t('observations')}
                                sx={style}
                                onChange={handleChange}
                                value={formData.observations}
                            />
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
                                    <div key={index} onClick={handleMeasurementsTabClick}>
                                        <div className={currentMeasurementsTab === index ? "selected-measurements-tab-wrapper measurements-tab-wrapper" : "measurements-tab-wrapper"}>
                                            <div className='measurements-tab-state-layer'>
                                                <div className='measurements-tab-contents'>
                                                    <div id={index.toString()} className='measurements-tab-text'>
                                                        Measurement {index + 1}
                                                    </div>
                                                </div>
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
                                            sx={style}
                                            fullWidth
                                            id="d18O_cel"
                                            name="d18O_cel"
                                            label={t('d18O_cel')}
                                            helperText={errorText.d18O_cel}
                                            onChange={handleResultChange}
                                            value={formData.d18O_cel ? formData.d18O_cel[currentMeasurementsTab] || '' : ''}
                                        />
                                    </div>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            sx={style}
                                            fullWidth
                                            id="d18O_wood"
                                            name="d18O_wood"
                                            label="d18O_wood"
                                            helperText={errorText.d18O_wood}
                                            onChange={handleResultChange}
                                            value={formData.d18O_wood ? formData.d18O_wood[currentMeasurementsTab] || '' : ''}
                                        />
                                    </div>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            id="d15N_wood"
                                            sx={style}
                                            name="d15N_wood"
                                            helperText={errorText.d15N_wood}
                                            label="d15N_wood"
                                            onChange={handleResultChange}
                                            value={formData.d15N_wood ? formData.d15N_wood[currentMeasurementsTab] || '' : ''}
                                        />
                                    </div>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            id="n_wood"
                                            sx={style}
                                            name="n_wood"
                                            helperText={errorText.n_wood}
                                            label="N_wood"
                                            onChange={handleResultChange}
                                            value={formData.n_wood ? formData.n_wood[currentMeasurementsTab] || '' : ''}

                                        />
                                    </div>
                                </div>
                                <div className='measurements-row'>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            sx={style}
                                            id="d13C_wood"
                                            helperText={errorText.d13C_wood}
                                            name="d13C_wood"
                                            label="d13C_wood"
                                            onChange={handleResultChange}
                                            value={formData.d13C_wood ? formData.d13C_wood[currentMeasurementsTab] || '' : ''}
                                        />
                                    </div>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            id="c_wood"
                                            name="c_wood"
                                            label="%C_wood"
                                            helperText={errorText.c_wood}
                                            sx={style}
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
                                            sx={style}
                                            id="d13C_cel"
                                            name="d13C_cel"
                                            label="d13C_cel"
                                            helperText={errorText.d13C_cel}
                                            onChange={handleResultChange}
                                            value={formData.d13C_cel ? formData.d13C_cel[currentMeasurementsTab] || '' : ''}
                                        />
                                    </div>
                                    <div className="quarter-width">
                                        <TextField
                                            size='small'
                                            fullWidth
                                            sx={style}
                                            id="c_cel"
                                            name="c_cel"
                                            label="%C_cel"
                                            helperText={errorText.c_cel}
                                            onChange={handleResultChange}
                                            value={formData.c_cel ? formData.c_cel[currentMeasurementsTab] || '' : ''}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                                            }}
                                        />
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
            <div id="review-and-submit">
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
                                    <span className="detail-name">d18O_wood</span>
                                    <span className='detail-value'>{formData.d18O_wood ? formData.d18O_wood[currentMeasurementsTab] || '' : ''}</span>
                                </div>
                                <div className='detail'>
                                    <span className="detail-name">{t('d15N_wood')}</span>
                                    <span className='detail-value'>{formData.d15N_wood ? formData.d15N_wood[currentMeasurementsTab] || '' : ''}</span>
                                </div>
                            </div>

                            <div className="detail-row">
                                <div className='detail'>
                                    <span className="detail-name">{t('n_wood')}</span>
                                    <span className='detail-value'>{formData.n_wood ? formData.n_wood[currentMeasurementsTab] || '' : ''}</span>
                                </div>
                                <div className='detail'>
                                    <span className="detail-name">{t('d13C_wood')}</span>
                                    <span className='detail-value'>{formData.d13C_wood ? formData.d13C_wood[currentMeasurementsTab] || '' : ''}</span>
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



    function userIsOnLastTab(): boolean {
        return currentTab === 4;
    }
    function shouldShowNextButton(): boolean {
        return currentTab < 3;
    }

    function shouldShowBackButton(): boolean {
        return currentTab !== 1 && !userIsOnLastTab();
    }

    function shouldShowCancelButton(): boolean {
        return !userIsOnLastTab();
    }
    function shouldShowActionItemButton(): boolean {
        return currentTab === 3 || !props.isNewSampleForm;
    }
    function handleReturnToDashboard() {
        router.push('/samples')
    }

    function backButton() {
        return (
            <div onClick={() => attemptToUpdateCurrentTab(currentTab - 1)} className='back-button-wrapper add-sample-button-wrapper'>
                <div className='add-sample-slate-layer'>
                    <div className='add-sample-button-text green-button-text'>{t('back')}</div>
                </div>
            </div>
        )
    }

    function cancelButton() {
        return (
            <div onClick={onCancleClick} className='add-sample-button-wrapper'>
                <div className='add-sample-slate-layer'>
                    <div className='add-sample-button-text green-button-text'>{t('cancel')}</div>
                </div>
            </div>
        )
    }

    function nextButton() {
        return (
            <div id="next-button-wrapper" onClick={() => attemptToUpdateCurrentTab(currentTab + 1)} className='add-sample-button-wrapper next-button-wrapper'>
                <div className='add-sample-slate-layer'>
                    <div className='add-sample-button-text white-button-text'>{t('next')}</div>
                </div>
            </div>
        )
    }

    function actionButton() {
        return (
            <div id="action-button" onClick={onActionButtonClick} className='add-sample-button-wrapper next-button-wrapper'>
                <div className='add-sample-slate-layer'>
                    <div className='add-sample-button-text white-button-text'>{props.actionButtonTitle}</div>
                </div>
            </div>
        )
    }



    return (
        <div className="add-sample-page-wrapper">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0&display=optional" />
            <div>
                <div id='sample-form'>
                    {<div className="add-sample-tab-bar">
                        <div className='add-sample-add-details-tab'>
                            <div className='add-sample-tab-number-wrapper'>
                                <div className='leading-divider'>
                                </div>
                                <div className={currentTab >= 1 ? "add-sample-current-tab-number add-sample-tab-number" : "add-sample-tab-number"}>
                                    1
                                </div>
                                <div className='trailing-divider'></div>
                            </div>
                            <div className='add-sample-tab-text-wrapper'>
                                <div className={currentTab >= 1 ? "dd-sample-current-tab-text add-sample-tab-text" : "add-sample-tab-text"}>
                                    {t('addDetails')}
                                </div>
                            </div>
                        </div>
                        <div className='divider-wrapper'><div className='divider'></div></div>

                        <div className='add-sample-add-details-tab'>
                            <div className='add-sample-tab-number-wrapper'>
                                <div className='leading-divider'>
                                </div>
                                <div className={currentTab >= 2 ? "add-sample-current-tab-number add-sample-tab-number" : "add-sample-tab-number"}>
                                    2
                                </div>
                                <div className='trailing-divider'></div>
                            </div>
                            <div className='add-sample-tab-text-wrapper'>
                                <div className={currentTab >= 2 ? "dd-sample-current-tab-text add-sample-tab-text" : "add-sample-tab-text"}>
                                    {t('addSampleMeasurements')}
                                </div>
                            </div>
                        </div>
                        <div className='divider-wrapper'><div className='divider'></div></div>

                        <div className='add-sample-add-details-tab'>
                            <div className='add-sample-tab-number-wrapper'>
                                <div className='leading-divider'>
                                </div>
                                <div className={currentTab === 3 ? "add-sample-current-tab-number add-sample-tab-number" : "add-sample-tab-number"}>
                                    3
                                </div>
                                <div className='trailing-divider'></div>
                            </div>
                            <div className='add-sample-tab-text-wrapper'>
                                <div className={currentTab === 3 ? "dd-sample-current-tab-text add-sample-tab-text" : "add-sample-tab-text"}>
                                    {t('reviewAndCreate')}
                                </div>
                            </div>
                        </div>

                    </div>}

                    <div>
                        {currentTab === 1 && basicInfoTab()}
                        {currentTab === 2 && sampleMeasurementsTab()}
                        {currentTab === 3 && reviewAndSubmitTab()}
                        {/* {currentTab === 4 && createSampleTab()} */}
                    </div>
                </div>
            </div>
            <div className='submit-buttons'>
                <div>
                    {shouldShowCancelButton() &&
                        cancelButton()}
                </div>
                <div className='submit-buttons-right'>
                    {shouldShowBackButton() && backButton()}
                    {shouldShowNextButton() && nextButton()}
                    {shouldShowActionItemButton() && actionButton()}
                    {userIsOnLastTab() && <button type="button" onClick={handleReturnToDashboard} className="btn btn-primary">Return to dashboard</button>}
                </div>
            </div>
        </div>
    )
}