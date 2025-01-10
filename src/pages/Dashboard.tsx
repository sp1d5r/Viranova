import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/Authentication';
import { useUser } from '../contexts/UserProvider';
import { useNotification } from '../contexts/NotificationProvider';
import { useBrowserNotification } from '../contexts/BrowserNotificationProvider';
import { Logo } from '../components/logo/logo';
import { DashboardLanding } from '../components/dashboard/DashboardLanding';
import { DashboardChannels } from '../components/dashboard/DashboardChannels';
import { DashboardVideos } from '../components/dashboard/DashboardVideos';
import DashboardAssetVideo from "../components/dashboard/DashboardAssetsVideo";
import { DashboardShorts } from '../components/dashboard/DashboardShorts';
import DashboardWYR from '../components/dashboard/DashboardWYR';
import DashboardImages from '../components/dashboard/DashboardImages';
import { DashboardAnalytics } from '../components/dashboard/DashboardAnalytics';
import { SettingsPage } from '../pages/Settings';
import {
  Home,
  Scissors,
  Tv,
  Video,
  Book,
  FileQuestion,
  Newspaper,
  LibraryBig,
  Focus,
  Clapperboard,
  LineChart,
  Settings,
  Bell,
  Menu,
  Search,
  CircleUser,
  LeafyGreenIcon,
  MapIcon,
  SearchCheck,
  MessageSquare,
  ChartNoAxesColumn
} from 'lucide-react';
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Input } from "../components/ui/input"
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { ScrollArea } from "../components/ui/scroll-area";
import {Progress} from "../components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../components/ui/sheet"
import Tour, { ReactourStep } from 'reactour';
import { cn } from '../utils/cn';
import DashboardCatalog from '../components/dashboard/DashboardCatalog';
import DashboardQuery from '../components/dashboard/DashboardQuery';
import DashboardComments from '../components/dashboard/DashboardComments';
import { AnalyticsProvider } from '../contexts/AnalyticsProvider';

interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: number;
  hidden?: boolean;
  children?: NavItem[];
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<string>('dashboard');
  const { authState, logout } = useAuth();
  const { userData, loading } = useUser();
  const { showNotification, allNotifications } = useNotification();
  const [isTourOpen, setIsTourOpen] = useState(false);

  const handleTabChange = (tabId: string) => {
    if (tabId !== selectedItem) {
      setSelectedItem(tabId);
      setSearchParams({ tab: tabId });
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!userData) {
      window.location.href = '/onboarding';
    }
  }, [userData, loading]);

  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: 'dashboard', title: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    {
      id: 'clipping',
      title: 'Clipping',
      icon: <Scissors className="h-4 w-4" />,
      children: [
        { id: 'channels', title: 'Channels', icon: <Tv className="h-4 w-4" /> },
        { id: 'videos', title: 'Videos', icon: <Video className="h-4 w-4" /> },
        { id: 'shorts', title: 'Clips', icon: <Scissors className="h-4 w-4" /> },
      ]
    },
    {
      id: 'original-content',
      title: 'Original Content',
      hidden: true,
      icon: <Book className="h-4 w-4" />,
      children: [
        { id: 'would-you-rather', title: 'Would You Rather', icon: <FileQuestion className="h-4 w-4" /> },
        { id: 'news-videos', title: 'News Videos', icon: <Newspaper className="h-4 w-4" /> },
        { id: 'short-stories', title: 'Short Stories', icon: <Book className="h-4 w-4" /> },
      ]
    },
    {
      id: 'catalog',
      title: 'Data Catalog',
      icon: <Book className="h-4 w-4" />,
    },
    {
      id: 'query',
      title: 'Query Catalog',
      icon: <SearchCheck className="h-4 w-4" />,
    },
    {
      id: 'assets',
      title: 'Assets',
      icon: <LibraryBig className="h-4 w-4" />,
      children: [
        { id: 'asset-images', title: 'Images', icon: <Focus className="h-4 w-4" /> },
        { id: 'asset-videos', title: 'Videos', icon: <Clapperboard className="h-4 w-4" /> },
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <ChartNoAxesColumn className="h-4 w-4" />,
      children: [
        { id: 'analytics-overview', title: 'Analytics Overview', icon: <LineChart className="h-4 w-4" /> },
        { id: 'analytics-comments', title: 'Comments', icon: <MessageSquare className="h-4 w-4" /> },
      ]
    },
    
    { id: 'settings', title: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ]);

  const tourSteps: ReactourStep[] = [
    {
      selector: '[data-id="dashboard"]',
      content: 'This is your main dashboard where you can see an overview of your content.',
      action: () => {handleTabChange('dashboard')},
    },
    {
      selector: '[data-id="dashboard-analytics"]',
      content: 'These are this months key analytics.',
    },
    {
      selector: '[data-id="dashboard-shorts"]',
      content: 'These are the shorts that you have created. Clicking on each row will open up the editor.',
    },
    {
      selector: '[data-id="dashboard-comments"]',
      content: 'These are the latest comments from your TikTok audience.',
    },
    {
      selector: '[data-id="channels"]',
      content: 'This tab shows you all of your channels that are connected to your ViraNova account.',
      action: () => {handleTabChange('channels')},
    },
    {
      selector: '[data-id="channel-id-adder"]',
      content: 'Add in channel IDs to start tracking them, and auto-downloading the videos.',
      observe: '[data-id="dashboard-main"]', // Observe the channels container for changes
      mutationObservables: ['[data-id="channel-id-adder"]'], // Watch for the input to be added
      highlightedSelectors: ['[data-id="channel-id-adder"]'], // Highlight the input when found
    },
    // {
    //   selector: '[data-id="original-content"]',
    //   content: 'Create and manage your original content here.',
    // },
    {
      selector: '[data-id="assets"]',
      content: 'Access and manage your media assets.',
    },
    {
      selector: '[data-id="analytics"]',
      content: 'View detailed analytics about your content performance.',
    },
    {
      selector: '[data-id="settings"]',
      content: 'Edit your account settings and billing information.',
    },
  ];

  const { requestNotificationPermission, notificationPermission } = useBrowserNotification();

  useEffect(() => {
    if (authState.user && notificationPermission === 'default') {
      requestNotificationPermission();
    }
  }, [authState, notificationPermission, requestNotificationPermission]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setSelectedItem(tab);
    }
  }, [searchParams]);

  const renderNavItems = (items: NavItem[]) => {
    return items.filter(item => !item.hidden).map((item) => (
      <div key={item.id} data-id={item.id}>
        {item.children ? (
          <div className="mb-4">
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground">
              {item.icon}
              {item.title}
            </div>
            <div className="ml-4 mt-2 space-y-1">
              {renderNavItems(item.children)}
            </div>
          </div>
        ) : (
          <Link
            to="#"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              selectedItem === item.id ? "bg-accent/50 text-accent-foreground" : "text-muted-foreground"
            )}
            onClick={(e) => {
              e.preventDefault();
              handleTabChange(item.id);
            }}
          >
            {item.icon}
            <span>{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Link>
        )}
      </div>
    ));
  };

  return (
    <AnalyticsProvider userId={authState.user?.uid}>
      <div className="relative min-h-screen w-full max-h-screen">
        <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] text-white h-[100vh]">
          <div className="hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
            <div className="flex-col flex overflow-y-auto h-[100vh]">
              <div className="flex h-16 items-center border-b border-border/40 px-6">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <Logo />
                </Link>
              </div>
              <nav className="grid gap-1 p-4">
                {renderNavItems(navItems)}
              </nav>
              <div className="mt-auto p-4 sticky bottom-0 bg-[#18191B]">
                {authState.isAuthenticated && userData && (userData.subscription && userData.subscription.status === 'active') && (
                  <div className="flex flex-col gap-4">
                    <Card className="w-full px-2 p-2 pt-2 md:p-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Credit quota</h4>
                        <Progress value={Math.round(100 * (userData?.credits?.current || 0) / (userData?.credits?.monthlyAllocation || 10000))} className="h-2 mb-1" />
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>{(userData?.credits?.current || 0).toLocaleString()} remaining</span>
                          <span>{(userData?.credits?.monthlyAllocation || 10000).toLocaleString()} total</span>
                        </div>
                      </div>
                    </Card>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#2D2E32]">
                          <div className="flex items-center gap-2">
                            <CircleUser className="h-8 w-8" />
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium">{userData.name}</span>
                              <span className="text-xs text-gray-400">Project Manager</span>
                            </div>
                          </div>
                          <LeafyGreenIcon className="h-4 w-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <a href="/settings">
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                        </a>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Support
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Button
                            variant="destructive"
                            className="w-full h-8"
                            onClick={() => {
                              logout(() => {
                                showNotification(
                                  "Signed Out",
                                  "You've successfully signed out, it might take a second to propagate",
                                  "success"
                                )
                                window.location.reload();
                              },
                              () => {
                                showNotification(
                                  "Failed to Sign Out",
                                  "I don't think this is possible... try refreshing.",
                                  "warning"
                                )
                              })
                            }}
                          >
                            Logout
                          </Button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                {!authState.isAuthenticated && (
                  <Card>
                    <CardHeader className="p-2 pt-0 md:p-4">
                      <CardTitle>Upgrade to Pro</CardTitle>
                      <CardDescription>
                        Unlock all features and get unlimited access to our support team.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                      <a href="/authenticate">
                        <Button size="sm" className="w-full">
                          Upgrade
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
          <div id="dashboard" className="flex flex-col" data-id="dashboard-main">
            <header className="flex md:hidden h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col overflow-y-scroll">
                  <nav className="grid gap-2 text-lg font-medium">
                    <Link
                      to="#"
                      className="flex items-center gap-2 text-lg font-semibold text-white"
                    >
                      <Logo />
                    </Link>

                    {renderNavItems(navItems)}
                  </nav>
                  <div className="mt-auto">
                    {
                      !authState.isAuthenticated && <Card>
                        <CardHeader>
                          <CardTitle>Upgrade to Pro</CardTitle>
                          <CardDescription>
                            Unlock all features and get unlimited access to our
                            support team.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button size="sm" className="w-full">
                            Upgrade
                          </Button>
                        </CardContent>
                      </Card>
                    }

                    {userData && (!userData.subscription && userData.subscription!.status != 'active') && <Card>
                      <CardHeader>
                        <CardTitle>Upgrade to Pro</CardTitle>
                        <CardDescription>
                          Unlock all features and get unlimited access to our
                          support team.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button size="sm" className="w-full">
                          Upgrade
                        </Button>
                      </CardContent>
                    </Card>}

                    {authState.isAuthenticated && userData && (userData.subscription && userData.subscription.status === 'active') &&
                      <div className="flex gap-2 text-sm font-bold items-center text-primary">
                        <Card className="mt-auto w-full px-2 p-2 pt-2 md:p-4">
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-2">Credit quota</h4>
                            <Progress value={40} className="h-2 mb-1" />
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{(userData?.credits?.current || 0).toLocaleString()} remaining</span>
                              <span>{(userData?.credits?.monthlyAllocation || 10000).toLocaleString()} total</span>
                            </div>
                          </div>
                          <Button className="w-full mb-4">Upgrade</Button>
                          <div className="flex items-center justify-between">
                            <a className="/settings">
                              <Button variant="outline" size="icon">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </a>
                            <div className="flex items-center gap-2">
                              <LeafyGreenIcon className="w-5 h-5" />
                              <span className="text-sm font-medium">{userData.name}</span>
                            </div>
                          </div>
                        </Card>
                      </div>
                    }
                  </div>
                </SheetContent>
              </Sheet>
            </header>

            {
              selectedItem === 'dashboard' && <DashboardLanding />
            }

            {
              selectedItem === 'channels' && <DashboardChannels userId={authState.user?.uid}/>
            }

            {
              selectedItem === 'videos' && <DashboardVideos />
            }

            {
              selectedItem === 'shorts' && <DashboardShorts />
            }

            {
              selectedItem === 'would-you-rather' && <DashboardWYR />
            }

            {
              selectedItem === 'asset-images' && <DashboardImages />
            }

            {
              selectedItem === 'asset-videos' && <DashboardAssetVideo />
            }

            {
              selectedItem === 'catalog' && <DashboardCatalog />
            }
            
            {
              selectedItem === 'query' && <DashboardQuery />
            }
            
            {
              selectedItem === 'analytics-overview' && <DashboardAnalytics userId={authState.user?.uid}/>
            }

            {
              selectedItem === 'analytics-comments' && <DashboardComments />
            }

            {
              selectedItem === 'settings' && <SettingsPage fullScreen={false} />
            }
          </div>
        </div>
        
        <Tour
          steps={tourSteps}
          isOpen={isTourOpen}
          onRequestClose={() => setIsTourOpen(false)}
          update={selectedItem}
          updateDelay={500}
          className={cn(
            // Helper styles
            "!bg-background !text-text",
            "!border !border-accent !rounded-lg !shadow-lg",
            // Close button
            "[&>button]:!text-text [&>button]:hover:!text-primary",
            // Navigation dots
            "[&>nav>button]:!bg-accent [&>nav>button]:!w-3 [&>nav>button]:!h-3",
            "[&>nav>button[data-tour-elem='dot--active']]:!bg-primary",
            // Navigation buttons
            "[&>div>button]:!text-white",
            "&>div>button]:hover:!text-white",
            // Content
            "[&>div]:!p-6"
          )}
          rounded={8}
          accentColor="#35DC32"
          badgeContent={(curr, tot) => (
            <span className="bg-primary font-montserrat text-background px-2 py-1 rounded-full text-sm">
              {curr} of {tot}
            </span>
          )}
        />
      </div>
    </AnalyticsProvider>
  )
}
