import React, { useEffect, useState } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Filter,
  Loader2,
  X,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Scissors,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../contexts/Authentication";
import { Short, documentToShort } from "../../types/collections/Shorts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import { Progress } from "../ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { VideoPlayer } from '../video-player/VideoPlayer';
import VideoPlayerModal from '../video-player/VideoPlayerModal';
import { EyeOpenIcon } from '@radix-ui/react-icons';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "!bg-yellow-500 text-black";
      case "Processing":
        return "!bg-blue-500 text-white";
      case "Completed":
        return "!bg-green-500 text-white";
      case "Error":
        return "!bg-red-500 text-white";
      default:
        return "!bg-gray-500 text-white";
    }
  };

  const isProcessing = status === "Processing";

  return (
    <Badge className={`flex items-center gap-1 ${getStatusColor(status)}`}>
      {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
      {status}
    </Badge>
  );
};

export const DashboardShorts: React.FC = () => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(12);
  const { authState } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    FirebaseFirestoreService.queryDocuments(
      '/shorts',
      'uid',
      authState.user && authState.user.uid ? authState.user.uid : '',
      'uid',
      (documents) => {
        const mappedShorts = documents.map(doc => documentToShort(doc));
        const sortedShorts = mappedShorts.sort((a, b) => {
          if (a.last_updated && b.last_updated) {
            return b.last_updated.toMillis() - a.last_updated.toMillis();
          }
          if (a.last_updated) return -1;
          if (b.last_updated) return 1;
          return 0;
        });
        setShorts(sortedShorts);
        setIsLoading(false);
      },
      (error) => {
        console.log(error.message)
        setIsLoading(false);
      }
    );
  }, [authState]);

  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredShorts = shorts.filter(short => {
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(short.short_status);
    const matchesSearch = short.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      short.short_idea.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const resetFilters = () => {
    setStatusFilter([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getUniqueStatuses = () => Array.from(new Set(shorts.map(short => short.short_status)));

  const totalPages = Math.ceil(filteredShorts.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentShorts = filteredShorts.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCardsPerPageChange = (value: string) => {
    setCardsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleRegenerateShort = (shortId: string) => {
    console.log('Regenerating short:', shortId);
    // Implement regeneration logic here
  };

  return (
    <main className="flex flex-1 flex-col p-4 md:p-8 max-w-[100vw]">
      <h1 className="text-2xl font-bold mb-4">Shorts</h1>
      <p className="text-muted-foreground mb-4">Here's a list of your short-form videos created from longer content.</p>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Filter shorts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2" size="sm">
                <Filter className="h-4 w-4" /> Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {getUniqueStatuses().map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => {
                    setStatusFilter(prev =>
                      checked ? [...prev, status] : prev.filter(s => s !== status)
                    );
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {(statusFilter.length > 0 || searchTerm) && (
            <Button variant="ghost" onClick={resetFilters} className="flex items-center gap-2" size="sm">
              Reset <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {
        isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentShorts.map((short) => (
          <Card key={short.id} className="relative w-full !p-2 shadow-md z-0">
            <div className="absolute top-0 left-0 w-full h-full -z-10 rounded-md overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 to-black"></div>
              {short.finished_short_location ? (
                <VideoPlayer
                  path={short.finished_short_location}
                  className="w-full h-full object-cover"
                  loadingText="Loading preview..."
                  autoPlay={false}
                  controls={false}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                  <p className="text-black text-lg font-bold pb-16">No preview available</p>
                </div>
              )}
              </div>
              <VideoPlayerModal 
                trigger={<EyeOpenIcon />}
                path={short.finished_short_location}
                className="w-full h-full object-cover"
                loadingText="Loading preview..."
                autoPlay={false}
              />
            <CardHeader className="p-2 pt-48 overflow-hidden">
              <CardTitle className="text-lg flex justify-between items-center z-5">
                <span className="truncate">{short.short_idea || "Untitled Short"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCardExpansion(short.id)}
                >
                  {expandedCards.has(short.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="flex justify-between items-center mb-2">
                <StatusBadge status={short.short_status} />
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Eye size={12} />
                    {short.views || 0}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Heart size={12} />
                    {short.likes || 0}
                  </Badge>
                </div>
              </div>
              <Progress value={short.update_progress} className="mb-2" />
              <div className="mt-2 space-y-2">
                  <p className="text-xs text-muted-foreground truncate">
                    Idea: {short.short_idea_explanation}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Duration: {((short.end_index - short.start_index) / short.fps).toFixed(2)}s
                  </p>
                </div>
              {expandedCards.has(short.id) && (
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MessageCircle size={12} />
                      {short.comments || 0}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Share2 size={12} />
                      {short.shares || 0}
                    </Badge>
                  </div>
                  {short.tiktok_link && (
                    <a href={short.tiktok_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                      View on TikTok
                    </a>
                  )}
                  <div className="flex justify-between mt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRegenerateShort(short.id)}
                      className="text-xs"
                    >
                      <RefreshCw size={14} className="mr-1" />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(`/shorts?short_id=${short.id}`, '_blank')}
                      className="text-xs"
                    >
                      <Scissors size={14} className="mr-1" />
                      Edit Short
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
        )
      }

      <div className="flex justify-between items-center mt-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {startIndex + 1}-{Math.min(endIndex, filteredShorts.length)} of {filteredShorts.length} short(s) shown.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Select onValueChange={handleCardsPerPageChange} value={cardsPerPage.toString()}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Cards per Page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12 cards</SelectItem>
              <SelectItem value="24">24 cards</SelectItem>
              <SelectItem value="36">36 cards</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </main>
  );
};