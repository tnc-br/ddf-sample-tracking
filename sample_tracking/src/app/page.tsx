"use client";

import "bootstrap/dist/css/bootstrap.css";
import { useEffect } from "react";

import { getAuth, onAuthStateChanged } from "firebase/auth";

import { useRouter } from "next/navigation";
import { initializeAppIfNecessary } from "../old_components/utils";

import "../i18n/config";

export default function Home() {
  const router = useRouter();

  const app = initializeAppIfNecessary();
  const auth = getAuth();
  const user = auth.currentUser;
  console.log("app");
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
