import { createContext, ReactNode, useContext, useState } from 'react'

interface GlobalProviderProps {
  children: ReactNode
}

interface GlobalContextProps {
  showNavBar: boolean
  setShowNavBar: (showNavBar: boolean) => void
  showTopBar: boolean
  setShowTopBar: (showTopBar: boolean) => void
}

const GlobalContext = createContext<GlobalContextProps>({
  showNavBar: false,
  setShowNavBar: () => {},
  showTopBar: false,
  setShowTopBar: () => {},
})

export function GlobalProvider({ children }: GlobalProviderProps): JSX.Element {
  const [showNavBar, setShowNavBar] = useState<boolean>(false)
  const [showTopBar, setShowTopBar] = useState<boolean>(false)

  const handleShowNavBarChange = (newShowNavBar: boolean) => {
    setShowNavBar(newShowNavBar)
  }

  const handleShowTopBarChange = (newShowTopBar: boolean) => {
    setShowTopBar(newShowTopBar)
  }

  return (
    <GlobalContext.Provider
      value={{
        showNavBar,
        setShowNavBar: handleShowNavBarChange,
        showTopBar,
        setShowTopBar: handleShowTopBarChange,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobal() {
  const context = useContext(GlobalContext)

  return context
}
