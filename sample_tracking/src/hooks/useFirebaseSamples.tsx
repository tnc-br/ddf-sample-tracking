import { useMemo } from 'react'
import { collection, query, where, doc } from 'firebase/firestore'
import { useCollection, useDocument } from 'react-firebase-hooks/firestore'
import { db } from '@services/firebase/config'
import { UserData, Sample } from '../old_components/utils'

export const useSamplesFromCollection = (
  userData: UserData | null,
  collectionName: string,
) => {
  const samplesQuery = useMemo(() => {
    if (!userData) return null

    const collectionRef = collection(db, collectionName)

    if (userData.role === 'site_admin') {
      // Site admin vê todas as amostras
      return collectionRef
    } else if (userData.org != null) {
      // Usuário com org vê amostras da sua organização
      return query(collectionRef, where('org', '==', userData.org))
    } else {
      // Usuário sem org vê apenas amostras públicas
      return query(collectionRef, where('visibility', '==', 'public'))
    }
  }, [userData, collectionName])

  const [snapshot, loading, error] = useCollection(samplesQuery)

  // Transformar os dados no formato esperado
  const samplesData = useMemo(() => {
    if (!snapshot) return []

    const samplesStateArray: Sample[] = []

    snapshot.forEach((doc) => {
      const docData = doc.data()
      samplesStateArray.push({
        ...docData,
        code_lab: doc.id,
      } as Sample)
    })

    return samplesStateArray
  }, [snapshot])

  return {
    data: samplesData,
    loading,
    error,
    refetch: () => {
      // O react-firebase-hooks automaticamente refetch quando há mudanças
      // Mas podemos forçar um refetch se necessário
    },
  }
}

export const useUserData = (userId: string | null) => {
  const userRef = userId ? doc(db, 'users', userId) : null
  const [snapshot, loading, error] = useDocument(userRef)

  const userData = useMemo(() => {
    if (!snapshot?.exists()) return null
    return snapshot.data() as UserData
  }, [snapshot])

  return {
    data: userData,
    loading,
    error,
  }
}

export const useNewUserData = (userId: string | null) => {
  const userRef = userId ? doc(db, 'new_users', userId) : null
  const [snapshot, loading, error] = useDocument(userRef)

  const userData = useMemo(() => {
    if (!snapshot?.exists()) return null
    return snapshot.data() as UserData
  }, [snapshot])

  return {
    data: userData,
    loading,
    error,
  }
}

export const useSample = (
  sampleId: string | null,
  collectionName: 'trusted_samples' | 'untrusted_samples' | 'unknown_samples',
) => {
  const sampleRef = sampleId ? doc(db, collectionName, sampleId) : null
  const [snapshot, loading, error] = useDocument(sampleRef)

  const sampleData = useMemo(() => {
    if (!snapshot?.exists()) return null
    return {
      ...snapshot.data(),
      code_lab: snapshot.id,
    } as Sample
  }, [snapshot])

  return {
    data: sampleData,
    loading,
    error,
  }
}
