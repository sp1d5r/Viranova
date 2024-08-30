import React, { useEffect, useState } from 'react';
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
import { Short } from "../../types/collections/Shorts";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import { Segment } from "../../types/collections/Segment";
import { Card, CardContent } from "../ui/card";
import { CreditButton } from "../ui/credit-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedBoxType: string, backgroundVideoPath: string) => void;
  segment: Segment | undefined;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onConfirm,
                                                               segment,
                                                             }) => {
  const [existingShorts, setExistingShorts] = useState<Short[]>([]);
  const [selectedBoxType, setSelectedBoxType] = useState<string>("standard_tiktok");
  const [backgroundVideoPath, setBackgroundVideoPath] = useState<string>("background-gameplay/Clip1.mp4");

  useEffect(() => {
    if (segment) {
      FirebaseFirestoreService.queryDocuments(
        "shorts",
        "segment_id",
        segment.id,
        "last_updated",
        (docs) => {
          setExistingShorts(docs.map((elem) => elem as Short));
        },
        (error) => {
          console.log(error.message);
        }
      );
    }
  }, [segment]);

  const handleConfirm = () => {
    onConfirm(selectedBoxType, backgroundVideoPath);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Confirm Automatic Short Generation</AlertDialogTitle>
          <AlertDialogDescription>
            Auto-generation can be intensive. It costs roughly 20 credits...
            Are you sure you want to automatically generate a short for the segment:
            <br />
            <strong>{segment ? segment.segmentTitle : "No segment selected..."}</strong>?
            <br />
            This action cannot be undone.
            <div className="flex flex-col items-center gap-2 mt-4">
              <Label htmlFor="box-type">Select Box Type</Label>
              <Select onValueChange={setSelectedBoxType} defaultValue={selectedBoxType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select box type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard_tiktok">Standard TikTok</SelectItem>
                  <SelectItem value="two_boxes">Two Boxes</SelectItem>
                  <SelectItem value="reaction_box">Reaction Box</SelectItem>
                  <SelectItem value="half_screen_box">Half Screen Box</SelectItem>
                </SelectContent>
              </Select>

              <Label htmlFor="background-video">Select Background Video</Label>
              <Select onValueChange={setBackgroundVideoPath} defaultValue={backgroundVideoPath}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select background video" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(14)].map((_, i) => (
                    <SelectItem key={i} value={`background-gameplay/Clip${i + 1}.mp4`}>
                      Clip {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col items-center gap-2 mt-4">
              {existingShorts.length > 0 ? (
                <p className="text-danger">You already have the following shorts generating/generated</p>
              ) : (
                <p className="text-primary">You haven't created any shorts from this just yet.</p>
              )}
              {existingShorts.map((short) => (
                <Card key={short.id}>
                  <CardContent className="p-2">
                    <a href={`/shorts?short_id=${short.id}`} className="text-primary underline">
                      {short.short_idea}
                    </a>
                    <p>Short Generated at: {short.last_updated.toDate().toString()}</p>
                    <p>Current Status: {short.short_status}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} className="text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction>
            <CreditButton creditCost={20} onClick={handleConfirm}>
              Confirm
            </CreditButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationModal;
