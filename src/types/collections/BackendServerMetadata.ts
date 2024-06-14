export type ServerStatus = "Pending" | "Completed" | "Processing" | "";

export interface BackendServerMetadata {
  backend_status?: ServerStatus
}