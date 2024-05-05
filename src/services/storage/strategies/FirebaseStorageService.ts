// Assuming you have initialized Firebase in a similar manner
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import app from "../../../config/firebaseConfig";
import { StorageService } from '../StorageInterface';

const storage = getStorage(app);

const FirebaseStorageService: StorageService = {
    async uploadFile(path: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) onProgress(progress);
                },
                (error) => {
                    console.log("Failed to upload");
                    reject(error);
                },
                () => {
                    // Handle successful uploads on complete
                    getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
                        console.log("Uploaded", downloadURL);
                        resolve(downloadURL);
                        return downloadURL;
                    });
                }
            );
        });
    },

    async downloadFile(path: string): Promise<Blob> {
        throw new Error("downloadFile method not implemented.");
    },

    async deleteFile(path: string): Promise<void> {
        const storageRef = ref(storage, path);
        deleteObject(storageRef).then((res) => {
            console.log("File deleted successfully");
        }).catch((err)=>{
            console.log(`failed ${err}`)
        });
    },
}

export default FirebaseStorageService;
