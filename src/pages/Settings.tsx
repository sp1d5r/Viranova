import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/Authentication";
import FirebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import ScrollableLayout from "../layouts/ScrollableLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../components/ui/use-toast";

export interface SettingsProps {}

interface UserInfo {
  name: string,
  bio: string,
  channelName: string,
  tiktokLink: string,
  primaryColor: string,
  secondaryColor: string,
}
export const SettingsPage: React.FC<SettingsProps> = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    bio: '',
    channelName: '',
    tiktokLink: '',
    primaryColor: '',
    secondaryColor: '',
  });

  useEffect(() => {
    if (authState.user?.uid) {
      FirebaseFirestoreService.getDocument(
        "users",
        authState.user.uid,
        (doc) => {
          if (doc) {
            setUserInfo(doc as UserInfo);
          }
        },
        (error) => {
          console.error("Error fetching user document:", error);
          toast({
            title: "Error",
            description: "Failed to load user data",
            variant: "destructive",
          });
        }
      );
    }
  }, [authState.user, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!authState.user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to update settings.",
        variant: "destructive",
      });
      return;
    }

    try {
      await FirebaseFirestoreService.updateDocument(
        "users",
        authState.user.uid,
        userInfo,
        () => {
          toast({
            title: "Success",
            description: "Your settings have been updated successfully!",
          });
        },
        (error) => {
          toast({
            title: "Error",
            description: "Failed to update settings. Please try again.",
            variant: "destructive",
          });
          console.error("Error updating user document:", error);
        }
      );
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  return (
    <ScrollableLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">User Settings</h1>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList>
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="channel">Channel Information</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={userInfo.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={userInfo.bio}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="channel">
            <Card>
              <CardHeader>
                <CardTitle>Channel Information</CardTitle>
                <CardDescription>Manage your channel settings here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="channelName">Channel Name</Label>
                  <Input
                    id="channelName"
                    name="channelName"
                    value={userInfo.channelName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktokLink">TikTok Link</Label>
                  <Input
                    id="tiktokLink"
                    name="tiktokLink"
                    value={userInfo.tiktokLink}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    name="primaryColor"
                    type="color"
                    value={userInfo.primaryColor}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input
                    id="secondaryColor"
                    name="secondaryColor"
                    type="color"
                    value={userInfo.secondaryColor}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Manage your integrated services.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>OpenAI Integration</Label>
                  <Button>Connect OpenAI</Button>
                </div>
                <div className="space-y-2">
                  <Label>TikTok Integration</Label>
                  <Button>Connect TikTok</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline">Contact Support</Button>
            <Button variant="outline">Request API Access</Button>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </ScrollableLayout>
  );
};