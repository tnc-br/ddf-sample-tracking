import "./styles.css";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { TextField } from "@mui/material";
import { MdArrowBack } from "react-icons/md";

interface ForgotPasswordProps {
  returnToSignInClick: any;
}

/**
 * Component to handle resetting a user's password. Uses Firebase
 * auth to send password reset email to the specified email.
 */
export default function ForgotPassword(props: ForgotPasswordProps) {
  const [emailSent, setEmailSent] = useState(false);

  function handleSubmitButtonClick() {
    const emailForm = document.getElementById("email-form");
    if (!emailForm) return;
    if (!emailForm.checkValidity()) emailForm.reportValidity();
    const email = document.getElementById("email").value;
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
      {emailSent ? (
        <div>
          <p>Check your email for an email to reset your password.</p>
          <div className="forgot-password-button-wrapper">
            <div className="forgot-password-button">
              <div
                onClick={
                  props.returnToSignInClick
                    ? props.returnToSignInClick
                    : console.log("Error: unable to return to login screen")
                }
                className="forgot-password-button-text"
              >
                Return to login screen
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex gap-2 items-center text-lg">
            <MdArrowBack
              className="cursor-pointer"
              onClick={handleReturnClick}
            />
            <span>Esqueci a senha</span>
          </div>
          <form id="email-form">
            <div className="login-input-wrapper">
              <TextField
                size="small"
                fullWidth
                required
                id="email"
                name="email"
                label="Email address"
              />
            </div>
          </form>
          <div className="forgot-password-button-wrapper">
            <div className="forgot-password-button">
              <div
                onClick={handleSubmitButtonClick}
                className="forgot-password-button-text"
              >
                Enviar
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
