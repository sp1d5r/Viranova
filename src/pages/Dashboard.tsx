import React, {useEffect, useState} from 'react';
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart, Smartphone, Tv,
  Users, Video,
} from "lucide-react"

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
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet"
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {Logo} from "../components/logo/logo";
import {DashboardLanding} from "../components/dashboard/DashboardLanding";
import {DashboardChannels} from "../components/dashboard/DashboardChannels";
import {DashboardVideos} from "../components/dashboard/DashboardVideos";
import {DashboardShorts} from "../components/dashboard/DashboardShorts";
import {useAuth} from "../contexts/Authentication";
import {DashboardAnalytics} from "../components/dashboard/DashboardAnalytics";
import {useNotification} from "../contexts/NotificationProvider";
import {Popover, PopoverTrigger, PopoverContent} from "../components/ui/popover";
import {ScrollArea} from "../components/ui/scroll-area";
import FirebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";
import {ChannelsTracking} from "../types/collections/Channels";
import {User} from "../types/User";

interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: number;
}


export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<string>('dashboard');
  const [userDocument, setUserDocument] = useState<User | null>(null);
  const {authState, logout} = useAuth();
  const {showNotification, allNotifications} = useNotification();

  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: 'dashboard', title: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { id: 'channels', title: 'Channels', icon: <Tv className="h-4 w-4" />, badge: 6 },
    { id: 'videos', title: 'Videos', icon: <Video className="h-4 w-4" /> },
    { id: 'shorts', title: 'Shorts', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'analytics', title: 'Analytics', icon: <LineChart className="h-4 w-4" /> },
  ]);

  useEffect(() => {
    if (authState.user) {
      // Get channels
      FirebaseFirestoreService.getDocument<User>(
        "users",
        authState.user.uid,
        (doc) => {
          if (doc) {
            setUserDocument(doc);
          } else {
            // User document doesn't exist, you might want to handle this case
            navigate("/onboarding");
            console.log("User document not found. Consider creating one or redirecting to onboarding.");
          }
        },
        (error) => {
          console.error("Error fetching user document:", error);
          showNotification("Error", "Failed to load user data", "error");
        }
      );

      FirebaseFirestoreService.getDocument<ChannelsTracking>(
        "channelstracking",
        authState.user.uid,
        (doc) => {
          if (doc) {
            setNavItems(
              [
                { id: 'dashboard', title: 'Dashboard', icon: <Home className="h-4 w-4" /> },
                { id: 'channels', title: 'Channels', icon: <Tv className="h-4 w-4" />, badge: doc.channelsTracking.length  },
                { id: 'videos', title: 'Videos', icon: <Video className="h-4 w-4" /> },
                { id: 'shorts', title: 'Shorts', icon: <Smartphone className="h-4 w-4" /> },
                { id: 'analytics', title: 'Analytics', icon: <LineChart className="h-4 w-4" /> },
              ]
            )
          }
        }
      )
    }
  }, [authState])

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && navItems.some(item => item.id === tab)) {
      setSelectedItem(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setSelectedItem(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] text-white ">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Logo />
            </Link>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Toggle notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <CardTitle className="mb-2">Notifications</CardTitle>
                <ScrollArea className="h-[300px]">
                  {allNotifications.length > 0 ? (
                    allNotifications.map((notification, index) => (
                      <div key={index} className="mb-2 p-2 bg-muted rounded-md">
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No notifications</p>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to="#"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    selectedItem === item.id
                      ? 'bg-muted text-primary'
                      : 'text-muted-foreground'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabChange(item.id);
                  }}
                >
                  {item.icon}
                  {item.title}
                  {item.badge && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card x-chunk="A card with a call to action">
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
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
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  to="#"
                  className="flex items-center gap-2 text-lg font-semibold text-white"
                >
                  <Logo />
                </Link>

                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    to="#"
                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${
                      selectedItem === item.id
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                    onClick={() => setSelectedItem(item.id)}
                  >
                    {item.icon}
                    {item.title}
                    {item.badge && (
                      <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto">
                <Card>
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
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-[50%] -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search videos..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {authState.user?.uid ? <DropdownMenuLabel>My Account</DropdownMenuLabel> : <DropdownMenuLabel>Create an Account</DropdownMenuLabel>}
              {authState.user?.uid ? <></> : <DropdownMenuItem>Make a profile and join us on our journey!</DropdownMenuItem>}
              <DropdownMenuSeparator />
              {authState.user?.uid ? <DropdownMenuItem>Settings</DropdownMenuItem> : <DropdownMenuItem><a href="/authenticate">Login</a></DropdownMenuItem>}
              {authState.user?.uid ? <DropdownMenuItem>Support</DropdownMenuItem> : <DropdownMenuItem><a href="/authenticate">Register</a></DropdownMenuItem>}
              <DropdownMenuSeparator />
              {authState.user?.uid && <DropdownMenuItem>
                <Button
                  variant="destructive"
                  className="h-8"
                  onClick={() => {
                    logout(() => {
                        showNotification(
                          "Signed Out",
                          "You've successfully signed out, it might take a second to propagate",
                          "success"
                        )},
                      () => {
                        showNotification(
                          "Failed to Sign Out",
                          "I don't think this is possible... try refreshing.",
                          "warning"
                        )
                      }
                    )}}
                >Logout
                </Button>
              </DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
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
          selectedItem === 'analytics' && <DashboardAnalytics userId={authState.user?.uid}/>
        }
      </div>
    </div>
  )
}
