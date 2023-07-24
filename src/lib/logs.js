import { userStore } from "./store";
import { getDoc, doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/client';
	

export async function getUserStoreID() {
   let uid;
   const unsubscribe = userStore.subscribe((user) => {
      // Assuming the user object has a property called 'uid'
      if (user) {
         uid = user.uid;
      }
   });
   // Unsubscribe from the store to avoid memory leaks
   unsubscribe();
   return uid;
}


export async function addLog(activity, page){
    let uid
    let user
    uid = await getUserStoreID()
    // console.log(uid)
    const snapshot = await getDoc(doc(db, 'accounts', uid));
	user = snapshot.data();

    await addDoc(collection(db, 'adminlogs'), {
        	user: user.firstNameDisplay + " " + user.lastNameDisplay,
            activity: activity,
        	pageRef: page,
        	date: serverTimestamp()
        });
}