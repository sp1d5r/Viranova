import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, Settings, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from '../ui/sheet';
import { useAuth } from "../../contexts/Authentication";
import { useNotification } from "../../contexts/NotificationProvider";
import { Logo } from "../logo/logo";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

interface NavLinkProps {
    to: string;
    children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => (
  <Link to={to} className="text-sm font-medium transition-colors hover:text-primary">
      {children}
  </Link>
);

interface OptionProps {
    title: string;
    description: string;
    link: string;
}

interface NavMenuProps {
    name: string;
    options: OptionProps[];
}

const NavMenu: React.FC<NavMenuProps> = ({ name, options }) => (
  <DropdownMenu>
      <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-1 text-white">
              {name} <ChevronDown className="h-4 w-4" />
          </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/30 backdrop-blur border border-white">
          {options.map((option, index) => (
            <DropdownMenuItem key={index} className="text-white hover:bg-white/10">
                <Link to={option.link} className="w-full">
                    <div>
                        <div className="font-medium">{option.title}</div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                </Link>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
  </DropdownMenu>
);

export const TransparentNavigationBar = () => {
    const { authState, logout } = useAuth();
    const { showNotification, allNotifications } = useNotification();

    const handleLogout = () => {
        logout(
          () => {
              showNotification(
                "Signed Out",
                "You've successfully signed out, it might take a second to propagate",
                "success"
              );
          },
          () => {
              showNotification(
                "Failed to Sign Out",
                "I don't think this is possible... try refreshing.",
                "warning"
              );
          }
        );
    };

    const navItems = [
        { name: 'Research', options: [{ title: 'Research Paper', description: 'A link to the research paper', link: '/help' }] },
        { name: 'About', options: [] },
        { name: 'Demo', link: '/playground' },
    ];

    return (
      <header className="fixed top-0 z-50 w-full bg-transparent text-white">
          <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                  <Logo />
              </div>
              <div className="hidden flex-1 items-center justify-center space-x-2">
                  <nav className="flex items-center space-x-6 text-sm font-medium">
                      {navItems.map((item, index) =>
                        item.options ? (
                          <NavMenu key={index} name={item.name} options={item.options} />
                        ) : (
                          <NavLink key={index} to={item.link}>{item.name}</NavLink>
                        )
                      )}
                  </nav>
              </div>
              <div className="flex-1" />
              <div className="flex items-center justify-end space-x-4">
                  <nav className="hidden md:flex items-center space-x-1">
                      <Popover>
                          <PopoverTrigger asChild>
                              <Button variant="outline" size="icon" className="ml-auto h-8 w-8 bg-transparent border-white text-white">
                                  <Bell className="h-4 w-4" />
                                  <span className="sr-only">Toggle notifications</span>
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 bg-black/30 backdrop-blur border border-white text-white">
                              <CardTitle className="mb-2">Notifications</CardTitle>
                              <ScrollArea className="h-[300px]">
                                  {allNotifications.length > 0 ? (
                                    allNotifications.reverse().map((notification, index) => (
                                      <div key={index} className="mb-2 p-2 bg-white/10 rounded-md">
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
                      {authState.isAuthenticated && (
                        <Button variant="outline" size="icon" className="ml-auto h-8 w-8 bg-transparent border-white text-white" asChild>
                            <Link to="/settings">
                                <Settings className="h-4 w-4" />
                            </Link>
                        </Button>
                      )}
                      {authState.isAuthenticated ? (
                        <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                      ) : (
                        <Button variant="ghost" asChild className="text-white hover:bg-white/10">
                            <Link to="/authenticate">Sign Up</Link>
                        </Button>
                      )}
                  </nav>
                  <Sheet>
                      <SheetTrigger asChild>
                          <Button variant="outline" size="icon" className="md:hidden h-8 w-8 bg-transparent border-white text-white">
                              <Menu className="h-4 w-4" />
                          </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="bg-black/80 text-white border-r border-white">
                          <div className="flex flex-col items-center h-full py-4">
                              <Logo />
                              <div className="flex-1" />
                              {authState.isAuthenticated && (
                                <Button variant="outline" size="icon" className="ml-auto h-8 w-8 bg-transparent border-white text-white" asChild>
                                    <Link to="/settings">
                                        <Settings className="h-4 w-4" />
                                    </Link>
                                </Button>
                              )}
                              {authState.isAuthenticated ? (
                                <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                              ) : (
                                <Button variant="ghost" asChild className="text-white hover:bg-white/10">
                                    <Link to="/authenticate">Sign Up</Link>
                                </Button>
                              )}
                          </div>
                      </SheetContent>
                  </Sheet>
              </div>
          </div>
      </header>
    );
};

export default TransparentNavigationBar;