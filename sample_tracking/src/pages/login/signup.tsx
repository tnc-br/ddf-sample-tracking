import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, getDocs, collection, updateDoc, setDoc } from 'firebase/firestore'
import { TextField, MenuItem } from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ConfirmationBox,
  ConfirmationProps,
} from '../../old_components/confirmation_box'
import { useTranslation } from 'react-i18next'
import { auth, db } from '@services/firebase/config'

const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Nome é obrigatório')
      .min(2, 'Nome deve ter pelo menos 2 caracteres'),
    lastName: z
      .string()
      .min(1, 'Sobrenome é obrigatório')
      .min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    orgName: z.string().min(1, 'Organização é obrigatória'),
    newOrgName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.newOrgName && data.newOrgName.includes(' ')) {
        return false
      }
      return true
    },
    {
      message: 'Nome da organização deve ser uma palavra só',
      path: ['newOrgName'],
    },
  )

type SignUpFormData = z.infer<typeof signUpSchema>

interface NestedSchemas {
  [key: string]: NestedSchemas | string
}

interface OrgsSchemas {
  [key: string]: string
}

export default function SignUp() {
  const [signUpTab, setSignUpTab] = useState(0)
  const [availableOrgs, setAvailableOrgs] = useState({} as OrgsSchemas)
  const [confirmationBoxData, setConfirmationBoxData] = useState(
    null as ConfirmationProps | null,
  )

  const router = useRouter()
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    getValues,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      orgName: '',
      newOrgName: '',
    },
  })

  const watchOrgName = watch('orgName')

  if (Object.keys(availableOrgs).length < 1) {
    const orgs: OrgsSchemas = {}
    getDocs(collection(db, 'organizations')).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const docData = doc.data()
        orgs[docData['org_name']] = doc.id
      })
      orgs['Create new organization'] = 'NEW'
      setAvailableOrgs(orgs as OrgsSchemas)
    })
  }

  const validateOrgName = (newOrgName: string) => {
    if (newOrgName && Object.keys(availableOrgs).includes(newOrgName)) {
      return false
    }
    return true
  }

  async function onSubmit(data: SignUpFormData) {
    try {
      if (data.newOrgName && !validateOrgName(data.newOrgName)) {
        setConfirmationBoxData({
          title: t('orgNameExists'),
          actionButtonTitle: t('confirm'),
          onCancelButtonClick: () => setConfirmationBoxData(null),
        })
        return
      }

      const orgName = data.orgName
      const name = `${data.firstName} ${data.lastName}`
      const labValue = orgName ? availableOrgs[orgName] : ''

      await createUserWithEmailAndPassword(auth, data.email, data.password)

      const user = auth.currentUser
      if (!user) return

      await updateProfile(user, {
        displayName: name,
      })

      const date = new Date()
      const dateString = `${date.getMonth() + 1} ${date.getDate()} ${date.getFullYear()}`

      if (data.newOrgName) {
        const newOrgDoc = doc(db, 'new_users', 'new_orgs')
        let newObj: NestedSchemas = {}
        newObj[data.newOrgName] = {
          admin_id: user.uid,
          admin_name: name,
          email: data.email,
          date_requested: dateString,
        }
        await updateDoc(newOrgDoc, newObj)
      } else {
        const newDocRef = doc(db, 'new_users', user.uid)
        await setDoc(newDocRef, {
          name: name,
          email: data.email,
          date_requested: dateString,
          org: labValue,
          uid: user.uid,
          org_name: orgName,
        })
      }

      router.push('/samples')
    } catch (error: any) {
      console.log(error)
      let errorMessage = ''

      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = t('weakPassword')
          break
        case 'auth/email-already-exists':
        case 'auth/email-already-in-use':
          errorMessage = t('emailAlreadyInUse')
          break
        default:
          errorMessage = `${t('errorCreatingAccount')} + ${error.message}`
      }

      setConfirmationBoxData({
        title: errorMessage,
        actionButtonTitle: t('confirm'),
        onCancelButtonClick: () => setConfirmationBoxData(null),
      })
    }
  }

  function handleNextClick() {
    const firstTabFields = ['firstName', 'lastName', 'orgName'] as const
    const values = getValues()

    let hasErrors = false
    firstTabFields.forEach((field) => {
      if (!values[field]) {
        hasErrors = true
      }
    })

    if (!hasErrors) {
      setSignUpTab(1)
    }
  }

  function yourDetailsTab() {
    return (
      <form autoComplete="off" id="details-tab">
        <span className="text-lg">Registro</span>

        <div className="login-input-wrapper">
          <TextField
            size="small"
            fullWidth
            required
            id="firstName"
            label="Nome"
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            {...register('firstName')}
          />
        </div>
        <div className="login-input-wrapper">
          <TextField
            size="small"
            fullWidth
            required
            id="lastName"
            label="Sobrenome"
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>
        <div className="input-text-field-wrapper">
          <TextField
            id="orgName"
            size="small"
            fullWidth
            select
            required
            label="Organização"
            error={!!errors.orgName}
            helperText={errors.orgName?.message}
            {...register('orgName')}
          >
            {Object.keys(availableOrgs).map((orgValue: string) => (
              <MenuItem key={orgValue} value={orgValue}>
                {orgValue}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <div className="w-full flex justify-center">
          <button
            onClick={handleNextClick}
            className="bg-blue-500 text-white rounded-full px-4 py-2"
          >
            Enviar
          </button>
        </div>
      </form>
    )
  }

  function accountInfo() {
    return (
      <form
        autoComplete="off"
        id="account-info"
        onSubmit={handleSubmit(onSubmit)}
      >
        <p className="forgot-password-header">
          <span
            onClick={() => setSignUpTab(0)}
            className="material-symbols-outlined back-arrow"
          >
            arrow_back
          </span>
          Sign up
        </p>
        {watchOrgName === 'NEW' && (
          <div className="login-input-wrapper">
            <TextField
              size="small"
              fullWidth
              required
              id="newOrgName"
              label="New org name"
              error={!!errors.newOrgName}
              helperText={errors.newOrgName?.message}
              {...register('newOrgName')}
            />
          </div>
        )}
        <div className="login-input-wrapper">
          <TextField
            size="small"
            fullWidth
            required
            id="signupEmail"
            label="Email"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email')}
          />
        </div>
        <div className="login-input-wrapper">
          <TextField
            size="small"
            fullWidth
            required
            type="password"
            id="password"
            label="Password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password')}
          />
        </div>
        <div className="login-input-wrapper">
          <TextField
            size="small"
            fullWidth
            required
            type="password"
            id="confirmPassword"
            label="Confirm password"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="forgot-password-button-wrapper w-full"
        >
          <div className="forgot-password-button">
            <div className="forgot-password-button-text">
              {isSubmitting ? 'Criando conta...' : 'Sign up'}
            </div>
          </div>
        </button>
      </form>
    )
  }

  return (
    <div className="rounded-3xl border border-neutral-600 px-4 py-5 w-full max-w-xs">
      {signUpTab === 0 ? yourDetailsTab() : accountInfo()}
      {confirmationBoxData && <ConfirmationBox {...confirmationBoxData} />}
    </div>
  )
}
