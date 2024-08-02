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
  Users, ChevronLeft, ChevronRight,
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

interface UserComment {
  id: string;
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  comment: string;
  timestamp: string;
};

const dummyComments: UserComment[] = [
  {
    id: '1',
    user: {
      name: 'Olivia Martin',
      avatar: '/avatars/01.png',
      username: '@olivia_m',
    },
    comment: 'This video is fire! 🔥 Keep up the great content!',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    user: {
      name: 'Jackson Lee',
      avatar: '/avatars/02.png',
      username: '@jackson_l',
    },
    comment: 'How did you do that transition? It\'s so smooth!',
    timestamp: '3 hours ago',
  },
  {
    id: '3',
    user: {
      name: 'Isabella Nguyen',
      avatar: '/avatars/03.png',
      username: '@bella_n',
    },
    comment: 'Your editing skills are on point! 👌',
    timestamp: '5 hours ago',
  },
  {
    id: '4',
    user: {
      name: 'William Kim',
      avatar: '/avatars/04.png',
      username: '@will_k',
    },
    comment: 'This trend is everywhere! You nailed it though!',
    timestamp: '1 day ago',
  },
  {
    id: '5',
    user: {
      name: 'Sofia Davis',
      avatar: '/avatars/05.png',
      username: '@sofia_d',
    },
    comment: 'Can you do a tutorial on how you made this? It\'s awesome!',
    timestamp: '1 day ago',
  },
];

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


export const DashboardLanding : React.FC<DashboardLandingProps> = ({}) => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [selectedShort, setSelectedShort] = useState<string | null>(null);
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
          setShorts(documents.map(doc => documentToShort(doc))
            .sort((elem1, elem2) => toNumber(elem2.last_updated) - toNumber(elem1.last_updated)));
        },
        (error) => {
          showNotification("Error", error.message, "error");
        }
      );
    }
  }, [authState]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const allAnalytics: Analytics[] = [];
      for (const short of shorts) {
        await new Promise<void>((resolve) => {
          FirebaseFirestoreService.queryDocuments<Analytics>(
            'analytics',
            'shortId',
            short.id,
            'taskTime',
            (docs) => {
              if (docs.length > 0) {
                allAnalytics.push(docs[docs.length - 1]);
              }
              console.log(allAnalytics);
              showNotification("Success", "Analytics Collected, analysis needed.", "success");
              resolve();
            },
            (error) => {
              showNotification("Error", error.message, "error");
              console.log(error)
            }
          );
        });
      }
      setAnalytics(allAnalytics);
    };

    if (shorts.length > 0) {
      fetchAnalytics();
      console.log('allanlytics', analytics);
    }
  }, [shorts]);

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
    if (analytics && analytics.length > 0) {
      const processedData = analytics.map(item => {
        const videoAnalytics = item.videoAnalytics[0]; // Most recent video analytics
        return {
          id: videoAnalytics.id,
          description: videoAnalytics.text,
          link: videoAnalytics.webVideoUrl,
          likes: videoAnalytics.diggCount,
          comments: videoAnalytics.commentCount,
          views: videoAnalytics.playCount,
          date: new Date(videoAnalytics.createTime * 1000).toISOString(),
        };
      });
      setTikTokVideoData(processedData);

      // Calculate totals and changes
      const currentDate = new Date();
      const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());

      let totalViews = 0, totalLikes = 0, totalComments = 0;
      let lastMonthViews = 0, lastMonthLikes = 0, lastMonthComments = 0;

      processedData.forEach(video => {
        const videoDate = new Date(video.date);
        if (videoDate >= lastMonthDate) {
          totalViews += video.views;
          totalLikes += video.likes;
          totalComments += video.comments;
        } else {
          lastMonthViews += video.views;
          lastMonthLikes += video.likes;
          lastMonthComments += video.comments;
        }
      });

      const viewsChange = ((totalViews - lastMonthViews) / lastMonthViews) * 100;
      const likesChange = ((totalLikes - lastMonthLikes) / lastMonthLikes) * 100;
      const commentsChange = ((totalComments - lastMonthComments) / lastMonthComments) * 100;

      // Get the most recent follower count and update time
      const mostRecentAnalytics = analytics.reduce((latest, current) => {
        return new Date(latest.taskTime.seconds * 1000) > new Date(current.taskTime.seconds * 1000) ? latest : current;
      });

      const followerCount = mostRecentAnalytics.videoAnalytics[0].authorMeta.fans;
      const followerCountUpdated = new Date(mostRecentAnalytics.taskTime.seconds * 1000).toLocaleString();

      setAnalyticsSummary({
        totalViews,
        totalLikes,
        totalComments,
        viewsChange,
        likesChange,
        commentsChange,
        followerCount,
        followerCountUpdated,
      });
    }
  }, [analytics]);

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

  return <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Followers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analyticsSummary.followerCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Last updated: {analyticsSummary.followerCountUpdated}
          </p>
        </CardContent>
      </Card>
    </div>
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <Card
        className="xl:col-span-2"
        x-chunk="A card showing a table of recent views on the shorts posted."
      >
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Short Views</CardTitle>
            <CardDescription>
              Overview of the views received on your shorts.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link to="#">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background">Description</TableHead>
                    <TableHead className="sticky top-0 bg-background">Likes</TableHead>
                    <TableHead className="sticky top-0 bg-background">Comments</TableHead>
                    <TableHead className="sticky top-0 bg-background">Views</TableHead>
                    <TableHead className="sticky top-0 bg-background hidden md:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiktokVideoData.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        <div className="font-medium">{video.description}</div>
                        <a href={video.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {video.link.substring(0, 30)}...
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{video.likes.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{video.comments.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{video.views.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{video.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
          <CardDescription>Latest feedback from your TikTok audience</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="h-[400px] overflow-y-auto pr-4">
            <div className="grid gap-6">
              {dummyComments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                    <AvatarFallback>{comment.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium leading-none">{comment.user.name}</p>
                      <p className="ml-2 text-sm text-muted-foreground">{comment.user.username}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.comment}</p>
                    <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </main>
}