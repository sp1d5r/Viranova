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
        if (!path) {
            throw new Error('Invalid file path.');
        }

        const storageRef = ref(storage, path);
        return getDownloadURL(storageRef)
          .then((url) => {
              return fetch(url);
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok.');
              }
              return response.blob();
          })
          .catch((error) => {
              console.error("Failed to download file:", error);
              throw error;
          });
    },

    async getDownloadURL(path: string): Promise<string> {
        if (!path) {
            throw new Error('Path cannot be empty');
        }

        const storageRef = ref(storage, path);
        return getDownloadURL(storageRef)
          .then((downloadURL) => {
              console.log("URL retrieved:", downloadURL);
              return downloadURL;
          })
          .catch((error) => {
              console.error("Error fetching download URL:", error);
              throw error;
          });
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
