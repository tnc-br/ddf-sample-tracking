"use client";

import Image from "next/image";
import "bootstrap/dist/css/bootstrap.css";
import { useState, useEffect } from "react";

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { useRouter } from "next/navigation";
import { initializeAppIfNecessary } from "./utils";

import "./i18n/config";

export default function Home() {
  const router = useRouter();

  const app = initializeAppIfNecessary();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/samples");
        return;
      }

      router.push("/login");
    });
  });

  return <div className="initalLoadBackground"></div>;
}
