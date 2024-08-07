import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
  X
} from "lucide-react";
import { useAuth } from "../../contexts/Authentication";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import { documentToUserVideo, UserVideo } from "../../types/collections/UserVideo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { VideoRow } from "./videos/VideoRow";
import { Channel, ChannelsTracking } from '../../types/collections/Channels';

export const DashboardVideos: React.FC = () => {
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'all' | 'manual' | 'channel'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  const fetchVideos = useCallback(async () => {
    if (!authState.user?.uid) return;

    setIsLoading(true);
    try {
      let fetchedVideos: UserVideo[] = [];

      if (viewMode === 'all' || viewMode === 'manual') {
        const manualVideos = await fetchManualVideos();
        fetchedVideos = [...fetchedVideos, ...manualVideos];
      }

      if (viewMode === 'all' || viewMode === 'channel') {
        const channelVideos = await fetchChannelVideos();
        fetchedVideos = [...fetchedVideos, ...channelVideos];
      }

      fetchedVideos.sort((a, b) => b.uploadTimestamp - a.uploadTimestamp);
      setVideos(fetchedVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [authState.user, viewMode]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const fetchManualVideos = (): Promise<UserVideo[]> => {
    return new Promise((resolve) => {
      FirebaseFirestoreService.queryDocuments(
        '/videos',
        'uid',
        authState.user!.uid,
        'uid',
        (documents) => {
          resolve(documents.map(doc => documentToUserVideo(doc)));
        }
      );
    });
  };

  const fetchChannelVideos = async (): Promise<UserVideo[]> => {
    const channelIds = await getTrackedChannels();
    const channelVideos: UserVideo[] = [];

    for (const channelId of channelIds) {
      const videos = await fetchVideosForChannel(channelId);
      channelVideos.push(...videos);
    }

    return channelVideos;
  };

  const getTrackedChannels = (): Promise<string[]> => {
    return new Promise((resolve) => {
      FirebaseFirestoreService.getDocument<ChannelsTracking>(
        'channelstracking',
        authState.user!.uid,
        (data) => {
          resolve(data?.channelsTracking || []);
        }
      );
    });
  };

  const fetchVideosForChannel = (channelId: string): Promise<UserVideo[]> => {
    return new Promise((resolve) => {
      FirebaseFirestoreService.queryDocuments<UserVideo>(
        '/videos',
        'channelId',
        channelId,
        'uploadTimestamp',
        (documents) => {
          resolve(documents.map(doc => documentToUserVideo(doc)));
        },
        (error) => {
          console.log(error.message);
        }
      );
    });
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredVideos = videos.filter(video => {
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(video.status);
    const matchesSearch =
      (video.originalFileName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (video.id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesStatus && matchesSearch;
  });

  const resetFilters = () => {
    setStatusFilter([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getUniqueStatuses = () => Array.from(new Set(videos.map(video => video.status)));

  const totalPages = Math.ceil(filteredVideos.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentVideos = filteredVideos.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleViewModeChange = (value: 'all' | 'manual' | 'channel') => {
    setViewMode(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <main className="flex flex-1 flex-col p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Videos Dashboard</h1>
      <p className="text-muted-foreground mb-4">View your manually added videos and videos from tracked channels.</p>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={viewMode} onValueChange={handleViewModeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Videos</SelectItem>
              <SelectItem value="manual">Manually Added</SelectItem>
              <SelectItem value="channel">From Channels</SelectItem>
            </SelectContent>
          </Select>
        </div>
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Video ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Source</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentVideos.map((video) => (
            <React.Fragment key={video.id}>
              {video.id && (
                <VideoRow
                  key={video.id}
                  videoId={video.id}
                  isExpanded={expandedRows.has(video.id)}
                  onToggle={() => toggleRowExpansion(video.id!)}
                  source={video.channelId ? 'Channel' : 'Manual'}
                />
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-muted-foreground">
          {startIndex + 1}-{Math.min(endIndex, filteredVideos.length)} of {filteredVideos.length} row(s) shown.
        </p>
        <div className="flex items-center gap-2">
          <Select onValueChange={handleRowsPerPageChange} value={rowsPerPage.toString()}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Rows per Page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="15">15 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
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