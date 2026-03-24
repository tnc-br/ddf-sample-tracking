'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '../../../../i18n/config'
import { MdAdd, MdMenu, MdSettings } from 'react-icons/md'
import { FaUserPlus, FaUsers } from 'react-icons/fa'
import Dropdown from '@components/ui/Dropdown'
import { useGlobal } from '@hooks/useGlobal'
import { useCurrentUser } from '@hooks/useCurrentUser'
import { useAuth } from '@hooks/useAuth'

const Navbar = () => {
  const { showNavBar } = useGlobal()
  const { t } = useTranslation()

  const {
    user: userData,
    loading: loadingUser,
    error: errorUser,
    isAuthenticated,
  } = useCurrentUser()

  const { signOut, isSigningOut, signOutError } = useAuth()

  async function onLogOutClick() {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (!showNavBar || !isAuthenticated || loadingUser || errorUser) {
    return null
  }

  const canAddSample =
    userData?.role === 'admin' ||
    userData?.role === 'member' ||
    userData?.role === 'site_admin'

  const isAdmin = userData?.role === 'admin' || userData?.role === 'site_admin'

  return (
    <div className="bg-white rounded-r-3xl px-6 py-4 flex flex-col justify-between shadow-[12px_4px_55.9px_0px_rgba(236,236,236,0.25)] h-screen">
      <div className="w-full">
        <img
          src="/ddf-header.svg"
          alt="google"
          className="pt-8"
          width="268"
          height="46"
        />

        <hr className="h-px color-[#F1F1F1] w-full my-6" />

        <ul className="flex flex-col">
          {canAddSample && (
            <Dropdown.Root>
              <Dropdown.Trigger className="list-none">
                <div
                  id="add-sample-button"
                  className="rounded-full border border-gray-300 w-full font-bold flex items-center justify-center py-4 px-2 gap-2"
                >
                  <div className="bg-[#006E2C] rounded-full flex items-center justify-center size-[16px]">
                    <MdAdd className="text-white" />
                  </div>
                  <span className="text-[#1E1E1E]">{t('addSample')}</span>
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
              className="rounded-full mt-3 bg-[#F2FDF6] border border-[#98D6B1] w-full font-bold flex items-center justify-center py-4 px-2 gap-2"
              href="./samples"
            >
              <MdMenu /> {t('allSamples')}
            </Link>
          </li>
          {isAdmin && (
            <div className="flex flex-col gap-4 mt-0">
              <hr className="h-px color-[#F1F1F1] w-full mt-6 mb-2" />

              <li className="list-none">
                <Link
                  className="flex gap-2 items-center no-underline font-bold text-[#454545] hover:text-[#006E2C] transition-all"
                  href="./sign-up-requests"
                >
                  <FaUserPlus /> {t('signUpRequests')}
                </Link>
              </li>
              <li className="list-none">
                <Link
                  className="flex gap-2 items-center no-underline font-bold text-[#454545] hover:text-[#006E2C] transition-all"
                  href="./all-users"
                >
                  <FaUsers />{' '}
                  {userData?.role === 'site_admin'
                    ? t('allUsers')
                    : t('myOrganization')}
                </Link>
              </li>
              <li className="list-none">
                <Link
                  className="flex gap-2 items-center no-underline font-bold text-[#454545] hover:text-[#006E2C] transition-all"
                  href="./config"
                >
                  <MdSettings /> {t('configurations')}
                </Link>
              </li>
            </div>
          )}
        </ul>
      </div>

      <button
        onClick={onLogOutClick}
        disabled={isSigningOut}
        className="bg-[#F6F6F6] text-[#454545] font-bold rounded-full px-10 py-4 hover:bg-[#E6E6E6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSigningOut ? 'Saindo...' : 'Sair da minha conta'}
      </button>
    </div>
  )
}

export default Navbar
