"use client";

import { FormEvent, useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [emailMessage, setEmailMessage] = useState(false)

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
        const auth = getAuth();
        sendPasswordResetEmail(auth, email)
          .then(() => {
            setEmailMessage(true);
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
          });
        
    } catch (error:any) {    
      if (error.code === 'auth/user-not-found') {
        alert('User not found, try again!')
        setEmail('')
      }
    }
  };
  
  return (
    <div>
      {
        emailMessage ?
        <h3>The Email has been sent; Check your Inbox!</h3> : 
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            name="email"
            placeholder="name@email.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div>
            <button type='submit'>Reset Your Password</button>
          </div>
        </form>
      }
    </div>
  )
}

export default ForgotPassword
