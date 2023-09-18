import { initializeApp, getApp } from "firebase/app";
import { firebaseConfig } from './firebase_config';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged, type Auth, type User } from "firebase/auth";
import { useRouter } from 'next/navigation'
import { getDoc, doc, type Firestore, type DocumentReference } from "firebase/firestore";
import { useSearchParams } from 'next/navigation'
import { getAnalytics, isSupported } from "firebase/analytics";

export type UserData = {
  name: string,
  org: string,
  org_name: string,
  role: string,
  user_id: string,
  email: string,
  date_added: string,
  photoUrl: string,
}

export type Sample = {
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
  org_name: string,
  validity: number,
  header: string,
  doc_id: string,
  updated_state: boolean,
  collected_by: string,
  oxygen: string[],
  nitrogen: string[],
  n_wood: string[],
  carbon: string[],
  c_wood: string[],
  c_cel: string[],
  d13C_cel: string[],
  d18O_cel: string[]
  city: string,
  supplier: string,
  measureing_height: string,
  sample_type: string,
  diameter: string,
  observations: string,
  created_by_name: string,
  last_updated_by_photo: string,
  measurements: {},
  points?: [],
  request: string
}

export type ErrorMessages = {
  originValueError: string,
  originValueRequired: string,
  latLonRequired: string,
  ShouldBeWithinRange: string,
  shouldBeWithinTheRange: string,
  and: string
}

export interface NestedSchemas {
  [key: string]: NestedSchemas;
}

const resultRanges = {
  'd18O_cel': {
    'min': 20,
    'max': 32
  },
  'd18O_wood': {
    'min': 20,
    'max': 32
  },
  'd15N_wood': {
    'min': -5,
    'max': 15
  },
  'n_wood': {
    'min': 0,
    'max': 1
  },
  'd13C_wood': {
    'min': -38,
    'max': 20
  },
  'c_wood': {
    'min': 40,
    'max': 60
  },
  'd13C_cel': {
    'min': -35,
    'max': -20
  },
  'c_cel': {
    'min': 40,
    'max': 60
  },
}

export const resultValues = ['d18O_wood', 'd15N_wood', 'n_wood', 'd13C_wood', 'c_wood', 'c_cel', 'd13C_cel']


export function getRanHex(size: number): string {
  let result = [];
  let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

  for (let n = 0; n < size; n++) {
    result.push(hexRef[Math.floor(Math.random() * 16)]);
  }
  return result.join('');
}


export function initializeAppIfNecessary() {
  try {
    getApp();
  } catch (any) {
    const app = initializeApp(getFirebaseConfig());
    isSupported().then((isSupported: boolean) => {
      if (isSupported && isProd()) {
        const analytics = getAnalytics(app);
      }
    });
  }
}


export function showNavBar() {
  const navBar = document.getElementById('nav-wrapper');
  if (navBar) {
    navBar.style.display = "block";
  }
}

export function showTopBar() {
  const navBar = document.getElementById('top-bar-wrapper');
  if (navBar) {
    navBar.style.display = "block";
  }

}

export function hideTopBar() {
  const navBar = document.getElementById('top-bar-wrapper');
  if (navBar) {
    navBar.style.display = "none";
  }

}

export function hideNavBar() {
  const navBar = document.getElementById('nav-wrapper');
  if (navBar) {
    navBar.style.display = "none";
  }
}

export function verifyLatLonFormat(input: string) {
  return input.charAt(2) === '.' && input.length > 3;
}

export function confirmUserLoggedIn(user: User | null, db: Firestore, router: any, requredRoles?: string[]): UserData {
  if (!user) {
    router.push('/login');
  } else {
    const userDocRef = doc(db, "users", user.uid);
    getDoc(userDocRef).then((docRef) => {
      if (docRef.exists()) {
        const docData = docRef.data();
        if (!docData.role) {
          router.push('/login');
        } else {
          if (requredRoles) {
            if (requredRoles.includes(docData.org)) {
              return docData as UserData
            } else {
              router.push('/login');
            }
          }
          return docData as UserData;
        }
      } else {
        return {
          name: user.displayName ? user.displayName : '',
        } as UserData;
      }
    });
  }
  // This code will never run because the user will either be navigated to the login screen or the user data will be returned.
  return {} as UserData;
}

export function getDocRefForTrustedValue(trusted: string, db: Firestore, sampleId: string): DocumentReference {
  let docRef = doc(db, "trusted_samples", sampleId!);
  if (trusted === 'untrusted') {
    docRef = doc(db, "untrusted_samples", sampleId!);
  } else if (trusted === 'unknown') {
    docRef = doc(db, "unknown_samples", sampleId!);
  }
  return docRef;
}


export function validateImportedEntry(data: {}, errorMessages: ErrorMessages): string {
  let errors = '';
  const headers = Object.keys(data);
  headers.forEach((header: string) => {
    if (!Object.keys(resultRanges).includes(header)) return;
      const value = parseFloat(data[header])
      if (value < resultRanges[header].min || value > resultRanges[header].max) {
        errors += `${header} ${errorMessages.ShouldBeWithinRange} ${resultRanges[header].min} ${errorMessages.and} ${resultRanges[header].max}, `;
      }
  })
  if (!headers.includes('lat') || !headers.includes('lon')) {
    errors += errorMessages.latLonRequired
  }
  if (!headers.includes('origin')) {
    errors += errorMessages.originValueRequired
  } else {
    if (!['known', 'unknown', 'uncertain'].includes(data.origin)) {
      errors += errorMessages.originValueError
    }
  }
  return errors;
}

export function getMaxLength(formSampleData: Sample): number {
  let maxValue = 0;
  resultValues.forEach((resultValue: string) => {
      if (formSampleData[resultValue]) {
          if (formSampleData[resultValue].length > maxValue) maxValue = formSampleData[resultValue].length;
      }
  });
  return maxValue;
}

export function getPointsArrayFromSampleResults(formSampleData: Sample): Sample[] {
  const maxValue = getMaxLength(formSampleData);
  let pointsArray: Sample[] = [];
  for (let i = 0; i < maxValue; i ++) {
      const currPoint = {} as Sample;
      resultValues.forEach((value: string) => {
          if (formSampleData[value] && formSampleData[value][i]) {
              currPoint[value] = formSampleData[value][i];
          }
      })
      pointsArray.push(currPoint);
  }
  return pointsArray;
}

function getFirebaseConfig() {
  if (isProd()) {
    return {
      apiKey: "AIzaSyCL4GG0mZY4BJsYnl5wCsyIVGWi5ktPeoc",
      authDomain: "timberid-prd.firebaseapp.com",
      projectId: "timberid-prd",
      storageBucket: "timberid-prd.appspot.com",
      messagingSenderId: "307233236699",
      appId: "1:307233236699:web:0b57cf72749fd233714efe",
      measurementId: "G-Q6QNTJ98R2"
    };
  } else {
    return {
      apiKey: "AIzaSyCgLUyR-rGuT2qbHgPsJ8l0mG_u6S7keHg",
      authDomain: "river-sky-386919.firebaseapp.com",
      projectId: "river-sky-386919",
      storageBucket: "river-sky-386919.appspot.com",
      messagingSenderId: "843836318122",
      appId: "1:843836318122:web:856d513c850325a32b8bd3"
    };
  }
}

function isProd(): boolean {
  if (typeof window !== "undefined") {
    const href = window.location.href;
    return href.includes('timberid.org') && !href.includes('testing');
  }
  return false;
}


