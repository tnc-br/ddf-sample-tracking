
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDocs, collection, getFirestore, updateDoc, addDoc, setDoc } from "firebase/firestore";
import { TextField, Autocomplete, MenuItem, InputAdornment } from '@mui/material';


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

    function updateSignUpData(signUpData: SignUpData) {
        setSignUpData(signUpData);
    }

    const auth = getAuth();
    const db = getFirestore();
    const router = useRouter()

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

    useEffect(() => {
        if (signUpTab === 1) {
            const signupEmail = document.getElementById('signupEmail');
            if (signupEmail && !formData.email) {
                signupEmail.value = null;
            }
            const newOrgName = document.getElementById('newOrgName');
            if (newOrgName && !formData.newOrgName) {
                newOrgName.value = null;
            }
        }
    })

    async function handleSignUpButtonClicked() {

        const accountInfo = document.getElementById('account-info');
        if (!accountInfo.checkValidity()) {
            accountInfo.reportValidity();
            return;
        }
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.orgName) {
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            alert("The passwords you entered don't match.");
            return;
        }

        const newOrgName = formData.newOrgName ? formData.newOrgName : null;
        const orgName = formData.orgName;
        const name = `${formData.firstName} ${formData.lastName}`;
        const labValue = orgName ? availableOrgs[orgName] : '';

        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
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
            <form id="details-tab">
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
            <form id="account-info">
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
                        id="signupEmail"
                        name="email"
                        label="Email"
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
        </div>
    )

}
