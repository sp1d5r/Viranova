export type UpdateCallback<T> = (data: T | null) => void;
export type SuccessCallback<T> = (result: T) => void;
export type ErrorCallback<T> = (error: Error) => void;
export type FailureCallback = (error: Error) => void;
export type Unsubscribe = () => void;

export interface DatabaseService {
    addDocument(collectionPath: string, data: any, onSuccess?:SuccessCallback<string>, onFailure?: FailureCallback): Promise<void>;
    getDocument<T>(collectionPath: string, docId: string, onSuccess?:SuccessCallback<T | null>, onFailure?: FailureCallback): Promise<void>;
    updateDocument<T>(collectionPath: string, docId: string, data: Partial<T>, onSuccess?:SuccessCallback<void>, onFailure?: FailureCallback): Promise<void>;
    deleteDocument(collectionPath: string, docId: string, onSuccess?: SuccessCallback<void>, onFailure?: FailureCallback): Promise<void>;
    listenToDocument<T>(collectionPath: string, docId: string, onUpdate: UpdateCallback<T>, onError?: ErrorCallback<T>): Unsubscribe;
}

export default DatabaseService;
