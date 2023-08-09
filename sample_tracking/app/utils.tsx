import { initializeApp, getApp } from "firebase/app";
import { firebaseConfig } from './firebase_config';
import { useEffect } from 'react';

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