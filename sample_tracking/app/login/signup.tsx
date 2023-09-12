
import { useState } from 'react';
import { useRouter } from 'next/navigation'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDocs, collection, getFirestore, updateDoc, addDoc, setDoc } from "firebase/firestore";
import { TextField, Autocomplete, MenuItem, InputAdornment } from '@mui/material';
import {ConfirmationBox, ConfirmationProps} from '../confirmation_box';
import { useTranslation } from 'react-i18next';


interface SignUpProps {
    onLogInClick: any,
}

type SignUpData = {
    firstName: string,
    lastName: string,
    lab: string,
    labName: string,
}

interface NestedSchemas {
    [key: string]: NestedSchemas | string;
}

interface OrgsSchemas {
    [key: string]: string;
}

type NewUser = {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
    date_requested: string,
    org: string,
    uid: string,
    orgName: string,
    newOrgName: string,
}

/**
 * Component to handle signing a user up using Firebase auth. When a user signs up they are added to the 'new_users' collection. 
 * If a user is trying to register a new organization, they are added to the 'new_orgs' document in the 'new_users' collection. 
 * This data will then be fetched by admins in the SignUpRequests component to be approved/rejected. 
 */
export default function SignUp(props: SignUpProps) {

    const [formData, setFormData] = useState({} as NewUser);
    const [signUpTab, setSignUpTab] = useState(0);
    const [signUpData, setSignUpData] = useState({
        firstName: '',
        lastName: '',
        lab: '',
        labName: ''
    });
    const [availableOrgs, setAvailableOrgs] = useState({} as OrgsSchemas);
    const [errorText, setErrorText] = useState({} as NewUser)
    const [confirmationBoxData, setConfirmationBoxData] = useState(null as ConfirmationProps | null);

    function updateSignUpData(signUpData: SignUpData) {
        setSignUpData(signUpData);
    }

    const auth = getAuth();
    const db = getFirestore();
    const router = useRouter()
    const { t } = useTranslation();

    if (Object.keys(availableOrgs).length < 1) {
        const orgs: OrgsSchemas = {};
        getDocs(collection(db, "organizations")).then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                orgs[docData['org_name']] = doc.id;
            });
            orgs["Create new organization"] = "NEW";
            setAvailableOrgs(orgs as OrgsSchemas);
        });
    }

    async function handleSignUpButtonClicked() {

        setErrorText({} as NewUser)

        const accountInfo = document.getElementById('account-info');
        if (!accountInfo.checkValidity()) {
            accountInfo.reportValidity();
            return;
        }
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.orgName) {
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setErrorText({
                ...errorText,
                confirmPassword: t('passwordsDontMatch')
            })
            return;
        }

        const newOrgName = formData.newOrgName ? formData.newOrgName : null;
        const orgName = formData.orgName;
        const name = `${formData.firstName} ${formData.lastName}`;
        const labValue = orgName ? availableOrgs[orgName] : '';

        await createUserWithEmailAndPassword(auth, formData.email, formData.password).catch((error) => {
            console.log(error);
            switch (error.code) {
                case 'auth/weak-password':
                    setErrorText({
                        ...errorText,
                        password: error.message.substring(error.message.indexOf(':') + 2, error.message.indexOf('('))
                    })
                case 'auth/email-already-exists':
                    setErrorText({
                        ...errorText,
                        email: error.message.substring(error.message.indexOf(':') + 2, error.message.indexOf('('))
                    })
                default:
                    const cancelFunction = () => {
                        setConfirmationBoxData(null);
                    }
                    const title = `${t('errorCreatingAccount')} + ${error.message}`;
                    const actionButtonTitle = t('confirm');
                    setConfirmationBoxData({
                        title: title,
                        actionButtonTitle: actionButtonTitle,
                        onCancelButtonClick: cancelFunction,
                    })
            }
            return;
        })
        const user = auth.currentUser;
        if (!user) return;
        await updateProfile(auth.currentUser, {
            displayName: name,
        });

        const date = new Date();
        const dateString = `${date.getMonth() + 1} ${date.getDate()} ${date.getFullYear()}`;
        if (newOrgName) {
            const newOrgDoc = doc(db, "new_users", "new_orgs");
            let newObj: NestedSchemas = {};
            newObj[newOrgName] = {
                admin_id: auth.currentUser!.uid,
                admin_name: name,
                email: formData.email,
                date_requested: dateString,
            }
            updateDoc(newOrgDoc, newObj);
        } else {
            const newDocRef = doc(db, "new_users", auth.currentUser!.uid);
            setDoc(newDocRef, {
                name: name,
                email: formData.email,
                date_requested: dateString,
                org: labValue,
                uid: auth.currentUser!.uid,
                org_name: orgName
            });
        }
        router.push('/samples');
    }

    function handleChange(evt: any) {
        let value = evt.target.value;
        value = value === "Create new organization" ? "NEW" : value;
        const newFormData = {
            ...formData,
            [evt.target.name]: value
        }
        setFormData(newFormData);
    }

    function handleNextClick() {
        const detailsForm = document.getElementById('details-tab');
        if (!detailsForm) return;
        if (!detailsForm.checkValidity()) {
            detailsForm.reportValidity();
        } else {
            setSignUpTab(1);
        }

    }

    function yourDetailsTab() {
        return (
            <form
                autoComplete="off"
                id="details-tab">
                <p className="forgot-password-header">Sign up</p>
                <div className="login-input-wrapper">
                    <TextField
                        size='small'
                        fullWidth
                        required
                        id="firstName"
                        name="firstName"
                        label="First name"
                        value={formData.firstName}
                        onChange={(evt: any) => handleChange(evt)}
                    />
                </div>
                <div className="login-input-wrapper">
                    <TextField
                        size='small'
                        fullWidth
                        required
                        id="lastName"
                        name="lastName"
                        label="Last name"
                        value={formData.lastName}
                        onChange={(evt: any) => handleChange(evt)}
                    />
                </div>
                <div className='input-text-field-wrapper'>
                    <TextField
                        id="orgName"
                        size='small'
                        fullWidth
                        select
                        required
                        name="orgName"
                        label="Organization"
                        onChange={(evt: any) => handleChange(evt)}
                    // value={formData.trusted ? formData.trusted : "unknown"}
                    >
                        {Object.keys(availableOrgs).map((orgValue: string) => (
                            <MenuItem key={orgValue} value={orgValue}>
                                {orgValue}
                            </MenuItem>
                        ))}
                    </TextField>
                </div>
                <div onClick={handleNextClick} className="forgot-password-button-wrapper">
                    <div className="forgot-password-button">
                        <div className='forgot-password-button-text'>
                            Next
                        </div>
                    </div>
                </div>
            </form>
        )
    }

    function accountInfo() {
        return (
            <form 
            autoComplete="off"
            id="account-info">
                <p className="forgot-password-header">
                    <span onClick={() => setSignUpTab(0)} className="material-symbols-outlined back-arrow">
                        arrow_back
                    </span>Sign up</p>
                {formData['orgName'] === "NEW" &&
                    <div className="login-input-wrapper">
                        <TextField
                            size='small'
                            fullWidth
                            required
                            id="newOrgName"
                            name="newOrgName"
                            label="New org name"
                            value={formData.newOrgName}
                            onChange={(evt: any) => handleChange(evt)}
                        />
                    </div>
                }
                <div className="login-input-wrapper">
                    <TextField
                        size='small'
                        fullWidth
                        required
                        id="email"
                        name="email"
                        label="Email"
                        helperText={errorText.email}
                        value={formData.email}
                        onChange={(evt: any) => handleChange(evt)}
                    />
                </div>
                <div className="login-input-wrapper">
                    <TextField
                        size='small'
                        fullWidth
                        required
                        type="password"
                        id="password"
                        helperText={errorText.password}
                        name="password"
                        label="Password"
                        onChange={(evt: any) => handleChange(evt)}
                    />
                </div>
                <div className="login-input-wrapper">
                    <TextField
                        size='small'
                        fullWidth
                        required
                        type="password"
                        id="confirmPassword"
                        helperText={errorText.confirmPassword}
                        name="confirmPassword"
                        label="Confirm password"
                        onChange={(evt: any) => handleChange(evt)}
                    />
                </div>
                <div onClick={handleSignUpButtonClicked} className="forgot-password-button-wrapper">
                    <div className="forgot-password-button">
                        <div className='forgot-password-button-text'>
                            Sign up
                        </div>
                    </div>
                </div>
            </form>
        )
    }


    return (
        <div className='signup-wrapper'>
            {signUpTab === 0 ? yourDetailsTab() : accountInfo()}
            {confirmationBoxData && <ConfirmationBox {...confirmationBoxData} />}
        </div>
    )

}
