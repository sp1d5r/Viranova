import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    FirestoreError,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    getFirestore,
    onSnapshot,
    Unsubscribe,
    updateDoc,
    WithFieldValue
} from 'firebase/firestore';
import app from "../../../config/firebaseConfig";
import {DatabaseService, FailureCallback, SuccessCallback, UpdateCallback} from '../DatabaseInterface';
const db = getFirestore(app);

type QueryResult<T> = T & { id: string };

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

    getNewDocumentID(
        collectionName: string,
        onSuccess: SuccessCallback<string> = (res) => console.log(res),
        onFailure?: FailureCallback): Promise<string> {
        const newDocRef = doc(collection(db, collectionName));
        onSuccess(newDocRef.id);
        return Promise.resolve(newDocRef.id);
    },

    async queryDocuments<T>(collectionPath: string, queryField: string, queryValue: any, orderByField: string, onSuccess?:SuccessCallback<T[]>, onFailure?:FailureCallback): Promise<void> {
        try {
            const q = query(collection(db, collectionPath), where(queryField, "==", queryValue), orderBy(orderByField));
            const querySnapshot = await getDocs(q);
            const documents: QueryResult<T>[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as T;
                const result: QueryResult<T> = { ...data, id: doc.id };
                documents.push(result)
            });
            if (onSuccess) onSuccess(documents);
        } catch (error) {
            if (onFailure) onFailure(error as FirestoreError);
        }
    },

    async getRandomDocument<T>(collectionPath: string, onSuccess?: SuccessCallback<T | null>, onFailure?: FailureCallback): Promise<void> {
        try {
            const q = query(collection(db, collectionPath));
            const querySnapshot = await getDocs(q);
            const documents: QueryResult<T>[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as T;
                const result: QueryResult<T> = { ...data, id: doc.id };
                documents.push(result);
            });

            if (documents.length > 0) {
                const randomIndex = Math.floor(Math.random() * documents.length);
                const randomDocument = documents[randomIndex];
                if (onSuccess) onSuccess(randomDocument as T);
            } else {
                if (onSuccess) onSuccess(null); // No documents found
            }
        } catch (error) {
            if (onFailure) onFailure(error as FirestoreError);
        }
    }

}

export default FirebaseDatabaseService;
