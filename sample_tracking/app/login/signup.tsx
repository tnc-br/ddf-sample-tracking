
import { useState } from 'react';
import { useRouter } from 'next/navigation'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDocs, collection, getFirestore, updateDoc, addDoc } from "firebase/firestore";
import InputField from '../input-field';


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

        const newOrgName = formData.newOrgName ? formData.newOrgName : '';
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

            addDoc(collection(db, "new_users"), {
                name: name,
                email: formData.email,
                date_requested: dateString,
                org: signUpData.lab,
                uid: auth.currentUser!.uid,
                org_name: signUpData.labName,
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
        value === "Create new organization" ? "NEW" : value;
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
                <InputField labelName="First name" inputID="firstName" fieldValue={formData.firstName} handleChange={(evt: any) => handleChange(evt)} />
                <InputField labelName="Last name" inputID="lastName" fieldValue={formData.lastName} handleChange={(evt: any) => handleChange(evt)} />
                <div className="forgot-password-entry-wrapper">
                    <div className="forgot-password-entry">
                        <div className="forgot-password-slate-entry">
                            <div className="forgot-password-content-wrapper">
                                <div className="forgot-password-input-text">
                                    <div className='org-input'>
                                        <select required onChange={handleChange} className="form-control" name="orgName" id="orgName">
                                            <option key="newOrgOption" id="newOrgOption">Create new organization</option>
                                            {
                                                Object.keys(availableOrgs).map((key, i) => {
                                                    return (
                                                        <option key={key} id={key}>{key}</option>
                                                    )
                                                })
                                            }
                                        </select>
                                    </div>
                                </div>
                                <div className="forgot-passowrd-label-text-wrapper">
                                    <div className="forgot-password-label-text">
                                        Organization
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div onClick={handleNextClick} className="forgot-password-button-wrapper">
                    <div className="forgot-password-button">
                        <div className='forgot-password-button-text'>
                            Next
                        </div>
                    </div>
                </div>
            </form>




            //   <form id="your-details-tab" className='your-details-tab'>
            //     <div className="form-outline mb-4">
            //       <input required type="text" name="name" placeholder='First name' id="firstName" className="form-control form-control-lg" />
            //     </div>

            //     <div className="form-outline mb-4">
            //       <input required type="text" name="name" placeholder='Last name' id="lastName" className="form-control form-control-lg" />
            //     </div>

            //     <div className="form-group">
            //       <label htmlFor="labSelect">Organization</label>
            //       <select required className="form-control" id="labSelect">
            //         <option key="newOrgOption" id="newOrgOption">Create new organization</option>
            //         {
            //           Object.keys(availableOrgs).map((key, i) => {
            //             return (
            //               <option key={key} id={key}>{key}</option>
            //             )
            //           })
            //         }
            //       </select>
            //     </div>
            //     <button type="button" onClick={finishYourDetailsTab} className="btn btn-primary">Next</button>
            //   </form>
        )
    }

    function accountInfo() {
        return (
            <form id="account-info">
                <p className="forgot-password-header">
                    <span onClick={() => setSignUpTab(0)} className="material-symbols-outlined back-arrow">
                        arrow_back
                    </span>Sign up</p>
                {formData['orgName'] === "NEW" && <InputField labelName="New org name" inputID="newOrgName" fieldValue={formData.newOrgName} handleChange={(evt: any) => handleChange(evt)} />}
                <InputField labelName="Email" inputID="email" fieldValue={formData.email} handleChange={(evt: any) => handleChange(evt)} />
                <InputField labelName="Password" inputID="password" fieldValue={formData.password} handleChange={(evt: any) => handleChange(evt)} />
                <InputField labelName="Re-enter password" inputID="confirmPassword" fieldValue={formData.confirmPassword} handleChange={(evt: any) => handleChange(evt)}  />
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
