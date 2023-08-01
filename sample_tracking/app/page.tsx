"use client";

import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from 'react';

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { useRouter } from 'next/navigation'

export default function Home() {

  const router = useRouter()

  const firebaseConfig = {
    apiKey: "AIzaSyASFtrckNCPqk0bxDkHFmAHjydv5UkmqNA",
    authDomain: "kazob-370920.firebaseapp.com",
    projectId: "kazob-370920",
    storageBucket: "kazob-370920.appspot.com",
    messagingSenderId: "384214782537",
    appId: "1:384214782537:web:f973405706709459a9a598"
  };


  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    router.replace('/tasks');
  } else {
    router.replace('/login');
  }

}
