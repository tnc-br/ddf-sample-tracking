import './styles.css';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import Image from 'next/image'

interface ForgotPasswordProps {
    returnToSignInClick: any
}

export default function ForgotPassword(props: ForgotPasswordProps) {

    const [emailSent, setEmailSent] = useState(false);

    function handleSubmitButtonClick() {
        const emailForm = document.getElementById('email-form');
        if (!emailForm) return;
        if (!emailForm.checkValidity()) emailForm.reportValidity();
        const email = document.getElementById('email').value;
        if (!email) return;
        const auth = getAuth();
        sendPasswordResetEmail(auth, email).then(() => {
            setEmailSent(true);
        });
    }

    function handleReturnClick() {
        props.returnToSignInClick();
    }

    return (
        <div className="forgot-password-wrapper">
            {emailSent ?
                <div>
                    <p>Check your email for an email to reset your password.</p>
                    <div className="forgot-password-button-wrapper">
                        <div className="forgot-password-button">
                            <div onClick={props.returnToSignInClick ? props.returnToSignInClick : console.log("Error: unable to return to login screen")}
                                className='forgot-password-button-text'>
                                Return to login screen
                            </div>
                        </div>
                    </div>
                </div>
                :
                <div>
                    <p className="forgot-password-header"><span onClick={handleReturnClick} className="material-symbols-outlined back-arrow">
                        arrow_back
                    </span>Forgot password</p>
                    <div className="forgot-password-entry-wrapper">
                        <div className="forgot-password-entry">
                            <div className="forgot-password-slate-entry">
                                <div className="forgot-password-content-wrapper">
                                    <div className="forgot-password-input-text">
                                        <form id="email-form">
                                            <input required className="forgot-password-text form-control" name='email' type="text" id="email" />
                                        </form>
                                    </div>
                                    <div className="forgot-passowrd-label-text-wrapper">
                                        <div className="forgot-password-label-text">
                                            Email address
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="forgot-password-button-wrapper">
                        <div className="forgot-password-button">
                            <div onClick={handleSubmitButtonClick} className='forgot-password-button-text'>
                                Submit
                            </div>
                        </div>
                    </div>
                </div>
            }

        </div>
    )
}