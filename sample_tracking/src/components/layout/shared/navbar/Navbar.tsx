'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '../../../../i18n/config'
import { MdAdd, MdMenu } from 'react-icons/md'
import { FaUserPlus, FaUsers } from 'react-icons/fa'
import Dropdown from '@components/ui/Dropdown'
import { useGlobal } from '@hooks/useGlobal'
import { useCurrentUser } from '@hooks/useCurrentUser'

const Navbar = () => {
  const { showNavBar } = useGlobal()
  const { t } = useTranslation()

  const {
    user: userData,
    loading: loadingUser,
    error: errorUser,
    isAuthenticated,
  } = useCurrentUser()

  if (!showNavBar || !isAuthenticated || loadingUser || errorUser) {
    return null
  }

  const canAddSample =
    userData?.role === 'admin' ||
    userData?.role === 'member' ||
    userData?.role === 'site_admin'

  const isAdmin = userData?.role === 'admin' || userData?.role === 'site_admin'

  return (
    <div className="bg-white rounded-r-3xl px-6 py-4 shadow-[12px_4px_55.9px_0px_rgba(236,236,236,0.25)]">
      <div>
        <img src="/ddf-header.svg" alt="google" width="268" height="46" />
      </div>

      <hr className="h-px color-[#F1F1F1] w-full my-6" />

      <ul className="flex flex-col space-y-2">
        {canAddSample && (
          <Dropdown.Root>
            <Dropdown.Trigger className="list-none">
              <div
                id="add-sample-button"
                className="rounded-2xl border border-gray-300 w-fit flex items-center p-2 gap-2"
              >
                <MdAdd />
                <span>{t('addSample')}</span>
              </div>
            </Dropdown.Trigger>
            <Dropdown.Content
              collisionPadding={8}
              sideOffset={5}
              className="flex flex-col bg-white shadow-xl rounded-lg border border-neutral-100"
            >
              <Dropdown.Item>
                {' '}
                <Link
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors add-sample-option"
                  href="./add-sample?status=originVerification"
                >
                  {t('originVerification')}
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                {' '}
                <Link
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors add-sample-option"
                  href="./add-sample?status=singleReference"
                >
                  {t('singleReferenceSample')}
                </Link>
              </Dropdown.Item>
              <Dropdown.Item>
                {' '}
                <Link
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors add-sample-option"
                  href="./AddCSVSample"
                >
                  {t('importSamples')}
                </Link>
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        )}{' '}
        <li className="list-none mt-4">
          <Link
            className="flex gap-2 items-center no-underline text-sm mb-2 text-gray-600 hover:text-blue-400 transition-all"
            href="./samples"
          >
            {' '}
            <MdMenu /> {t('allSamples')}
          </Link>
        </li>
        {isAdmin && (
          <div className="admin-options flex flex-col gap-2 pt-3">
            <li className="list-none">
              <Link
                className="flex gap-2 items-center no-underline text-sm text-gray-600 hover:text-blue-400 transition-all"
                href="./sign-up-requests"
              >
                <FaUserPlus /> {t('signUpRequests')}
              </Link>
            </li>
            <li className="list-none">
              <Link
                className="flex gap-2 items-center no-underline text-sm text-gray-600 hover:text-blue-400 transition-all"
                href="./all-users"
              >
                <FaUsers />{' '}
                {userData?.role === 'site_admin'
                  ? t('allUsers')
                  : t('myOrganization')}
              </Link>
            </li>
          </div>
        )}
      </ul>

      <div>
        <a href="https://docs.google.com/forms/d/1Wu9vsMlMMnCc-fCGEW5_lwKSr8y7hDPhaZonC1AoP6Q/">
          <span className="material-symbols-outlined feedback-icon">help</span>
        </a>
      </div>
    </div>
  )
}

export default Navbar
