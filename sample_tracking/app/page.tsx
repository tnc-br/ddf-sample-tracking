"use client";

import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.css';
import { useState, useEffect } from 'react';

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { useRouter } from 'next/navigation'
import { initializeAppIfNecessary } from './utils';

import './i18n/config';

export default function Home() {

  const router = useRouter()

  const app = initializeAppIfNecessary();
  const auth = getAuth();
  const user = auth.currentUser;


  useEffect(() => {
    if (user) {
      router.push('/samples');
    } else {
      router.push('/login');
    }
  });


}
