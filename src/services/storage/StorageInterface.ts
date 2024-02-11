export interface StorageService {
    uploadFile(path: string, file: File, onProgress?: (progress: number) => void): Promise<string>;
    downloadFile(path: string): Promise<Blob>;
    deleteFile(path: string): Promise<void>;
}

export default StorageService;
