import {
    FirestoreError,
    WhereFilterOp,
    OrderByDirection
} from "firebase/firestore";

export type UpdateCallback<T> = (data: T | null) => void;
export type SuccessCallback<T> = (result: T) => void;
export type ErrorCallback<T> = (error: Error) => void;
export type FailureCallback = (error: Error) => void;
export type Unsubscribe = () => void;

interface Identifiable {
    id?: string;
}

type FilterCondition = {
    field: string;
    operator: WhereFilterOp;
    value: any;
};
export interface DatabaseService {
    addDocument(collectionPath: string, data: any, onSuccess?:SuccessCallback<string>, onFailure?: FailureCallback): Promise<void>;
    getDocument<T>(collectionPath: string, docId: string, onSuccess?:SuccessCallback<T | null>, onFailure?: FailureCallback): Promise<void>;
    updateDocument<T>(collectionPath: string, docId: string, data: Partial<T>, onSuccess?:SuccessCallback<void>, onFailure?: FailureCallback): Promise<void>;
    deleteDocument(collectionPath: string, docId: string, onSuccess?: SuccessCallback<void>, onFailure?: FailureCallback): Promise<void>;
    listenToDocument<T>(collectionPath: string, docId: string, onUpdate: UpdateCallback<T>, onError?: ErrorCallback<T>): Unsubscribe;
    getNewDocumentID<T>(collectionName: string, onSuccess?:SuccessCallback<string>, onFailure?:FailureCallback): Promise<string>;
    queryDocuments<T extends Identifiable>(collectionPath: string, queryField: string, queryValue: any, orderByField: string, onSuccess?:SuccessCallback<T[]>, onFailure?:FailureCallback): Promise<void>;
    getRandomDocument<T>(collectionPath: string, onSuccess?: SuccessCallback<T | null>, onFailure?: FailureCallback): Promise<void>;
    queryDocumentById<T>(collectionPath: string, docId: string, onSuccess?: SuccessCallback<T>, onFailure?: FailureCallback): void;
    getAllDocuments<T>(collectionPath: string, onSuccess?: SuccessCallback<T[]>, onFailure?: FailureCallback): Promise<void>;
    listenToQuery<T>(
      collectionPath: string,
      queryField: string,
      queryValue: any,
      orderByField: string,
      onUpdate: UpdateCallback<T[]>,
      onError: (error: FirestoreError) => void
    ): Unsubscribe;
    complexQuery<T>(
      collectionPath: string,
      filters: FilterCondition[],
      orderByFields: { field: string; direction?: OrderByDirection }[],
      onSuccess?: SuccessCallback<T[]>,
      onFailure?: FailureCallback
    ): Promise<void>
}

export default DatabaseService;
