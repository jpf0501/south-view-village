import { getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '$lib/firebase/client';

export async function getCurrentCommittees(position, isCurrentOfficer) {
  const committeesQuery = query(collection(db, 'committee'), where('position', '==', position), where('isCurrentOfficer', '==', isCurrentOfficer));
  const committeesSnapshot = await getDocs(committeesQuery);
  const positionData = [];

  committeesSnapshot.forEach((doc) => {
    positionData.push(doc.data());
  });

  return positionData;
}

export async function getCurrentCommitteesID(position, isCurrentOfficer){
    const committeesQuery = query(collection(db, 'committee'), where('position', '==', position), where('isCurrentOfficer', '==', isCurrentOfficer));
    const committeesSnapshot = await getDocs(committeesQuery);
    const committeeIds = [];

    committeesSnapshot.forEach((doc) => {
    committeeIds.push(doc.id);
  });

  return committeeIds;
}
