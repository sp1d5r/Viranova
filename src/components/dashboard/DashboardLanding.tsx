import React, {useEffect, useMemo, useState} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"

import {
  Activity,
  ArrowUpRight,
  MessageCircle,
  Eye,
  Heart,
  Users, ChevronLeft, ChevronRight, ChevronUp, Plus,
  Bell,
  Settings,
} from "lucide-react"
import {
  Avatar,
    AvatarFallback,
    AvatarImage,
} from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import {Link} from "react-router-dom";
import {documentToShort, Short} from "../../types/collections/Shorts";
import {Analytics} from "../../types/collections/Analytics";
import {useNotification} from "../../contexts/NotificationProvider";
import FirebaseFirestoreService from "../../services/database/strategies/FirebaseFirestoreService";
import {toNumber} from "lodash";
import {useAuth} from "../../contexts/Authentication";
import {Comment, documentToComment} from "../../types/collections/Comments";
import {Input} from "../ui/input";
import { getVideoInfo } from '../../services/youtube';
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export interface DashboardLandingProps {

}

interface TikTokVideo {
  id: string;
  description: string;
  link: string;
  likes: number;
  comments: number;
  views: number;
  date: string;
}

const dummyData: TikTokVideo[] = [
  {
    id: '1',
    description: 'Dance challenge #trending',
    link: 'https://www.tiktok.com/@user/video/1234567890123456789',
    likes: 1500000,
    comments: 50000,
    views: 5000000,
    date: '2023-07-15',
  },
  {
    id: '2',
    description: 'Cooking hack you won\'t believe! 😱🍳',
    link: 'https://www.tiktok.com/@user/video/2345678901234567890',
    likes: 750000,
    comments: 30000,
    views: 2000000,
    date: '2023-07-16',
},
{
    id: '3',
    description: 'Cute puppy does tricks 🐶',
    link: 'https://www.tiktok.com/@user/video/3456789012345678901',
    likes: 2000000,
    comments: 100000,
    views: 8000000,
    date: '2023-07-17',
},
{
    id: '4',
    description: 'DIY room decor ideas 🎨',
    link: 'https://www.tiktok.com/@user/video/4567890123456789012',
    likes: 500000,
    comments: 25000,
    views: 1500000,
    date: '2023-07-18',
},
{
    id: '5',
    description: 'Life hack: How to fold a shirt in 2 seconds',
    link: 'https://www.tiktok.com/@user/video/5678901234567890123',
    likes: 1000000,
    comments: 40000,
    views: 3000000,
    date: '2023-07-19',
},
];

const ITEMS_PER_PAGE = 5;

interface AnalyticsSummary {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  viewsChange: number;
  likesChange: number;
  commentsChange: number;
  followerCount: number;
  followerCountUpdated: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const DashboardLanding : React.FC<DashboardLandingProps> = ({}) => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [comments, setComments] = useState<Comment[]>([])
  const [newVideoLink, setNewVideoLink] = useState('');
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const { showNotification } = useNotification();
  const {authState} = useAuth();

