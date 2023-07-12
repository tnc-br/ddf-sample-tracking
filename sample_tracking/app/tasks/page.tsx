"use client";

// import { initializeApp } from "firebase/app";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation'
import Nav from '../nav';
// import { firebaseConfig } from '../firebase_config';

export default function Tasks() {
  const router = useRouter();

  console.log('tasks');


  // Initialize Firebase and declare "global" variables. all variables declared in this section are accessible to functions that follow.
  // const app = initializeApp(firebaseConfig);
  // const auth = getAuth();
  // onAuthStateChanged(auth, (user) => {
  //   if (!user) {
  //     console.log('User not logged in');
  //     router.push('/login');
  //   }
  // });
  return (
    <div>
      <div>
        <Nav />
      </div>
      <h1>My Tasks!</h1>
    </div>
  )
}
