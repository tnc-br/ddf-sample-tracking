import { render, screen, fireEvent } from '@testing-library/react'
import Login from '../app/login/login';
import '@testing-library/jest-dom'
import { signInWithEmailAndPassword, getAuth, signInWithPopup } from "firebase/auth";
import { doc, collection, getFirestore, addDoc, getDoc } from "firebase/firestore";
// import { useRouter } from 'next/navigation'
import { useRouter } from 'next/navigation'



jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('next/navigation');

describe('Login', () => {


  it('sign in button click forwards email/pass to firebase auth', () => {
    const push = jest.fn();
    useRouter.mockImplementation(() => ({
      push,
    }));
    const onForgotPasswordClick = () => console.log("test");
    const mockedSignIn = jest.mocked(signInWithEmailAndPassword);
    const mockGetAuth = jest.mocked(getAuth);
    const mockGetFirestore = jest.mocked(getFirestore);
    const mockUseRouter = jest.mocked(useRouter);
    mockGetAuth.mockResolvedValue(Promise.resolve("TestAuth"));
    mockedSignIn.mockResolvedValue(Promise.resolve("Test"));
    mockGetFirestore.mockResolvedValue(Promise.resolve("Test"));

    render(<Login onLoginClick={onLoginClick} onForgotPasswordClick={onForgotPasswordClick} />)

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const signInButton = document.getElementById('signInButton');

    fireEvent.change(emailInput, { target: { value: "testEmail"}});
    fireEvent.change(passwordInput, { target: { value: "testPassword"}});
    fireEvent.click(signInButton);
    expect(mockedSignIn.mock.calls[0][1]).toEqual("testEmail");
    expect(mockedSignIn.mock.calls[0][2]).toEqual("testPassword");
  });


  it('google sign in button opens popup', () => {

    const onLoginClick = () => console.log("test");
    const onForgotPasswordClick = () => console.log("test");
    const mockedSignInWithPopup = jest.mocked(signInWithPopup);
    const mockGetAuth = jest.mocked(getAuth);
    const mockGetFirestore = jest.mocked(getFirestore);
    mockGetAuth.mockResolvedValue(Promise.resolve("TestAuth"));
    mockedSignInWithPopup.mockResolvedValue(Promise.resolve("Test"));
    mockGetFirestore.mockResolvedValue(Promise.resolve("Test"));

    render(<Login onLoginClick={onLoginClick} onForgotPasswordClick={onForgotPasswordClick} />)

    const signInButton = document.getElementById('googleSignInButton');
    fireEvent.click(signInButton);
    expect(mockedSignInWithPopup).toHaveBeenCalled();
  });

  
})