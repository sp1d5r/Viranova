import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import FirebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import { Analytics, VideoAnalytics } from "../types/collections/Analytics";
import { Short } from "../types/collections/Shorts";
import { useNotification } from "./NotificationProvider";

export interface DailyShortAnalytics {
  shortId: string;
  date: Date;
  metrics: {
    [key: string]: number;
  };
}

export interface CumulativeShortAnalytics {
  date: Date;
  metrics: {
    [key: string]: number;
  };
}

export interface KeyMetrics {
  diggCount: number;
  playCount: number;
  commentCount: number;
}

interface ShortKeyMetrics {
  [key: string]: KeyMetrics;
} 

export interface ShortAnalytics {
  id: string;
  shortIdea: string;
  hashtags: string[];
  music: string;
  dailyMetrics: {
    date: Date;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }[];
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  // Add any other static fields you want to include
}

interface AnalyticsContextType {
  shorts: Short[];
  analytics: Analytics[];
  selectedShortId: string | null;
  setSelectedShortId: (shortId: string | null) => void;
  getDailyAnalytics: (metric: keyof VideoAnalytics | keyof VideoAnalytics['authorMeta']) => DailyShortAnalytics[];
  getCumulativeAnalytics: (metric: keyof VideoAnalytics | keyof VideoAnalytics['authorMeta']) => CumulativeShortAnalytics[];
  getShortAnalytics: (shortId: string) => ShortAnalytics | null;
  getTotalMetrics: KeyMetrics;
  isLoading: boolean;
  error: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode; userId: string | undefined }> = ({ children, userId }) => {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [shortMetrics, setShortMetrics] = useState<ShortKeyMetrics>({});
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [selectedShortId, setSelectedShortId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      setError(null);

      FirebaseFirestoreService.queryDocuments(
        '/shorts',
        'uid',
        userId,
        'last_updated',
        (documents) => {
          const sortedShorts = documents
            .map(doc => (doc as Short))
            .sort((a, b) => b.last_updated.toMillis() - a.last_updated.toMillis());
          setShorts(sortedShorts);
          showNotification("Success", "Short data collected!", "success");
          setIsLoading(false);
        },
        (error) => {
          setError(error.message);
          showNotification("Error", error.message, "error");
          setIsLoading(false);
        }
      );
    }
  }, [userId]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

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
                allAnalytics.push(...docs);
              }
              resolve();
            },
            (error) => {
              setError(error.message);
              showNotification("Error", error.message, "error");
              console.log(error);
            }
          );
        });
      }
      setAnalytics(allAnalytics);
      setIsLoading(false);
    };

    if (shorts.length > 0) {
      fetchAnalytics();
    }
  }, [shorts]);

  const getSelectedShortAnalytics = useMemo(() => {
    return () => {
      if (!selectedShortId) return null;
      return analytics.filter(a => a.shortId === selectedShortId);
    };
  }, [selectedShortId, analytics]);

  const getDailyAnalytics = useMemo(() => {
    return (metric: keyof VideoAnalytics | keyof VideoAnalytics['authorMeta']) => {
      const dailyAnalytics: DailyShortAnalytics[] = [];

      shorts.forEach(short => {
        const shortAnalytics = analytics.filter(a => a.shortId === short.id);
        
        const dailyData: { [key: string]: DailyShortAnalytics } = {};

        shortAnalytics.forEach(a => {
          const date = a.taskTime.toDate();
          const dateKey = date.toISOString().split('T')[0];


          if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
              shortId: short.id,
              date: new Date(dateKey),
              metrics: {}
            };
          }

          const value = a.videoAnalytics[0]
            ? (metric in a.videoAnalytics[0]
              ? (a.videoAnalytics[0][metric as keyof VideoAnalytics] as number) || 0
              : (a.videoAnalytics[0].authorMeta && a.videoAnalytics[0].authorMeta[metric as keyof VideoAnalytics['authorMeta']] as number) || 0)
            : 0;

          dailyData[dateKey].metrics[metric] = Math.max(dailyData[dateKey].metrics[metric] || 0, value);
        });

        Object.values(dailyData).forEach(data => dailyAnalytics.push(data));
      });

      return dailyAnalytics.sort((a, b) => a.date.getTime() - b.date.getTime());
    };
  }, [shorts, analytics]);

  const getCumulativeAnalytics = useMemo(() => {
    return (metric: keyof VideoAnalytics | keyof VideoAnalytics['authorMeta']) => {
      const dailyAnalytics = getDailyAnalytics(metric);
      const cumulativeAnalytics: CumulativeShortAnalytics[] = [];
  
      const dateTotals: { [key: string]: number } = {};
      const dateCumulatives: { [key: string]: number } = {};
  
      dailyAnalytics.forEach(daily => {
        const dateKey = daily.date.toISOString().split('T')[0];
        
        if (!dateTotals[dateKey]) {
          dateTotals[dateKey] = 0;
        }
        dateTotals[dateKey] += daily.metrics[metric];
      });
  
      Object.entries(dateTotals).sort(([a], [b]) => a.localeCompare(b)).forEach(([dateKey, total]) => {
        cumulativeAnalytics.push({
          date: new Date(dateKey),
          metrics: {
            [metric]: total
          }
        });
      });
  
      return cumulativeAnalytics;
    };
  }, [getDailyAnalytics]);

  const getTotalMetrics = useMemo(() => {
    const latestAnalytics: ShortKeyMetrics = {};

    shorts.forEach(short => {
      const shortId: string = short.id;
      const shortAnalytics: Analytics[] = analytics
        .filter(a => a.shortId === short.id)
        .sort((short1, short2) => { return short1.taskTime.toMillis() - short2.taskTime.toMillis()})
      
      const shortLatestAnalytics = shortAnalytics[shortAnalytics.length - 1];
      
      if (shortLatestAnalytics) {
        latestAnalytics[shortId] = {
          diggCount: shortLatestAnalytics.videoAnalytics[0].diggCount,
          playCount: shortLatestAnalytics.videoAnalytics[0].playCount,
          commentCount: shortLatestAnalytics.videoAnalytics[0].commentCount,
        };
      }
    })

    setShortMetrics(latestAnalytics);
    const latestMetrics : KeyMetrics = {
      playCount: 0,
      diggCount: 0,
      commentCount: 0
    }
    for (const [key, value] of Object.entries(latestAnalytics)) {
      latestMetrics.playCount += value.playCount;
      latestMetrics.diggCount += value.diggCount;
      latestMetrics.commentCount += value.commentCount;
    }
    return latestMetrics;
  }, [ shorts, analytics ])

  const getShortAnalytics = useMemo(() => {
    return (shortId: string): ShortAnalytics | null => {
      const short = shorts.find(s => s.id === shortId);
      if (!short) return null;

      const shortAnalytics = analytics.filter(a => a.shortId === shortId);
      if (shortAnalytics.length === 0) return null;

      const dailyMetrics = shortAnalytics.map(a => ({
        date: a.taskTime.toDate(),
        views: a.videoAnalytics[0]?.playCount || 0,
        likes: a.videoAnalytics[0]?.diggCount || 0,
        comments: a.videoAnalytics[0]?.commentCount || 0,
        shares: a.videoAnalytics[0]?.shareCount || 0,
      })).sort((a, b) => a.date.getTime() - b.date.getTime());

      const latestAnalytics = shortAnalytics[shortAnalytics.length - 1].videoAnalytics[0];

      return {
        id: short.id,
        shortIdea: short.short_idea,
        hashtags: latestAnalytics.hashtags || [],
        music: latestAnalytics.musicMeta?.musicName || 'No music',
        dailyMetrics,
        totalViews: latestAnalytics.playCount || 0,
        totalLikes: latestAnalytics.diggCount || 0,
        totalComments: latestAnalytics.commentCount || 0,
        totalShares: latestAnalytics.shareCount || 0,
        // Add any other static fields you want to include
      };
    };
  }, [shorts, analytics]);
  

  const value = {
    shorts,
    analytics,
    selectedShortId,
    setSelectedShortId,
    getDailyAnalytics,
    getCumulativeAnalytics,
    getShortAnalytics,
    getTotalMetrics,
    isLoading,
    error,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
