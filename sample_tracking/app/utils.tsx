import { initializeApp, getApp } from "firebase/app";
import { firebaseConfig } from './firebase_config';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged, type Auth, type User } from "firebase/auth";
import { useRouter } from 'next/navigation'
import { getDoc, doc, type Firestore, type DocumentReference } from "firebase/firestore";
import { useSearchParams } from 'next/navigation'

export type UserData = {
  name: string,
  org: string,
  org_name: string,
  role: string,
  user_id: string,
  email: string,
  date_added: string,
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
}


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
    return getApp();
  } catch (any) {
    return initializeApp(firebaseConfig);
  }
}


export function showNavBar() {
    const navBar = document.getElementById('nav-wrapper');
    if (navBar) {
      navBar.style.display = "inline";
    }
}

export function showTopBar() {
    const navBar = document.getElementById('top-bar');
    if (navBar) {
      navBar.style.display = "inline";
    }

}

export function hideTopBar() {
    const navBar = document.getElementById('top-bar');
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