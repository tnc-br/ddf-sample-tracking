import { TextField, MenuItem, InputAdornment } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface SampleMeasurementsTabProps {
  handleChange: any
  formData: any
  sampleTypeValues: any
  handleAddMeasurementClick: any
  handleMeasurementsTabClick: any
  numMeasurements: number
  errorText: any
  currentMeasurementsTab: number
  handleResultChange: any
}

function SampleMeasurementsTab({
  handleChange,
  formData,
  sampleTypeValues,
  handleAddMeasurementClick,
  handleMeasurementsTabClick,
  numMeasurements,
  errorText,
  currentMeasurementsTab,
  handleResultChange,
}: SampleMeasurementsTabProps) {
  const { t } = useTranslation()

  const style = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: 'green',
      },
    },
  }

  return (
    <form id="sample-measurements">
      <div className="sample-measurements-overview">
        <div className="sample-measurements-overview-row">
          <div className="input-text-field-wrapper half-width">
            <TextField
              size="small"
              fullWidth
              id="supplier"
              name="measureing_height"
              label={t('measuringHeight')}
              sx={style}
              onChange={handleChange}
              value={formData.measureing_height}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">cm</InputAdornment>
                ),
              }}
            />
          </div>

          <div className="input-text-field-wrapper half-width">
            <TextField
              id="sample_type"
              size="small"
              fullWidth
              sx={style}
              select
              name="sample_type"
              label={t('sampleType')}
              onChange={handleChange}
              value={formData.sample_type ? formData.sample_type : ''}
            >
              {Object.keys(sampleTypeValues).map((sampleTypeLabel: string) => (
                <MenuItem
                  key={sampleTypeLabel}
                  value={sampleTypeValues[sampleTypeLabel]}
                >
                  {sampleTypeLabel}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </div>
        <div className="sample-measurements-overview-row">
          <div className="input-text-field-wrapper half-width">
            <TextField
              size="small"
              fullWidth
              id="supplier"
              name="diameter"
              label={t('diameter')}
              onChange={handleChange}
              value={formData.diameter}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">cm</InputAdornment>
                ),
              }}
              sx={style}
            />
          </div>
          <div className="input-text-field-wrapper half-width">
            <TextField
              size="small"
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
        <div className="sample-measurements-overview-row">
          <div className="input-text-field-wrapper half-width">
            <TextField
              size="small"
              fullWidth
              id="mean_annual_temperature"
              sx={style}
              name="mean_annual_temperature"
              label={t('meanAnnualTemperature')}
              onChange={handleChange}
              value={formData.mean_annual_temperature}
            />
          </div>
          <div className="input-text-field-wrapper half-width">
            <TextField
              size="small"
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
        <div className="sample-measurements-overview-row">
          <div className="input-text-field-wrapper full-width">
            <TextField
              size="small"
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
        <div className="sample-measurements-instructions">
          Enter all the measurements of at least 1 sample to continue
        </div>
        <div onClick={handleAddMeasurementClick} className="button">
          <div className="add-measurement-button-wrapper">
            <span className="material-symbols-outlined">add</span>
            <span className="add-measurement-button-text">Add measurement</span>
          </div>
        </div>
        <div className="measurements-table">
          <div className="measurements-table-tabs">
            <div className="measurements-table-tabs-group">
              {Array.from({ length: numMeasurements }, (_, index) => (
                <div key={index} onClick={handleMeasurementsTabClick}>
                  <div
                    className={
                      currentMeasurementsTab === index
                        ? 'selected-measurements-tab-wrapper measurements-tab-wrapper'
                        : 'measurements-tab-wrapper'
                    }
                  >
                    <div className="measurements-tab-state-layer">
                      <div className="measurements-tab-contents">
                        <div
                          id={index.toString()}
                          className="measurements-tab-text"
                        >
                          Measurement {index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="measurements-entry-wrapper">
              <div className="measurements-row">
                <div className="quarter-width">
                  <TextField
                    size="small"
                    sx={style}
                    fullWidth
                    id="d18O_cel"
                    name="d18O_cel"
                    label={t('d18O_cel')}
                    helperText={errorText.d18O_cel}
                    onChange={handleResultChange}
                    value={
                      formData.d18O_cel
                        ? formData.d18O_cel[currentMeasurementsTab] || ''
                        : ''
                    }
                  />
                </div>
                <div className="quarter-width">
                  <TextField
                    size="small"
                    sx={style}
                    fullWidth
                    id="d18O_wood"
                    name="d18O_wood"
                    label="d18O_wood"
                    helperText={errorText.d18O_wood}
                    onChange={handleResultChange}
                    value={
                      formData.d18O_wood
                        ? formData.d18O_wood[currentMeasurementsTab] || ''
                        : ''
                    }
                  />
                </div>
                <div className="quarter-width">
                  <TextField
                    size="small"
                    fullWidth
                    id="d15N_wood"
                    sx={style}
                    name="d15N_wood"
                    helperText={errorText.d15N_wood}
                    label="d15N_wood"
                    onChange={handleResultChange}
                    value={
                      formData.d15N_wood
                        ? formData.d15N_wood[currentMeasurementsTab] || ''
                        : ''
                    }
                  />
                </div>
                <div className="quarter-width">
                  <TextField
                    size="small"
                    fullWidth
                    id="n_wood"
                    sx={style}
                    name="n_wood"
                    helperText={errorText.n_wood}
                    label="N_wood"
                    onChange={handleResultChange}
                    value={
                      formData.n_wood
                        ? formData.n_wood[currentMeasurementsTab] || ''
                        : ''
                    }
                  />
                </div>
              </div>
              <div className="measurements-row">
                <div className="quarter-width">
                  <TextField
                    size="small"
                    fullWidth
                    sx={style}
                    id="d13C_wood"
                    helperText={errorText.d13C_wood}
                    name="d13C_wood"
                    label="d13C_wood"
                    onChange={handleResultChange}
                    value={
                      formData.d13C_wood
                        ? formData.d13C_wood[currentMeasurementsTab] || ''
                        : ''
                    }
                  />
                </div>
                <div className="quarter-width">
                  <TextField
                    size="small"
                    fullWidth
                    id="c_wood"
                    name="c_wood"
                    label="%C_wood"
                    helperText={errorText.c_wood}
                    sx={style}
                    onChange={handleResultChange}
                    value={
                      formData.c_wood
                        ? formData.c_wood[currentMeasurementsTab] || ''
                        : ''
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div className="quarter-width">
                  <TextField
                    size="small"
                    fullWidth
                    sx={style}
                    id="d13C_cel"
                    name="d13C_cel"
                    label="d13C_cel"
                    helperText={errorText.d13C_cel}
                    onChange={handleResultChange}
                    value={
                      formData.d13C_cel
                        ? formData.d13C_cel[currentMeasurementsTab] || ''
                        : ''
                    }
                  />
                </div>
                <div className="quarter-width">
                  <TextField
                    size="small"
                    fullWidth
                    sx={style}
                    id="c_cel"
                    name="c_cel"
                    label="%C_cel"
                    helperText={errorText.c_cel}
                    onChange={handleResultChange}
                    value={
                      formData.c_cel
                        ? formData.c_cel[currentMeasurementsTab] || ''
                        : ''
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
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

export default SampleMeasurementsTab
