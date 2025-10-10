export type Sample = {
  code_lab: string
  visibility: string
  sample_name: string
  species: string
  site: string
  date_of_harvest: string
  created_by: string
  current_step: string
  status: string
  trusted: string
  created_on: string
  last_updated_by: string
  org: string
  org_name: string
  validity?: string
  header: string
  doc_id: string
  updated_state: boolean
  collected_by: string
  supplier: string
  measureing_height: string
  sample_type: string
  diameter: string
  observations: string
  created_by_name: string
  last_updated_by_photo: string
  measurements: {}
  points?: []
  request: string
  validity_details?: ValidityDetails

  lat: string
  lon: string
  state: string
  city: string
  municipality?: string

  oxygen: string[]
  nitrogen: string[]
  n_wood: string[]
  carbon: string[]
  c_wood: string[]
  c_cel: string[]
  d13C_cel: string[]
  d18O_cel: string[]
}

export type ValidityDetails = {
  p_value: number
  p_value_threshold: number
  d18O_cel_sample_mean: number
  d18O_cel_sample_variance: number
  d18O_cel_reference_mean: number
  d18O_cel_reference_variance: number
  reference_oxygen_isoscape_creation_date: string
  reference_oxygen_isoscape_name: string
  reference_oxygen_isoscape_precision: string
  reference_oxygen_isoscape_recall: string
}

export enum ValidityStatus {
  Possible = 'possibleLabel', // Indicates that the sample is possibly from the specified location.
  NotLikely = 'notLikelyLabel', // Indicates that the sample is unlikely to be from the specified location.
  Trusted = 'trustedLabel', // Indicates that the sample is trusted to be from the specified location.
  Undetermined = 'undeterminedLabel', // Default value for untrusted sample if the sample's validity has not been determined (e.g. if the cloud function failed to run)
}

export type SampleError = {
  errorType: string
  fieldWithError: string
  errorString: string
}

const resultRanges = {
  d18O_cel: {
    min: 20,
    max: 32,
  },
  d18O_wood: {
    min: 20,
    max: 32,
  },
  d15N_wood: {
    min: -5,
    max: 15,
  },
  n_wood: {
    min: 0,
    max: 1,
  },
  d13C_wood: {
    min: -38,
    max: 20,
  },
  c_wood: {
    min: 40,
    max: 60,
  },
  d13C_cel: {
    min: -35,
    max: -20,
  },
  c_cel: {
    min: 40,
    max: 60,
  },
  lat: {
    min: -90,
    max: 90,
  },
  lon: {
    min: -180,
    max: 180,
  },
}
