
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mic, Twitter, Youtube, Instagram, Facebook } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';


export function Footer() {
  const { theme } = useTheme();
  const [logoSrc, setLogoSrc] = useState('/light-poddb-logo.png'); // Default logo

  useEffect(() => {
      // Set the logo based on the theme, only on client-side
      setLogoSrc(theme === 'dark' ? '/dark-poddb-logo.png' : '/light-poddb-logo.png');
  }, [theme]);

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group">
              <Image src={logoSrc} alt="PodDB Pro Logo" width={150} height={50} className="object-contain" sizes="100vw" />
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              PodDB is the world's most comprehensive and authoritative source for podcast information. We are building the IMDb for the podcasting industry, powered by a dedicated community of contributors.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/explore" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline">Explore</Link></li>
              <li><Link href="/rankings" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline">Rankings</Link></li>
              <li><Link href="/people" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline">People</Link></li>
              <li><Link href="/awards" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline">Awards</Link></li>
              <li><Link href="/news" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline">News</Link></li>
              <li><Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline">Help Center</Link></li>
            </ul>
          </div>

          {/* Legal & About */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Company</h4>
             <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline">About Us</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline">Privacy Policy</Link></li>
              <li><Link href="/help/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PodDB Pro. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            {/* Social Media Icons */}
            <div className="flex items-center space-x-4">
              <a href="#" className="link-consistent-sm" title="Follow us on Twitter">
                <Twitter className="h-4 w-4" />
                <span className="link-consistent-text">Twitter</span>
              </a>
              <a href="#" className="link-consistent-sm" title="Follow us on YouTube">
                <Youtube className="h-4 w-4" />
                <span className="link-consistent-text">YouTube</span>
              </a>
              <a href="#" className="link-consistent-sm" title="Follow us on Instagram">
                <Instagram className="h-4 w-4" />
                <span className="link-consistent-text">Instagram</span>
              </a>
              <a href="#" className="link-consistent-sm" title="Follow us on Facebook">
                <Facebook className="h-4 w-4" />
                <span className="link-consistent-text">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
