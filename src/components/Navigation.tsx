
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, LogIn, Menu, Mic, TrendingUp, Newspaper, Compass, Settings, Podcast, Clapperboard, Loader2, Users, X, Bell, History, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getSafeImageUrl, handleImageError } from '@/lib/image-utils';

export function Navigation() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const router = useRouter();
  const popoverTriggerRef = useRef(null);

  const { theme, setTheme } = useTheme();
  const [logoSrc, setLogoSrc] = useState('/light-poddb-logo.png'); // Default logo
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
      // Set the logo based on the theme, only on client-side
      setLogoSrc(theme === 'dark' ? '/dark-poddb-logo.png' : '/light-poddb-logo.png');
  }, [theme]);


  const fetchProfile = async () => {
    if (!user) return;
    try {
      setIsLoadingProfile(true);
      
      // Use direct table query with timeout
      const { data: fallbackData, error: fallbackError } = await Promise.race([
        supabase
          .from('profiles')
          .select('user_id, display_name, bio, avatar_url, social_links, role, created_at, updated_at')
          .eq('user_id', user.id)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]) as any;
      
      if (fallbackError) {
        console.warn('Error fetching profile:', fallbackError);
        setProfile(null);
      } else {
        setProfile(fallbackData);
      }
    } catch (error: any) {
      console.warn('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    if (!user) return;
    try {
      // Use direct table query with timeout
      const { data: fallbackData, error: fallbackError } = await Promise.race([
        supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_read', false),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]) as any;
      
      if (fallbackError) {
        console.warn('Error fetching unread notifications:', fallbackError);
        setUnreadNotifications(0);
      } else {
        setUnreadNotifications(Array.isArray(fallbackData) ? fallbackData.length : 0);
      }
    } catch (error: any) {
      console.warn('Error fetching unread notifications:', error);
      setUnreadNotifications(0);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUnreadNotifications();
    } else {
      setProfile(null);
      setUnreadNotifications(0);
    }
  }, [user]); // Removed fetchUnreadNotifications from dependency array to prevent infinite loop
  
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions(null);
      setIsPopoverOpen(false);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const { data, error } = await supabase.rpc('global_search');
        if (error) throw error;
        setSuggestions(data);
        setIsPopoverOpen(true);
      } catch (error) {
        console.error('Error fetching search suggestions', error);
        setSuggestions(null);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchSuggestions();
    }, 300); // 300ms debounce

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchTerm.trim()){
          router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
          setIsPopoverOpen(false);
          setSearchTerm('');
      }
  }

  const handleSuggestionClick = () => {
    setIsPopoverOpen(false);
    setSearchTerm('');
  };


  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
             <Image src={logoSrc} alt="PodDB Pro Logo" width={120} height={40} className="object-contain" sizes="100vw" />
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild ref={popoverTriggerRef}>
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search podcasts, episodes, people..."
                    className="pl-10 bg-input border-border focus:border-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>
              </PopoverTrigger>
              {(loadingSuggestions || (suggestions && (suggestions.podcasts?.length > 0 || suggestions.episodes?.length > 0 || suggestions.people?.length > 0))) && (
                <PopoverContent className="w-[--radix-popover-trigger-width] mt-2 p-0" align="start">
                    {loadingSuggestions ? (
                        <div className="p-4 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div>
                    ) : (
                        <div className="space-y-2">
                             {suggestions.podcasts?.length > 0 && (
                                <div className="p-2">
                                    <h4 className="font-semibold text-sm px-2 mb-1 flex items-center"><Podcast className="mr-2 h-4 w-4"/>Podcasts</h4>
                                    {suggestions.podcasts.slice(0,3).map((p: any) => (
                                        <Link key={p.id} href={`/podcasts/${p.slug}`} onClick={handleSuggestionClick} className="block">
                                            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                                <Image 
                                                  src={getSafeImageUrl(p.cover_image_url, '/placeholder.svg')} 
                                                  alt={p.title} 
                                                  className="w-10 h-10 rounded-md object-cover" 
                                                  width={40} 
                                                  height={40} 
                                                  sizes="100vw"
                                                  onError={handleImageError}
                                                />
                                                <span className="text-sm">{p.title}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {suggestions.episodes?.length > 0 && (
                                <div className="p-2">
                                    <h4 className="font-semibold text-sm px-2 mb-1 flex items-center"><Clapperboard className="mr-2 h-4 w-4"/>Episodes</h4>
                                    {suggestions.episodes.slice(0,3).map((e: any) => (
                                        <Link key={e.id} href={`/episodes/${e.slug}`} onClick={handleSuggestionClick} className="block">
                                           <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                                <Image 
                                                  src={getSafeImageUrl(e.thumbnail_url, '/placeholder.svg')} 
                                                  alt={e.title} 
                                                  className="w-10 h-10 rounded-md object-cover" 
                                                  width={40} 
                                                  height={40} 
                                                  sizes="100vw"
                                                  onError={handleImageError}
                                                />
                                                <div className="text-sm">
                                                    <p>{e.title}</p>
                                                    <p className="text-xs text-muted-foreground">{e.podcast_title}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            {suggestions.people?.length > 0 && (
                                <div className="p-2">
                                    <h4 className="font-semibold text-sm px-2 mb-1 flex items-center"><Users className="mr-2 h-4 w-4"/>People</h4>
                                    {suggestions.people.slice(0,3).map((p: any) => (
                                         <Link key={p.id} href={`/people/${p.slug}`} onClick={handleSuggestionClick} className="block">
                                           <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                                <Image 
                                                  src={getSafeImageUrl(p.photo_urls?.[0], '/placeholder.svg')} 
                                                  alt={p.full_name} 
                                                  className="w-10 h-10 rounded-full object-cover" 
                                                  width={40} 
                                                  height={40} 
                                                  sizes="100vw"
                                                  onError={handleImageError}
                                                />
                                                <span className="text-sm">{p.full_name}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            <div className="p-2 border-t">
                                 <Button variant="ghost" className="w-full justify-start" onClick={handleSearchSubmit}>
                                    <Search className="mr-2 h-4 w-4"/> View all results for &quot;{searchTerm}&quot;
                                </Button>
                            </div>
                        </div>
                    )}
                </PopoverContent>
              )}
            </Popover>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/explore" className="link-consistent-sm">
              <Compass className="h-4 w-4" />
              <span className="link-consistent-text">Explore</span>
            </Link>
            <Link href="/rankings" className="link-consistent-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="link-consistent-text">Rankings</span>
            </Link>
            <Link href="/news" className="link-consistent-sm">
              <Newspaper className="h-4 w-4" />
              <span className="link-consistent-text">News</span>
            </Link>
            {user && (
              <Link href="/contribute" className="link-consistent-sm">
                <span className="link-consistent-text">Contribute</span>
              </Link>
            )}
          </div>

          {/* User Actions and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="hidden sm:flex items-center space-x-3">
                {profile && profile.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative p-0 h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={getSafeImageUrl(profile?.avatar_url, '/placeholder.svg')} 
                          alt={profile?.display_name || 'User'}
                          onError={(e) => handleImageError(e)}
                        />
                        <AvatarFallback className="text-sm">
                          {profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {unreadNotifications > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={getSafeImageUrl(profile?.avatar_url, '/placeholder.svg')} 
                          alt={profile?.display_name || 'User'}
                          onError={(e) => handleImageError(e)}
                        />
                        <AvatarFallback className="text-sm">
                          {profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.display_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" className="flex items-center">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                        {unreadNotifications > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/contribution-history" className="flex items-center">
                        <History className="mr-2 h-4 w-4" />
                        Contribution History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {/* Theme Toggle */}
                    {mounted && (
                      <DropdownMenuItem asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-2 py-1.5 h-auto font-normal"
                          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                          {theme === 'dark' ? (
                            <>
                              <Sun className="mr-2 h-4 w-4" />
                              Light Mode
                            </>
                          ) : (
                            <>
                              <Moon className="mr-2 h-4 w-4" />
                              Dark Mode
                            </>
                          )}
                        </Button>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="ghost" size="sm">
                    <LogIn className="h-4 w-4 mr-1" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth?type=signup">
                  <Button variant="default" size="sm" className="bg-primary hover:bg-primary-hover">
                    Join PodDB
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                       <Link href="/" onClick={() => setIsSheetOpen(false)}>
                          <Image src={logoSrc} alt="PodDB Pro Logo" width={100} height={33} sizes="100vw" />
                       </Link>
                       <SheetClose asChild>
                           <Button variant="ghost" size="icon"><X/></Button>
                       </SheetClose>
                    </div>
                    <div className="flex flex-col p-4 space-y-3">
                      <SheetClose asChild><Link href="/explore" className="link-consistent-lg">Explore</Link></SheetClose>
                      <SheetClose asChild><Link href="/rankings" className="link-consistent-lg">Rankings</Link></SheetClose>
                      <SheetClose asChild><Link href="/news" className="link-consistent-lg">News</Link></SheetClose>
                      <SheetClose asChild><Link href="/contribute" className="link-consistent-lg">Contribute</Link></SheetClose>
                    </div>
                    <Separator/>
                     <div className="p-4 mt-auto">
                        {user ? (
                           <div className="space-y-4">
                               <div className="flex items-center gap-3 p-3 border rounded-lg">
                                 <Avatar className="h-10 w-10">
                                   <AvatarImage 
                                     src={getSafeImageUrl(profile?.avatar_url, '/placeholder.svg')} 
                                     alt={profile?.display_name || 'User'}
                                     onError={(e) => handleImageError(e)}
                                   />
                                   <AvatarFallback>
                                     {profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                                   </AvatarFallback>
                                 </Avatar>
                                 <div className="flex-1">
                                   <p className="font-medium">{profile?.display_name || 'User'}</p>
                                   <p className="text-sm text-muted-foreground">{user?.email}</p>
                                 </div>
                                 {unreadNotifications > 0 && (
                                   <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                                     {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                   </Badge>
                                 )}
                               </div>
                               <SheetClose asChild>
                                  <Link href="/profile">
                                    <Button variant="outline" className="w-full justify-start">
                                      <User className="mr-2 h-4 w-4" />
                                      Profile
                                    </Button>
                                  </Link>
                               </SheetClose>
                               <SheetClose asChild>
                                  <Link href="/notifications">
                                    <Button variant="outline" className="w-full justify-start">
                                      <Bell className="mr-2 h-4 w-4" />
                                      Notifications
                                      {unreadNotifications > 0 && (
                                        <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                        </Badge>
                                      )}
                                    </Button>
                                  </Link>
                               </SheetClose>
                               <SheetClose asChild>
                                  <Link href="/contribution-history">
                                    <Button variant="outline" className="w-full justify-start">
                                      <History className="mr-2 h-4 w-4" />
                                      Contribution History
                                    </Button>
                                  </Link>
                               </SheetClose>
                               {profile && profile.role === 'admin' && (
                                <SheetClose asChild>
                                    <Link href="/admin">
                                        <Button variant="outline" className="w-full justify-start">
                                          <Settings className="mr-2 h-4 w-4" />
                                          Admin Dashboard
                                        </Button>
                                    </Link>
                                </SheetClose>
                               )}
                               {/* Theme Toggle for Mobile */}
                               {mounted && (
                                 <Button
                                   variant="outline"
                                   className="w-full justify-start"
                                   onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                 >
                                   {theme === 'dark' ? (
                                     <>
                                       <Sun className="mr-2 h-4 w-4" />
                                       Light Mode
                                     </>
                                   ) : (
                                     <>
                                       <Moon className="mr-2 h-4 w-4" />
                                       Dark Mode
                                     </>
                                   )}
                                 </Button>
                               )}
                               <Button variant="default" className="w-full justify-start" onClick={() => { signOut(); setIsSheetOpen(false); }}>
                                 <LogOut className="mr-2 h-4 w-4" />
                                 Sign Out
                               </Button>
                           </div>
                        ) : (
                           <div className="space-y-4">
                               <SheetClose asChild>
                                  <Link href="/auth">
                                    <Button variant="outline" className="w-full">Sign In</Button>
                                  </Link>
                               </SheetClose>
                               <SheetClose asChild>
                                  <Link href="/auth?type=signup">
                                    <Button variant="default" className="w-full">Join PodDB</Button>
                                  </Link>
                               </SheetClose>
                           </div>
                        )}
                     </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
