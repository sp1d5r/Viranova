import React, { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronUp } from "lucide-react"; // Import icons
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
import StandardTikTokIcon from "../../assets/videos-icons/standard_tiktok.svg";
import TwoBoxesIcon from "../../assets/videos-icons/two_boxes.svg";
import ReactionBoxIcon from "../../assets/videos-icons/reaction_box.svg";
import HalfScreenBoxIcon from "../../assets/videos-icons/half_box_screen.svg";
import TwoBoxesReversedIcon from "../../assets/videos-icons/two_boxes_reversed.svg";
import PictureInPictureIcon from "../../assets/videos-icons/picture_in_picture.svg";
import CSGO from "../../assets/gameplay-assets/csgo.png"

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedBoxType: string, backgroundVideoPath: string) => void;
  segment: Segment | undefined;
}

type BackgroundVideoType = 'CSGO';
const allBackgroundVideoTypes: BackgroundVideoType[] = ['CSGO'];

interface BoxTypeInfo {
  icon: string;
  displayName: string;
}


const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onConfirm,
                                                               segment,
                                                             }) => {
  const [existingShorts, setExistingShorts] = useState<Short[]>([]);
  const [selectedBoxType, setSelectedBoxType] = useState<string>("standard_tiktok");
  const [backgroundVideoType, setBackgroundVideoType] = useState<BackgroundVideoType>("CSGO");
  const [backgroundVideoPath, setBackgroundVideoPath] = useState<string>("background-gameplay/Clip1.mp4");
  const [openSection, setOpenSection] = useState<string | null>("boxType");
  

  const boxTypeIcons: Record<string, BoxTypeInfo> = {
    standard_tiktok: { icon: StandardTikTokIcon, displayName: "Single Crop" },
    two_boxes: { icon: TwoBoxesIcon, displayName: "Two Subjects" },
    reaction_box: { icon: ReactionBoxIcon, displayName: "Reaction Video" },
    half_screen_box: { icon: HalfScreenBoxIcon, displayName: "Gameplay Box" },
    two_boxes_reversed: { icon: TwoBoxesReversedIcon, displayName: "Two Subjects Reversed" },
    picture_in_picture: { icon: PictureInPictureIcon, displayName: "Picture in Picture" },
  };

  const backgroundVideos: Record<BackgroundVideoType, string[]> = {
    CSGO: [...Array(14)].map((_, i) => `background-gameplay/Clip${i + 1}.mp4`).sort(),
  };

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
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Confirm Automatic Short Generation</AlertDialogTitle>
          <AlertDialogDescription>
            Auto-generation can be intensive. It costs roughly 20 credits...
            Are you sure you want to automatically generate a short for the segment:
            <br />
            <strong>{segment ? segment.segmentTitle : "No segment selected..."}</strong>?
            <br />
            This action cannot be undone.
            <div className="flex flex-col items-center gap-4 mt-4">
              <Collapsible open={openSection === "boxType"} onOpenChange={() => setOpenSection(openSection === "boxType" ? null : "boxType")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-secondary rounded-md">
                  <Label>Select Box Type: {boxTypeIcons[selectedBoxType].displayName}</Label>
                  {openSection === "boxType" ? <ChevronUp /> : <ChevronDown />}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {Object.entries(boxTypeIcons).map(([type, { icon, displayName }]) => (
                      <button
                        key={type}
                        onClick={() => setSelectedBoxType(type)}
                        className={`flex flex-col items-center p-2 border rounded-md ${selectedBoxType === type ? 'border-primary bg-secondary' : 'border-gray-300'}`}
                      >
                        <img src={icon} alt={displayName} />
                        <span className="mt-2 block text-sm">{displayName}</span>
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              {selectedBoxType === "half_screen_box" && <>
              <Collapsible open={openSection === "backgroundType"} onOpenChange={() => setOpenSection(openSection === "backgroundType" ? null : "backgroundType")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-secondary rounded-md">
                  <Label>Select Background Video Type</Label>
                  {openSection === "backgroundType" ? <ChevronUp /> : <ChevronDown />}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {allBackgroundVideoTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setBackgroundVideoType(type);
                          setBackgroundVideoPath(backgroundVideos[type][0]);
                        }}
                        className={`p-2 border rounded-md ${backgroundVideoType === type ? 'border-primary' : 'border-gray-300'}`}
                      >
                        <img src={CSGO} alt={type} style={{ width: '100px', height: '100px' }} />
                        <span className="mt-2 block text-sm">{type}</span>
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={openSection === "backgroundClip"} onOpenChange={() => setOpenSection(openSection === "backgroundClip" ? null : "backgroundClip")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-secondary rounded-md">
                  <Label>Select Background Video Clip</Label>
                  {openSection === "backgroundClip" ? <ChevronUp /> : <ChevronDown />}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {backgroundVideos[backgroundVideoType].map((path, index) => (
                      <button
                        key={path}
                        onClick={() => setBackgroundVideoPath(path)}
                        className={`p-2 border rounded-md ${backgroundVideoPath === path ? 'border-primary' : 'border-gray-300'}`}
                      >
                        <span>Clip {index + 1}</span>
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
              </>}
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
