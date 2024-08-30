import React, { useEffect, useState } from 'react';
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
import { Short, documentToShort } from "../../types/collections/Shorts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {toNumber} from "lodash";
import {Progress} from "../ui/progress";

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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { authState } = useAuth();

  useEffect(() => {
    FirebaseFirestoreService.queryDocuments(
      '/shorts',
      'uid',
      authState.user && authState.user.uid ? authState.user.uid : '',
      'uid',
      (documents) => {
        const mappedShorts = documents.map(doc => documentToShort(doc));

        // Sort the shorts array
        const sortedShorts = mappedShorts.sort((a, b) => {
          // If both have last_updated, compare them
          try{
            if (a.last_updated && b.last_updated) {
              return b.last_updated.toMillis() - a.last_updated.toMillis();
            }
          } catch {
            return -1
          }

          // If only a has last_updated, it should come first
          if (a.last_updated) return -1;
          // If only b has last_updated, it should come first
          if (b.last_updated) return 1;
          // If neither has last_updated, maintain their original order
          return 0;
        });

        setShorts(sortedShorts);
      },
      (error) => {
        console.log(error.message)
      }
    );
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

  const totalPages = Math.ceil(filteredShorts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentShorts = filteredShorts.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <main className="flex flex-1 flex-col p-4 md:p-8">
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Short ID</TableHead>
            <TableHead>Short Idea</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentShorts.map((short) => (
            <React.Fragment key={short.id}>
              <TableRow className="cursor-pointer" onClick={() => toggleRowExpansion(short.id)}>
                <TableCell>{short.id}</TableCell>
                <TableCell>{short.short_idea}</TableCell>
                <TableCell>
                  <StatusBadge status={short.short_status} />
                </TableCell>
                <TableCell>
                  <Progress value={short.update_progress}/>
                </TableCell>
                <TableCell>{short.last_updated ? short.last_updated.toDate().toLocaleDateString() : ''}</TableCell>
                <TableCell>
                  {expandedRows.has(short.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </TableCell>
              </TableRow>
              {expandedRows.has(short.id) && (
                <TableRow>
                  <TableCell colSpan={6} className="bg-muted/50">
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">Additional Details:</h3>
                      <p>Video ID: {short.video_id}</p>
                      <p>Segment ID: {short.segment_id}</p>
                      <p>Short Idea Explanation: {short.short_idea_explanation}</p>
                      <p>Progress Message: {short.progress_message}</p>
                      <p>TikTok Link: {short.tiktok_link || 'N/A'}</p>
                      <a className="text-primary underline" href={`/shorts?short_id=${short.id}`}>Open Editor</a>
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
          {startIndex + 1}-{Math.min(endIndex, filteredShorts.length)} of {filteredShorts.length} row(s) shown.
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