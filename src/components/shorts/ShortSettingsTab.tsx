import React, { useState, useEffect } from "react";
import { deleteShort, Short } from "../../types/collections/Shorts";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import { useNotification } from "../../contexts/NotificationProvider";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, Trash2, Save, Undo2, Video, PanelTop, Columns2, UserRound, Gamepad2 } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "../ui/tooltip";
import { Switch } from "../ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";

export interface ShortSettingsTabProps {
  short: Short;
  shortId: string;
}

export const ShortSettingsTab: React.FC<ShortSettingsTabProps> = ({ short, shortId }) => {
  const [shortIdea, setShortIdea] = useState<string>(short.short_idea);
  const [shortIdeaExplanation, setShortIdeaExplanation] = useState(short.short_idea_explanation);
  const [defaultLineColor, setDefaultLineColor] = useState(short.defaultLineColor || "#000000");
  const [transcriptDisabled, setTranscriptDisabled] = useState(short.transcript_disabled || false);
  const [selectedBoxType, setSelectedBoxType] = useState(short.selected_box_type || "standard_tiktok");
  const [backgroundVideoPath, setBackgroundVideoPath] = useState(short.background_video_path || "");
  const [isChanged, setIsChanged] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    setIsChanged(
      shortIdea !== short.short_idea ||
      shortIdeaExplanation !== short.short_idea_explanation ||
      defaultLineColor !== (short.defaultLineColor || "#000000") ||
      transcriptDisabled !== (short.transcript_disabled || false) ||
      selectedBoxType !== (short.selected_box_type || "standard_tiktok") ||
      backgroundVideoPath !== (short.background_video_path || "")
    );
  }, [shortIdea, shortIdeaExplanation, defaultLineColor, transcriptDisabled, selectedBoxType, backgroundVideoPath, short]);

  const reset = () => {
    setShortIdea(short.short_idea);
    setShortIdeaExplanation(short.short_idea_explanation);
    setDefaultLineColor(short.defaultLineColor || "#000000");
    setTranscriptDisabled(short.transcript_disabled || false);
    setSelectedBoxType(short.selected_box_type || "standard_tiktok");
    setBackgroundVideoPath(short.background_video_path || "");
  };

  const updateShortDetails = () => {
    if (isChanged) {
      FirebaseFirestoreService.updateDocument(
        'shorts',
        shortId,
        {
          short_idea: shortIdea,
          short_idea_explanation: shortIdeaExplanation,
          short_idea_run_id: '',
          defaultLineColor,
          transcript_disabled: transcriptDisabled,
          selected_box_type: selectedBoxType,
          background_video_path: backgroundVideoPath,
        },
        () => { showNotification('Updated', 'Updated Short Information', 'success'); },
        (err) => { showNotification('Update Failed', err.message, 'error'); }
      );
    }
  };

  const boxTypeOptions = [
    { value: "standard_tiktok", label: "Single Panel", icon: <PanelTop className="h-4 w-4 mr-2" /> },
    { value: "two_boxes", label: "Two Panels", icon: <Columns2 className="h-4 w-4 mr-2" /> },
    { value: "reaction_box", label: "Reaction Video", icon: <UserRound className="h-4 w-4 mr-2" /> },
    { value: "half_screen_box", label: "Gameplay", icon: <Gamepad2 className="h-4 w-4 mr-2" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Warning Alert - Only show if needed */}
      {!short.short_idea_run_id && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This idea was not generated by us. Analytics will only update transcript editor.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Short Content</CardTitle>
            <CardDescription>Basic information about this short</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Short Idea */}
            <div>
              <label htmlFor="shortIdea" className="text-sm font-medium block mb-2">
                Short Idea:
              </label>
              <Input
                id="shortIdea"
                value={shortIdea}
                onChange={(e) => setShortIdea(e.target.value)}
                placeholder="Enter short idea"
              />
            </div>

            {/* Idea Justification */}
            <div>
              <label htmlFor="ideaJustification" className="text-sm font-medium block mb-2">
                Idea Justification:
              </label>
              <Textarea
                id="ideaJustification"
                value={shortIdeaExplanation}
                onChange={(e) => setShortIdeaExplanation(e.target.value)}
                placeholder="Why is this idea compelling?"
                rows={3}
              />
            </div>

            {/* Original Transcript with badge for status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Original Transcript:</label>
                <Badge variant={transcriptDisabled ? "destructive" : "outline"}>
                  {transcriptDisabled ? "Disabled" : "Active"}
                </Badge>
              </div>
              <div className="text-sm bg-secondary p-3 rounded-md max-h-40 overflow-y-auto">
                {short.transcript || "No transcript available"}
              </div>
            </div>

            {/* Transcript Toggle */}
            <div className="flex items-center justify-between pt-2">
              <label htmlFor="transcriptDisabled" className="text-sm font-medium">
                Disable Transcript
              </label>
              <Switch
                id="transcriptDisabled"
                checked={transcriptDisabled}
                onCheckedChange={setTranscriptDisabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visual Settings</CardTitle>
            <CardDescription>Configure how your short appears</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Default Line Color */}
            <div>
              <label htmlFor="defaultLineColor" className="text-sm font-medium block mb-2">
                Default Line Color:
              </label>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: defaultLineColor }}></div>
                <Input
                  id="defaultLineColor"
                  type="color"
                  value={defaultLineColor}
                  onChange={(e) => setDefaultLineColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <span className="text-xs text-muted-foreground">{defaultLineColor}</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Layout Selection */}
            <div>
              <label className="text-sm font-medium block mb-3">
                TikTok Layout:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {boxTypeOptions.map((option) => (
                  <Button 
                    key={option.value}
                    variant={selectedBoxType === option.value ? "default" : "outline"}
                    className={`justify-start ${selectedBoxType === option.value ? "" : "border-accent hover:border-primary"}`}
                    onClick={() => setSelectedBoxType(option.value)}
                  >
                    {option.icon}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Gameplay Footage (Optional) - Only show if relevant */}
            {selectedBoxType === "half_screen_box" && (
              <div className="pt-2">
                <label className="text-sm font-medium block mb-2">
                  Gameplay Footage:
                </label>
                <Button 
                  variant={backgroundVideoPath.startsWith("background-gameplay") ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setBackgroundVideoPath("background-gameplay")}
                >
                  <Video className="h-4 w-4 mr-2" />
                  CSGO Surfer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={reset} disabled={!isChanged}>
                      <Undo2 className="h-4 w-4 mr-2" />
                      Reset Changes
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Revert all changes to original values</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={updateShortDetails} disabled={!isChanged}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Only press this if you want to update the short settings.</p>
                    <p>If you manually override these settings, some automated processes may be affected.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" onClick={() => deleteShort(shortId)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Short
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Permanently delete this short</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            Updating short information may affect automated processes and analytics
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};