  useEffect(() => {
    if (authState.user?.uid) {
      FirebaseFirestoreService.queryDocuments(
        '/shorts',
        'uid',
        authState.user.uid,
        'last_updated',
        (documents) => {
          const shorts: Short[] = documents.map(doc => documentToShort(doc))
            .sort((elem1, elem2) => {
              const date1 = elem1.last_updated ? toNumber(elem1.last_updated) : 0;
              const date2 = elem2.last_updated ? toNumber(elem2.last_updated) : 0;
              return date2 - date1;
            })
          setShorts(shorts);
        },
        (error) => {
          showNotification("Error", error.message, "error");
        }
      );
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
            })
          setComments(qComments);
        },
        (error) => {
          showNotification("Error", error.message, "error");
        }
      );
    }
  }, [authState]);


  const [tiktokVideoData, setTikTokVideoData] = useState<TikTokVideo[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary>({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    viewsChange: 0,
    likesChange: 0,
    commentsChange: 0,
    followerCount: 0,
    followerCountUpdated: '',
  });

  useEffect(() => {
    if (shorts && shorts.length > 0) {
      const currentDate = new Date();
      const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());

      const processedData: TikTokVideo[] = shorts
        .filter(short => {
          if (short.last_updated){
            try {
              const shortDate = short.last_updated.toDate();
              return !isNaN(shortDate.getTime());
            } catch {
              return false
            }
          } else {
            return false
          }
        })
        .map(short => {
          return {
            id: short.id || 'Unknown',
            description: short.short_idea || 'No description',
            link: short.tiktok_link || 'No Link Specified...',
            likes: short.likes || 0,
            comments: short.comments || 0,
            views: short.views || 0,
            date: short.last_updated.toDate().toString() || short.last_updated.toString() || 'Invalid Date',
          };
        });

      setTikTokVideoData(processedData);

      let totalViews = 0, totalLikes = 0, totalComments = 0;

      processedData.forEach(video => {
        totalViews += video.views;
        totalLikes += video.likes;
        totalComments += video.comments;
      });

      // Since we're only looking at the last month, we don't need to calculate changes
      // If you want to compare to the previous month, you'd need to fetch that data separately

      setAnalyticsSummary({
        totalViews,
        totalLikes,
        totalComments,
        viewsChange: 0, // Set to 0 or remove if not needed
        likesChange: 0, // Set to 0 or remove if not needed
        commentsChange: 0, // Set to 0 or remove if not needed
        followerCount: 0, // You might want to update this if you have follower data
        followerCountUpdated: 'N/A',
      });
    }
  }, [shorts]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const {
    totalPages,
    currentPageData
  } = useMemo(() => {
    const totalPages = Math.ceil(tiktokVideoData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageData = tiktokVideoData.slice(startIndex, endIndex);

    return {
      totalPages,
      currentPageData
    };
  }, [tiktokVideoData, currentPage, ITEMS_PER_PAGE]);

  useEffect(() => {
    setCurrentPage(1);
  }, [tiktokVideoData]);

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  }

  const extractVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const handleAddVideo = async () => {
    if (authState.user?.uid) {
      if (newVideoLink) {
        if (isValidYouTubeUrl(newVideoLink)) {
        try {
          const videoId = extractVideoId(newVideoLink);
          const videoInfo = await getVideoInfo(videoId);
          
          if (videoInfo) {
            FirebaseFirestoreService.addDocument("videos", {
              ...videoInfo,
              uid: authState.user!.uid,
              processingProgress: 0,
              status: "Link Provided",
              previousStatus: "Started...",
              uploadTimestamp: Date.now(),
              progressMessage: "Performing Download",
              queuePosition: -1,
              link: newVideoLink,
            },
            (doc_id) => {
              showNotification(
                "Video Added!",
                `Successfully added new video: ${doc_id}`,
                "success",
                10000
              );
              setNewVideoLink('');
              setIsAddingVideo(false);
              window.location.href = `/video-handler?video_id=${doc_id}`
            },
            (err) => {
              console.log(err);
              showNotification(
                "Error Adding Video",
                'Failed to add video... Please try again later.',
                "error",
                10000
              );
            });
          } else {
            showNotification("Error", "Failed to fetch video information", "error");
          }
        } catch (error) {
          console.error("Error adding video:", error);
          showNotification("Error", "An error occurred while adding the video", "error");
        } 
      } else {
        showNotification("Invalid Link", "Please provide a valid YouTube link.", "error");
      }
      } else {
          showNotification("No Link", "You need to add a YouTube link", "error");
        }
    } else {
      console.log("No user");
      window.location.href = "/authenticate";
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 md:gap-6 md:p-6">
      {/* Top Section with Welcome/Invite Card */}
      <Card className="w-full bg-[#f8f9fc] dark:bg-[#047857] border-none rounded-2xl overflow-hidden">
        <CardContent className="flex items-center justify-between p-8">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Welcome back!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You have {shorts.length} videos uploaded. Your total view count is {analyticsSummary.totalViews.toLocaleString()}.
            </p>
          </div>
          <Button 
            onClick={() => setIsAddingVideo(!isAddingVideo)}
            className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black rounded-xl px-6"
          >
            Add New Video
            <Plus className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {isAddingVideo && (
        <Card className="bg-[#f8f9fc] dark:bg-[#1c1c1c] border-none rounded-2xl">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter YouTube video link"
                value={newVideoLink}
                onChange={(e) => setNewVideoLink(e.target.value)}
                className="flex-grow bg-white/80 dark:bg-black/20 border-none rounded-xl"
              />
              <Button 
                onClick={handleAddVideo} 
                disabled={!newVideoLink}
                className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black rounded-xl"
              >
                Add Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Section */}
      <div className="grid gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#f8f9fc] dark:bg-[#1c1c1c] border-none shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsSummary.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsSummary.viewsChange > 0 ? '+' : ''}{analyticsSummary.viewsChange.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#f8f9fc] dark:bg-[#1c1c1c] border-none shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsSummary.totalLikes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsSummary.likesChange > 0 ? '+' : ''}{analyticsSummary.likesChange.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#f8f9fc] dark:bg-[#1c1c1c] border-none shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsSummary.totalComments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsSummary.commentsChange > 0 ? '+' : ''}{analyticsSummary.commentsChange.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#f8f9fc] dark:bg-[#1c1c1c] border-none shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsSummary.followerCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last updated: {analyticsSummary.followerCountUpdated}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Videos Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Videos</h2>
            <Button variant="ghost" className="text-gray-500">
              See all
            </Button>
          </div>

          <div className="space-y-4">
            {currentPageData.length > 0 ? (
              currentPageData.map((video) => (
                <Card 
                  key={video.id} 
                  className="bg-[#f8f9fc] dark:bg-[#1c1c1c] border-none shadow-sm rounded-xl"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm break-words line-clamp-2">
                          {video.description}
                        </h3>
                        <a 
                          href={video.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-primary hover:underline break-all line-clamp-1"
                        >
                          {video.link}
                        </a>
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {new Date(video.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {video.views.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {video.likes.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {video.comments.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-[#f8f9fc] dark:bg-[#1c1c1c] border-none shadow-sm rounded-xl">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <Activity className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Videos Posted Yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Start adding videos to see them appear here
                  </p>
                  <Button 
                    onClick={() => setIsAddingVideo(true)}
                    className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black rounded-xl"
                  >
                    Add Your First Video
                    <Plus className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Right Sidebar Content */}
        <div className="space-y-6">
          {/* Recent Comments */}
          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Comments</CardTitle>
                <Button variant="ghost" className="text-gray-500 hover:text-gray-900">
                  See more
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {/* Header Row */}
              <div className="bg-[#f8f9fc] rounded-lg dark:bg-[#1c1c1c] grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 text-sm text-gray-500">
                <div>User</div>
                <div>Likes</div>
                <div>Replies</div>
                <div>Date</div>
              </div>

              {/* Comments List */}
              <motion.div 
                className="space-y-2"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {comments.slice(0, 5).map((comment) => (
                  <motion.div
                    key={comment.id}
                    variants={item}
                    className="bg-[#f8f9fc] dark:bg-[#1c1c1c]  grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {/* User & Avatar */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.avatarThumbnail} />
                        <AvatarFallback>{comment.uniqueId.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{comment.uniqueId}</div>
                        <p className="text-sm text-gray-500 line-clamp-1">{comment.text}</p>
                      </div>
                    </div>

                    {/* Likes */}
                    <div className="text-sm font-medium">
                      {comment.likes.toLocaleString()}
                    </div>

                    {/* Reply Count */}
                    <div className="text-sm font-medium">
                      {comment.replyCommentTotal.toLocaleString()}
                    </div>

                    {/* Date */}
                    <div className="text-sm text-gray-500">
                      {new Date(comment.createTime.toDate()).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>

          {/* Videos in Progress */}
          <Card className="bg-[#f8f9fc] dark:bg-[#1c1c1c] border-none shadow-sm rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Videos in Progress</CardTitle>
                <Button variant="ghost" className="text-gray-500">
                  See more
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add your videos in progress list here */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}