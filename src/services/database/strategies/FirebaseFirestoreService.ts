import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    FirestoreError,
    getDoc,
    getFirestore,
    onSnapshot,
    Unsubscribe,
    updateDoc,
    WithFieldValue
} from 'firebase/firestore';
import app from "../../../config/firebaseConfig";
import {DatabaseService, FailureCallback, SuccessCallback, UpdateCallback} from '../DatabaseInterface';
const db = getFirestore(app);

const FirebaseDatabaseService: DatabaseService = {


    async addDocument(collectionPath: string, data: any, onSuccess?: SuccessCallback<string>, onFailure?: FailureCallback): Promise<void> {
        try {
            const safeData: WithFieldValue<DocumentData> = data;
            const docRef = await addDoc(collection(db, collectionPath), safeData);
            if (onSuccess) onSuccess(docRef.id);
        } catch (error) {
            if (onFailure) onFailure(error as Error);
        }
    },

    async getDocument<T>(collectionPath: string, docId: string, onSuccess?: SuccessCallback<T | null>, onFailure?: FailureCallback): Promise<void> {
        try {
            const docRef = doc(db, collectionPath, docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                if (onSuccess) onSuccess(docSnap.data() as T);
            } else {
                if (onSuccess) onSuccess(null);
            }

        } catch (error) {
            if (onFailure) onFailure(error as Error);
        }
    },

    async updateDocument<T>(collectionPath: string, docId: string, data: Partial<T>, onSuccess?: SuccessCallback<void>, onFailure?: FailureCallback): Promise<void> {
        try {
            const docRef = doc(db, collectionPath, docId);
            await updateDoc(docRef, data);
            if (onSuccess) onSuccess();
        } catch (error) {
            if (onFailure) onFailure(error as Error);
        }
    },

    async deleteDocument(collectionPath: string, docId: string, onSuccess?: SuccessCallback<void>, onFailure?: FailureCallback): Promise<void> {
        try {
            const docRef = doc(db, collectionPath, docId);
            await deleteDoc(docRef);
            if (onSuccess) onSuccess();
        } catch (error) {
            if (onFailure) onFailure(error as Error);
        }
    },

    listenToDocument<T>(collectionPath: string, docId: string, onUpdate: UpdateCallback<T>, onError: (error: FirestoreError) => void = (err) => {console.error(err)}): Unsubscribe {
        const documentRef: DocumentReference = doc(db, collectionPath, docId);
        return onSnapshot(documentRef, (doc) => {
                if (doc.exists()) {
                    onUpdate(doc.data() as T);
                }
            },
            onError
        );
    },

    getNewDocumentID<T>(
        collectionName: string,
        onSuccess: SuccessCallback<string> = (res) => console.log(res),
        onFailure?: FailureCallback): Promise<string> {
        const newDocRef = doc(collection(db, collectionName));
        onSuccess(newDocRef.id);
        return Promise.resolve(newDocRef.id);
    },
}

export default FirebaseDatabaseService;
