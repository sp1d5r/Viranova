import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react';
import { Query } from '../../../types/collections/Query';
import { ReloadIcon } from '@radix-ui/react-icons';
import { CreditButton } from '../../ui/credit-button';
import { useQueryRequestManagement } from '../../../contexts/QueryRequestProvider';
import { ScrollArea, ScrollBar } from '../../ui/scroll-area';
import { SegmentCard } from './SegmentCard';
import { Button } from '../../ui/button';

interface QueryCardProps {
  query: Query;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'started':
        return '!bg-yellow-500 text-black';
      case 'complete':
        return '!bg-green-500 text-white';
      case 'error':
        return '!bg-red-500 text-white';
      default:
        return '!bg-gray-500 text-white';
    }
  };

  const isProcessing = status === 'started';

  return (
    <Badge className={`flex items-center gap-1 ${getStatusColor(status)} text-xs`}>
      {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
      {status}
    </Badge>
  );
};

export const QueryCard: React.FC<QueryCardProps> = ({ query }) => {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { createQueryRequest } = useQueryRequestManagement();

  return (
    <Card className="w-full mb-4 shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">{query.queryText}</h3>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={query.status} />
            <Badge>{query.queryModel}</Badge>
            <CreditButton 
              creditCost={1}
              confirmationMessage='Are you sure you want to execute this query?'
              onClick={() => {
                createQueryRequest(
                  query.id!,
                  'v1/query-data-catalog',
                  2, // creditCost
                  (requestId) => console.log(`Query request created with ID: ${requestId}`),
                  (error) => console.error('Failed to create query request:', error)
                );
              }}
              variant="outline" 
              size="icon"
            >
              <ReloadIcon className="h-4 w-4" />
            </CreditButton>
            <Button onClick={() => setIsExpanded(!isExpanded)} variant="ghost" size="icon">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <>
            <div className="text-sm text-muted-foreground mt-2">
              <p>Results: {query.queryResults}</p>
              <p>Channel: {query.channelFilter?.join(', ')}</p>
              <p>Videos: {query.videoFilter?.length || 0}</p>
              <p>Created: {new Date(query.queryCreatedAt.toDate()).toLocaleString()}</p>
            </div>
            
            {query.filterResults && query.filterResults.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Query Results:</h4>
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                  <div className="flex p-4">
                    {query.filterResults.map((segment) => (
                      <SegmentCard
                        key={segment.segment_id}
                        segment_id={segment.segment_id}
                        video_id={segment.video_id}
                        isSelected={selectedSegment === segment.segment_id}
                        onSelect={() => setSelectedSegment(segment.segment_id)} 
                        distance={segment.distance}
                      />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};