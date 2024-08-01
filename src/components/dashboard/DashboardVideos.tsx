import React, {useEffect, useState} from 'react';
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
import {useAuth} from "../../contexts/Authentication";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {documentToUserVideo, UserVideo} from "../../types/collections/UserVideo";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select";
import {VideoSegments} from "../../pages/VideoSegments";
import {Progress} from "../ui/progress";

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Uploaded":
        return "!bg-blue-500 text-white";
      case "Link Provided":
        return "!bg-purple-500 text-white";
      case "Transcribing":
      case "Diarizing":
      case "Segmenting":
      case "Summarizing Segments":
        return "!bg-yellow-500 text-black";
      case "Clip Transcripts":
        return "!bg-green-500 text-white";
      case "Preprocessing Complete":
        return "!bg-indigo-500 text-white";
      case "Create TikTok Ideas":
        return "!bg-pink-500 text-white";
      default:
        return "!bg-gray-500 text-white";
    }
  };

  const isProcessing = [
    "Transcribing",
    "Diarizing",
    "Segmenting",
    "Summarizing Segments"
  ].includes(status);

  return (
    <Badge className={`flex items-center gap-1 ${getStatusColor(status)} `}>
      {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
      {status}
    </Badge>
  );
};

export const DashboardVideos: React.FC = () => {
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const {authState} = useAuth();

  useEffect(() => {
    FirebaseFirestoreService.queryDocuments(
      '/videos',
      'uid',
      authState.user && authState.user.uid ? authState.user.uid : '',
      'uid',
      (documents) => {
        console.log(documents);
        setVideos(documents.map(doc => {
          return documentToUserVideo(doc)
        }).sort((elem1, elem2) => {return elem2.uploadTimestamp - elem1.uploadTimestamp}));
      }
    )
  }, [authState]);


  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
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

  return (
    <main className="flex flex-1 flex-col p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Original Videos</h1>
      <p className="text-muted-foreground mb-4">Here's a list of your longer-length videos posted on YouTube.</p>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Filter videos..."
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Video ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentVideos && currentVideos.map((video) => (
            <React.Fragment key={video.id}>
              <TableRow className="cursor-pointer" onClick={() => toggleRowExpansion(video.id ? video.id : 'N/A')}>
                <TableCell>{video.originalFileName}</TableCell>
                <TableCell>

                  <a className="text-primary underline">{video.link}</a></TableCell>
                <TableCell>
                  <StatusBadge status={video.status} />
                </TableCell>
                <TableCell>{video.processingProgress}% <Progress value={video.processingProgress}/></TableCell>
                <TableCell>{new Date(video.uploadTimestamp).toLocaleDateString()}</TableCell>
                <TableCell>
                  {expandedRows.has(video.id ? video.id : 'N/A') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </TableCell>
              </TableRow>
              {expandedRows.has(video.id ? video.id : 'N/A') && (
                <TableRow>
                  <TableCell colSpan={6} className="bg-muted/50">
                    <div className="p-4">
                      <VideoSegments videoId={video.id ? video.id : 'N/A'}/>
                      <h3 className="font-semibold mb-2">Additional Details:</h3>
                      <p>Link: {video.link || 'N/A'}</p>
                      <p>Backend Status: {video.backend_status}</p>
                      <p>Progress Message: {video.progressMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
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