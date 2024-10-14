import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import { Bell, Menu, Settings, ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
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
import {Logo} from "../logo/logo";
import {Popover, PopoverContent, PopoverTrigger} from "../ui/popover";
import {CardTitle} from "../ui/card";
import {ScrollArea} from "../ui/scroll-area";
import { useDarkMode } from '../../contexts/DarkModeProvider';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => (
  <Link to={href} className="text-sm font-medium transition-colors hover:text-primary">
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
const NavMenu: React.FC<NavMenuProps> = ({ name, options })  => (
  <DropdownMenu>
      <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-1">
              {name} <ChevronDown className="h-4 w-4" />
          </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
          {options.map((option, index) => (
            <DropdownMenuItem key={index}>
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

export const NavigationBar = () => {
    const { authState, logout } = useAuth();
    const {showNotification, allNotifications} = useNotification();
    const { darkModeState, toggleDarkMode} = useDarkMode();

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

    interface NavItemProps {
        name: string;
        options?: OptionProps[];
        link?: string;
    }
    const navItems:NavItemProps[] = [
        { name: 'Research', options: [{ title: 'Research Paper', description: 'A link to the research paper', link: '/help' }] },
        { name: 'About', options: [] },
        { name: 'Demo', link: '/playground' },
    ];

    return (
      <header className="sticky top-0 z-50 w-full border-b dark:bg-background-dark/95 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:text-white">
          <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                  <Logo />
              </div>
              <div className="hidden flex-1 items-center justify-center space-x-2">
                  <nav className="flex items-center space-x-6 text-sm font-medium">
                      {navItems.map((item, index) =>
                        <>
                            {item.options && <NavMenu key={index} name={item.name} options={item.options}/>}
                            {item.link && <NavLink key={index} href={item.link}>{item.name}</NavLink> }
                        </>)
                      }
                  </nav>
              </div>
              <div className="flex-1" />
              <div className="flex items-center justify-end space-x-4">
                  <nav className="hidden md:flex items-center space-x-1">
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
                                    allNotifications.reverse().map((notification, index) => (
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
                      <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleDarkMode}
                          className="ml-auto h-8 w-8"
                      >
                          {darkModeState.darkMode ? (
                              <Sun className="h-4 w-4" />
                          ) : (
                              <Moon className="h-4 w-4" />
                          )}
                          <span className="sr-only">Toggle dark mode</span>
                      </Button>
                      {authState.isAuthenticated && (
                        <Button variant="outline" size="icon" className="ml-auto h-8 w-8" asChild>
                            <Link to="/settings">
                                <Settings className="h-4 w-4" />
                            </Link>
                        </Button>
                      )}
                      {authState.isAuthenticated ? (
                        <Button variant="ghost" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                      ) : (
                        <Button variant="ghost" asChild>
                            <Link to="/authenticate">Sign Up</Link>
                        </Button>
                      )}
                  </nav>
                  <Sheet>
                      <SheetTrigger asChild>
                          <Button variant="outline" size="icon" className="md:hidden h-8 w-8">
                              <Menu className="h-4 w-4" />
                          </Button>
                      </SheetTrigger>
                      <SheetContent side="left">
                          <div className="py-4 h-full dark:text-white flex flex-col justify-between">
                              <Logo />
                              <div className="flex-1" />
                              {authState.isAuthenticated ? (
                                <Button variant="ghost" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                              ) : (
                                <Button variant="ghost" asChild>
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

export default NavigationBar;