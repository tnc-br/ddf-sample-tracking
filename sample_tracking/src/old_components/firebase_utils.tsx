import {
  getFirestore,
  getDocs,
  collection,
  query,
  or,
  and,
  where,
  getDoc,
  doc,
  setDoc,
} from 'firebase/firestore'
import * as utils from './utils'

export async function getSamplesFromCollection(
  userData: utils.UserData,
  collectionName: string,
): Promise<Map<string, Map<string, string>>[]> {
  const db = getFirestore()
  const samples: any = {}
  const samplesStateArray: any = []
  const verifiedSamplesRef = collection(db, collectionName)
  let samplesQuery
  if (userData.role == 'site_admin') {
    const querySnapshot = await getDocs(collection(db, collectionName)).catch(
      (error) => {
        console.log('Unable to fetch samples: ' + error)
      },
    )
    if (querySnapshot) {
      querySnapshot.forEach((doc) => {
        const docData = doc.data()
        samples[doc.id as unknown as number] = doc.data()
        samplesStateArray.push({
          ...docData,
          code_lab: doc.id,
        })
      })
    }

    return samplesStateArray
  } else if (userData.org != null) {
    samplesQuery = query(verifiedSamplesRef, where('org', '==', userData.org))
  } else {
    samplesQuery = query(
      verifiedSamplesRef,
      where('visibility', '==', 'public'),
    )
  }

  // console.log("userdata: " + userData);
  const querySnapshot = await getDocs(samplesQuery).catch((error) => {
    console.log('Unable to fetch samples: ' + error)
  })
  if (querySnapshot) {
    querySnapshot.forEach((doc) => {
      const docData = doc.data()
      samples[doc.id] = doc.data()
      samplesStateArray.push({
        ...docData,
        code_lab: doc.id,
      })
    })
  }

  return samplesStateArray
}

export async function getUserData(userId: string): Promise<utils.UserData> {
  const db = getFirestore()
  const userDocRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userDocRef)
  if (userDoc.exists()) {
    return userDoc.data() as utils.UserData
  } else {
    return {} as utils.UserData
  }
}

export async function getNewUserData(userId: string): Promise<utils.UserData> {
  const db = getFirestore()
  const userDocRef = doc(db, 'new_users', userId)
  const userDoc = await getDoc(userDocRef)
  if (userDoc.exists()) {
    return userDoc.data() as utils.UserData
  } else {
    return {} as utils.UserData
  }
}

export function setSample(
  trustedValue: string,
  sampleId: string,
  sample: utils.Sample,
) {
  if (!trustedValue) return
  const db = getFirestore()
  let docRef
  if (trustedValue === 'trusted') {
    docRef = doc(db, 'trusted_samples', sampleId)
  } else if (trustedValue === 'untrusted') {
    docRef = doc(db, 'untrusted_samples', sampleId)
  } else {
    docRef = doc(db, 'unknown_samples', sampleId)
  }
  setDoc(docRef, sample)
}
