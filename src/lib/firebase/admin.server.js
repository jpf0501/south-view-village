import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app';
import { getAuth } from "firebase-admin/auth"
import { PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY } from "$env/static/private"

const serviceAccount = {
    clientEmail: CLIENT_EMAIL,
    privateKey: PRIVATE_KEY,
    projectId: PROJECT_ID,
}

function getFirebaseAdmin() {
    if (getApps().some((e) => e.name === 'ADMIN')) return getApp('ADMIN')
    return initializeApp({ credential: cert(serviceAccount) }, 'ADMIN');
}
export const admin = getFirebaseAdmin()
export const adminAuth = getAuth(admin)