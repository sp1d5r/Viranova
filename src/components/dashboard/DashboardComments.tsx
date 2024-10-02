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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Comment, documentToComment } from "../../types/collections/Comments";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "../../contexts/Authentication";
import { useNotification } from "../../contexts/NotificationProvider";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import { toNumber } from "lodash";

interface Tag {
  tagName: string;
  description: string;
  exampleComments: string[];
}

export const DashboardComments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<Tag>({ tagName: '', description: '', exampleComments: [] });

  const { authState } = useAuth();
  const { showNotification } = useNotification();

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
      );
    }
  }, [authState, showNotification]);

  // Initialize tags (replace with actual API call if you have stored tags)
  useEffect(() => {
    setTags([
      { tagName: 'spam', description: 'Comments that involve self promotion, promotion of material, crypto, etc.', exampleComments: [] },
    ]);
  }, []);

  const handleCommentSelection = (commentId: string) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleCreateTag = () => {
    if (newTag.tagName && newTag.description) {
      setTags(prev => [...prev, { ...newTag, exampleComments: selectedComments }]);
      setNewTag({ tagName: '', description: '', exampleComments: [] });
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Comment Analysis</CardTitle>
          <CardDescription>Review and tag comments on your videos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Select</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map(comment => {
                const sentiment = getSentiment(comment.text);
                return (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.avatarThumbnail} alt={comment.uniqueId} />
                          <AvatarFallback>{comment.uniqueId.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span>{comment.uniqueId}</span>
                      </div>
                    </TableCell>
                    <TableCell>{comment.text}</TableCell>
                    <TableCell>
                      <Badge className={getSentimentColor(sentiment)}>
                        {sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* Add tag display logic here */}
                    </TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedComments.includes(comment.id ?? '')}
                        onChange={() => handleCommentSelection(comment.id ?? '')}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Existing Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {tags.map(tag => (
            <div key={tag.tagName} className="mb-4">
              <h3 className="font-bold">{tag.tagName}</h3>
              <p>{tag.description}</p>
              <p>Example Comments: {tag.exampleComments.join(', ')}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
};

export default DashboardComments;
