import React from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
// import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
// import { Button } from "../../ui/button";
// import { Timestamp } from "firebase/firestore";
// import { Short } from "../../../types/collections/Shorts";
// import FirebaseFirestoreService from "../../../services/database/strategies/FirebaseFirestoreService";
// import { useNotification } from "../../../contexts/NotificationProvider";
//
// interface ProcessingDialogProps {
//   isOpen: boolean;
//   onClose: () => void;
//   short: Short;
//   shortId: string;
// }
//
// export const ProcessingDialog: React.FC<ProcessingDialogProps> = ({
//                                                                     isOpen,
//                                                                     onClose,
//                                                                     short,
//                                                                     shortId,
//                                                                   }) => {
//   const { showNotification } = useNotification();
//   const isOlderThanFiveMinutes = short.last_updated
//     ? (Timestamp.now().seconds - short.last_updated.seconds) / 60 > 5
//     : false;
//
//   const handleCancelOperation = () => {
//     FirebaseFirestoreService.updateDocument(
//       "shorts",
//       shortId,
//       {
//         backend_status: "Completed",
//         pending_operation: false,
//       },
//       () => {
//         showNotification("Cancelled Operation", "Be careful of concurrency errors.", "success");
//         onClose();
//       },
//     );
//   };
//
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Operation in Progress</DialogTitle>
//           <DialogDescription>Please wait while the operation completes.</DialogDescription>
//         </DialogHeader>
//         <Card>
//           <CardHeader>
//             <CardTitle>{short.progress_message}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="w-full bg-secondary rounded-full h-2.5 dark:bg-gray-700">
//               <div
//                 className="bg-primary h-2.5 rounded-full"
//                 style={{ width: `${short.update_progress}%` }}
//               ></div>
//             </div>
//             {isOlderThanFiveMinutes && (
//               <Button
//                 onClick={handleCancelOperation}
//                 className="mt-4"
//                 variant="destructive"
//               >
//                 Cancel Operation
//               </Button>
//             )}
//           </CardContent>
//         </Card>
//       </DialogContent>
//     </Dialog>
//   );
// };