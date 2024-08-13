import React, {useEffect, useState} from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {Short} from "../../types/collections/Shorts";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {Segment} from "../../types/collections/Segment";
import {Card, CardContent} from "../ui/card";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  segment: Segment | undefined;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onConfirm,
                                                               segment,
                                                             }) => {

  const [existingShorts, setExistingShorts] = useState<Short[]>([]);

  useEffect(() => {
    console.log(segment)
    if (segment) {
      FirebaseFirestoreService.queryDocuments(
        "shorts",
        "segment_id",
        segment.id,
        "last_updated",
        (docs) => {
          console.log(docs)
          setExistingShorts(docs.map((elem) => {return elem as Short}))
        },
        (error) => {
          console.log(error.message)
        }
      )
    }
  }, [segment])

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Confirm Automatic Short Generation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to automatically generate a short for the segment:
            <br />
            <strong>{segment ? segment.segmentTitle : "No segment selected..."}</strong>?
            <br />
            This action cannot be undone.
            <div className="flex flex-col items-center gap-2">
              {
                existingShorts.length > 0 ?
                  <p className="text-danger">You already have the following shorts generating/generating</p> :
                  <p className="text-primary">You haven't created any shorts from this just yet.</p>
              }
              {
                existingShorts.map((short) => {
                  return (
                    <Card>
                        <div className="p-2">
                          <a href={`/shorts?short_id=${short.id}`} className="text-primary underline">{short.short_idea}</a>
                          <p>Short Generated ad: {short.last_updated.toDate().toString()}</p>
                          <p>Curent Status: {short.short_status}</p>
                          <p>Previous Status: {short.short_status}</p>
                        </div>
                    </Card>
                  );
                }
                )
              }
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} className="text-white">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationModal;