export interface StorageService {
    uploadFile(path: string, file: File, onProgress?: (progress: number) => void): Promise<string>;
    downloadFile(path: string): Promise<Blob>;
    getDownloadURL(path: string): Promise<string>;
    deleteFile(path: string): Promise<void>;
}

export default StorageService;
