import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Comment, documentToComment } from "../../types/collections/Comments";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "../../contexts/Authentication";
import { useNotification } from "../../contexts/NotificationProvider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import { toNumber } from "lodash";
import { Tag } from "../../types/collections/Tag"
import { ChevronDown, ChevronUp, ThumbsUp } from 'lucide-react';

export const DashboardComments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<Tag>({
    tagName: '',
    description: '',
    exampleComments: [],
    uid: ''
  });

  const { authState } = useAuth();
  const { showNotification } = useNotification();

  const [openTags, setOpenTags] = useState<string[]>([]);

  const toggleTag = (tagId: string) => {
    setOpenTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  useEffect(() => {
    if (authState.user?.uid) {
      FirebaseFirestoreService.queryDocuments(
        '/comments',
        'uid',
        authState.user.uid,
        'createTime',
        (documents) => {
          const qComments: Comment[] = documents.map(doc => documentToComment(doc))
            .sort((elem1, elem2) => {
              const date1 = elem1.createTime ? toNumber(elem1.createTime) : 0;
              const date2 = elem2.createTime ? toNumber(elem2.createTime) : 0;
              return date2 - date1;
            });
          setComments(qComments);
        },
        (error) => {
          showNotification("Error", error.message, "error");
        }
      )
      console.log('here')
      FirebaseFirestoreService.queryDocuments(
        '/comment-tags',
        'uid',
        authState.user.uid,
        'uid',
        (fetchedTags) => {
          console.log('here2')
          if (fetchedTags) {
            setTags(fetchedTags as Tag[]);
          }
        },
        (error) => {
          console.log(error);
          showNotification("Error", error.message, "error");
        }
      );
    }
  }, [authState, showNotification]);


  const handleCommentSelection = (commentId: string) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleCreateTag = () => {
    if (newTag.tagName && newTag.description && authState.user?.uid) {
      setTags(prev => [...prev, { ...newTag, exampleComments: selectedComments, uid: authState.user!.uid }]);
      FirebaseFirestoreService.addDocument(
        'comment-tags',
        { ...newTag, exampleComments: selectedComments, uid: authState.user!.uid },
        (tagId) => {
          setTags(prev => [...prev, { ...{ ...newTag, exampleComments: selectedComments, uid: authState.user!.uid }, id: tagId }]);
          setSelectedComments([]);
          showNotification("Success", "Tag created successfully", "success");
        },
        (error) => {
          showNotification("Error", "Failed to create tag: " + error.message, "error");
        }
      );
      setNewTag({ 
        tagName: '',
        description: '',
        exampleComments: [],
        uid: ''
      });
      setSelectedComments([]);
    }
  };

  // Placeholder function for sentiment - replace with actual sentiment analysis
  const getSentiment = (text: string): number => {
    return Math.floor(Math.random() * 101); // Random number between 0 and 100
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return 'bg-green-500';
    if (sentiment >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <main className="flex flex-1 flex-col p-4 md:p-8 max-w-[100vw]">
      <Card>
        <CardHeader>
          <CardTitle>Create New Tag</CardTitle>
          <CardDescription>Select comments and create a new tag</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Tag Name"
              value={newTag.tagName}
              onChange={e => setNewTag(prev => ({ ...prev, tagName: e.target.value }))}
            />
            <Textarea
              placeholder="Tag Description"
              value={newTag.description}
              onChange={e => setNewTag(prev => ({ ...prev, description: e.target.value }))}
            />
            <Button onClick={handleCreateTag}>Create Tag</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="my-6 !bg-transparent">
        <CardHeader>
          <CardTitle>Existing Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map(tag => (
              <Collapsible key={tag.id} open={openTags.includes(tag.id ?? '')} onOpenChange={() => toggleTag(tag.id ?? '')}>
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{tag.tagName}</CardTitle>
                      {openTags.includes(tag.id ?? '') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <p className="mb-4">{tag.description}</p>
                      <h4 className="font-semibold mb-2">Example Comments:</h4>
                      <div className="space-y-2">
                        {tag.exampleComments.map(commentId => {
                          const comment = comments.find(c => c.id === commentId);
                          return comment ? (
                            <Card key={commentId} className="bg-gray-100">
                              <CardContent className="p-2 text-sm">
                                <p className="truncate">{comment.text}</p>
                              </CardContent>
                            </Card>
                          ) : null;
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className='text-2xl font-bold text-whtie mb-2'>Comments</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {comments.map(comment => {
          const sentiment = getSentiment(comment.text);
          const isSelected = selectedComments.includes(comment.id ?? '');

          return (
            <Card 
              key={comment.id} 
              className={`cursor-pointer transition-colors ${isSelected ? '!bg-green-900' : ''}`}
              onClick={() => handleCommentSelection(comment.id ?? '')}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.avatarThumbnail} alt={comment.uniqueId} />
                    <AvatarFallback>{comment.uniqueId.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="font-bold">{comment.uniqueId}</span>
                </div>
                <p className="mb-2">{comment.text}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp size={16} />
                    <span>{comment.likes}</span>
                  </div>
                  <Badge className={getSentimentColor(sentiment)}>
                    {sentiment}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                {comment.tags && comment.tags.map(tag => (
                  <Badge 
                    key={tag.tag} 
                    variant="secondary"
                    title={tag.explanation} // Add tooltip with explanation
                  >
                    {tag.tag}
                  </Badge>
                ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
};

export default DashboardComments;
