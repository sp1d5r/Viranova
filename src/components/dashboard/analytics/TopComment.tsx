import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Comment } from "../../../types/collections/Comments";

interface TopCommentsProps {
  comments: Comment[];
}

const TopComments: React.FC<TopCommentsProps> = ({ comments }) => {
  const sortedComments = comments
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {sortedComments.map(comment => (
            <li key={comment.id} className="border-b pb-2">
              <p className="font-semibold">{comment.uniqueId}</p>
              <p>{comment.text}</p>
              <p className="text-sm text-gray-500">Likes: {comment.likes}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TopComments;