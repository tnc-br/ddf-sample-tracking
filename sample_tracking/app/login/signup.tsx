
import { useState } from 'react';
import { useRouter } from 'next/navigation'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDocs, collection, getFirestore, updateDoc, addDoc, setDoc } from "firebase/firestore";
import InputField from '../input-field';
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

export default function SignUp(props: SignUpProps) {

    const router = useRouter()

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

    if (Object.keys(availableOrgs).length < 1) {
        const orgs: OrgsSchemas = {};
        getDocs(collection(db, "organizations")).then((querySnapshot) => {
            console.log('made request to organizations');
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                orgs[docData['org_name']] = doc.id;
            });
            orgs["Create new organization"] = "NEW";
            setAvailableOrgs(orgs as OrgsSchemas);
        });
    }

    function finishYourDetailsTab() {
        console.log('here');
        const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
        const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
        const labName = (document.getElementById('labSelect') as HTMLInputElement).value;
        const labValue = labName === 'Create new organization' ? "NEW" : availableOrgs[labName];
        const form = document.getElementById('your-details-tab');
        if (!form) return;
        if (!form.checkValidity()) {
            form.reportValidity();
            return true;
        } else {
            updateSignUpData({
                firstName: firstName,
                lastName: lastName,
                lab: labValue,
                labName: labName,
            })
            setSignUpTab(1);
        }
    }

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
            console.log('Passwords dont match');
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



    function addUserToNewUsersCollection(newUserData: NewUser) {
        addDoc(collection(db, "new_users"), {
            name: newUserData.name,
            email: newUserData.email,
            date_requested: newUserData.date_requested,
            org: newUserData.org ? newUserData.org : "",
            uid: newUserData.uid,
            org_name: newUserData.org_name ? newUserData.org_name : "",
        });

    }

    function handleChange(evt: any) {
        let value = evt.target.value;
        value = value === "Create new organization" ? "NEW" : value;
        // if (evt.target.name) === 'orgName' {
        //     value = value === 'Create new organization' ? "NEW" : availableOrgs[labName];
        // }
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
                // <InputField labelName="New org name" inputID="newOrgName" fieldValue={formData.newOrgName} handleChange={(evt: any) => handleChange(evt)} />
                }
                <div className="login-input-wrapper">
                    <TextField
                        size='small'
                        fullWidth
                        required
                        id="email"
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
                {/* <InputField labelName="Email" inputID="email" fieldValue={formData.email} handleChange={(evt: any) => handleChange(evt)} /> */}
                {/* <InputField labelName="Password" inputID="password" fieldValue={formData.password} handleChange={(evt: any) => handleChange(evt)} /> */}
                {/* <InputField labelName="Re-enter password" inputID="confirmPassword" fieldValue={formData.confirmPassword} handleChange={(evt: any) => handleChange(evt)}  /> */}
                <div onClick={handleSignUpButtonClicked} className="forgot-password-button-wrapper">
                    <div className="forgot-password-button">
                        <div className='forgot-password-button-text'>
                            Sign up
                        </div>
                    </div>
                </div>
            </form>
            // <div className='account-info-tab'>
            // {signUpData['lab'] === "NEW" && <div className="form-outline mb-4">
            //     <input required type="text" name="newOrgName" autoComplete="off" placeholder='New organization name' id="newOrgName" className="form-control form-control-lg" />
            // </div>}

            // <div className="form-outline mb-4">
            //     <input required type="email" name="email" autoComplete="off" placeholder='Email address' id="email" className="form-control form-control-lg" />
            // </div>

            // <div className="form-outline mb-4">
            //     <input required type="password" name="password" placeholder='Password' id="password" className="form-control form-control-lg" />
            // </div>

            // <div className="form-outline mb-4">
            //     <input required type="password" name="passwordConfirmed" placeholder='Re-enter password' id="reEnterPassword" className="form-control form-control-lg" />
            // </div>

            //     <div className="d-flex justify-content-center">
            //         <button type="button" onClick={handleSignUpButtonClicked} className="btn btn-primary">Sign up</button>

            //     </div>
            // </div>

        )
    }


    return (
        <div className='signup-wrapper'>
            {signUpTab === 0 ? yourDetailsTab() : accountInfo()}
        </div>
        //   <section className="vh-100 bg-grey">
        //     <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
        //     <div className="container py-5 h-100">
        //     {signUpTab === 0 ? yourDetailsTab() : accountInfo()}

        //       {/* <div className="card">
        //         <div className="card-body p-5">
        //           <h3><span onClick={props.onLogInClick} className="material-symbols-outlined back-arrow">
        //             arrow_back
        //           </span>Sign up</h3>

        //           <div className='sign-up-progress-wrapper'>
        //             <span><span className='sign-up-progress'><span>1</span></span>Your details</span>
        //             <span><span className='sign-up-progress'>2</span>Account info</span>
        //           </div>


        //         </div> */}
        //       {/* </div> */}
        //     </div>
        //   </section>
    )

}
