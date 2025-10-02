"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Megaphone as Ad, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Save, 
  RefreshCw,
  DollarSign,
  Target,
  Layout,
  BarChart3,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdConfig {
  id: string;
  name: string;
  type: 'google_adsense' | 'custom';
  status: 'active' | 'inactive' | 'paused';
  placement: 'header' | 'sidebar' | 'content' | 'footer' | 'between_content';
  ad_position: number;
  pages: string[];
  devices: ('desktop' | 'mobile' | 'tablet')[];
  google_adsense_code?: string;
  custom_html?: string;
  custom_css?: string;
  custom_js?: string;
  click_url?: string;
  image_url?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  max_ads_per_page: number;
  priority: number;
  created_at: string;
  updated_at: string;
}

interface AdStats {
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
}

const AdManagerTab = () => {
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedAd, setSelectedAd] = useState<AdConfig | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [adStats, setAdStats] = useState<{ [key: string]: AdStats }>({});
  const [isCreatingCustomAd, setIsCreatingCustomAd] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<AdConfig>>({
    name: '',
    type: 'google_adsense',
    status: 'active',
    placement: 'header',
    ad_position: 1,
    pages: [],
    devices: ['desktop', 'mobile'],
    max_ads_per_page: 3,
    priority: 1,
    width: 728,
    height: 90
  });

  const pageOptions = [
    { value: 'home', label: 'Home Page' },
    { value: 'podcasts', label: 'Podcasts Page' },
    { value: 'episodes', label: 'Episodes Page' },
    { value: 'categories', label: 'Categories Page' },
    { value: 'search', label: 'Search Page' },
    { value: 'about', label: 'About Page' },
    { value: 'people', label: 'People Page' },
    { value: 'locations', label: 'Locations Page' },
    { value: 'languages', label: 'Languages Page' },
    { value: 'rankings', label: 'Rankings Page' },
    { value: 'awards', label: 'Awards Page' },
    { value: 'news', label: 'News Page' },
    { value: 'explore', label: 'Explore Page' },
    { value: 'contribute', label: 'Contribute Page' },
    { value: 'contribution-history', label: 'Contribution History Page' },
    { value: 'notifications', label: 'Notifications Page' },
    { value: 'profile', label: 'Profile Page' },
    { value: 'preview', label: 'Preview Page' },
    { value: 'admin-preview', label: 'Admin Preview Page' },
    { value: 'privacy', label: 'Privacy Page' },
    { value: 'terms', label: 'Terms Page' },
    { value: 'help', label: 'Help Page' },
    { value: 'maintenance', label: 'Maintenance Page' },
    { value: 'all', label: 'All Pages' }
  ];

  const placementOptions = [
    { value: 'header', label: 'Header', icon: Layout },
    { value: 'sidebar', label: 'Sidebar', icon: Layout },
    { value: 'content', label: 'Content Area', icon: Layout },
    { value: 'footer', label: 'Footer', icon: Layout },
    { value: 'between_content', label: 'Between Content', icon: Layout }
  ];

  useEffect(() => {
    fetchAds();
    fetchAdStats();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('ad_configs')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      setAds(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch ads: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdStats = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_stats')
        .select('*');

      if (error) throw error;
      
      const statsMap: { [key: string]: AdStats } = {};
      data?.forEach((stat: any) => {
        statsMap[stat.ad_id] = {
          impressions: stat.impressions || 0,
          clicks: stat.clicks || 0,
          ctr: stat.ctr || 0,
          revenue: stat.revenue || 0
        };
      });
      setAdStats(statsMap);
    } catch (error: any) {
      console.error('Failed to fetch ad stats:', error);
    }
  };

  const handleSaveAd = async () => {
    try {
      setSaving(true);
      
      if (selectedAd) {
        // Update existing ad
        const { error } = await (supabase as any)
          .from('ad_configs')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedAd.id);

        if (error) throw error;
        toast.success('Ad updated successfully');
      } else {
        // Create new ad
        const { error } = await (supabase as any)
          .from('ad_configs')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
        toast.success('Ad created successfully');
      }

      await fetchAds();
      setSelectedAd(null);
      setIsCreatingCustomAd(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to save ad: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const { error } = await (supabase as any)
        .from('ad_configs')
        .delete()
        .eq('id', adId);

      if (error) throw error;
      toast.success('Ad deleted successfully');
      await fetchAds();
    } catch (error: any) {
      toast.error(`Failed to delete ad: ${error.message}`);
    }
  };

  const handleEditAd = (ad: AdConfig) => {
    setSelectedAd(ad);
    setFormData(ad);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'google_adsense',
      status: 'active',
      placement: 'header',
      ad_position: 1,
      pages: [],
      devices: ['desktop', 'mobile'],
      max_ads_per_page: 3,
      priority: 1,
      width: 728,
      height: 90
    });
    setSelectedAd(null);
  };

  const resetCustomForm = () => {
    setFormData({
      name: '',
      type: 'custom',
      status: 'active',
      placement: 'header',
      ad_position: 1,
      pages: [],
      devices: ['desktop', 'mobile'],
      max_ads_per_page: 3,
      priority: 1,
      width: 728,
      height: 90,
      custom_html: '',
      custom_css: '',
      click_url: '',
      image_url: '',
      alt_text: ''
    });
    setSelectedAd(null);
    setIsCreatingCustomAd(true);
  };

  const toggleAdStatus = async (adId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await (supabase as any)
        .from('ad_configs')
        .update({ status: newStatus })
        .eq('id', adId);

      if (error) throw error;
      toast.success(`Ad ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      await fetchAds();
    } catch (error: any) {
      toast.error(`Failed to update ad status: ${error.message}`);
    }
  };

  const copyAdCode = (ad: AdConfig) => {
    const code = ad.type === 'google_adsense' 
      ? ad.google_adsense_code 
      : `<div class="custom-ad" data-ad-id="${ad.id}">${ad.custom_html}</div>`;
    
    navigator.clipboard.writeText(code || '');
    toast.success('Ad code copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlacementIcon = (placement: string) => {
    const option = placementOptions.find(opt => opt.value === placement);
    return option?.icon || Layout;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><RefreshCw className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ad Manager</h2>
          <p className="text-gray-600">Manage Google AdSense and custom ads across your website</p>
        </div>
        <Button onClick={resetForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Ad
        </Button>
      </div>

      <Tabs defaultValue="ads" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ads">All Ads</TabsTrigger>
          <TabsTrigger value="google">Google AdSense</TabsTrigger>
          <TabsTrigger value="custom">Custom Ads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-4">
          <div className="grid gap-4">
            {ads.map((ad) => {
              const stats = adStats[ad.id] || { impressions: 0, clicks: 0, ctr: 0, revenue: 0 };
              const PlacementIcon = getPlacementIcon(ad.placement);
              
              return (
                <Card key={ad.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <PlacementIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <CardTitle className="text-lg">{ad.name}</CardTitle>
                          <CardDescription>
                            {ad.type === 'google_adsense' ? 'Google AdSense' : 'Custom Ad'} • {ad.placement} • Position {ad.ad_position}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(ad.status)}>
                          {ad.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAdStatus(ad.id, ad.status)}
                        >
                          {ad.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAd(ad)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAdCode(ad)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Impressions</div>
                        <div className="font-semibold">{stats.impressions.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Clicks</div>
                        <div className="font-semibold">{stats.clicks.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">CTR</div>
                        <div className="font-semibold">{stats.ctr.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Revenue</div>
                        <div className="font-semibold">${stats.revenue.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ad.pages.map(page => (
                        <Badge key={page} variant="outline" className="text-xs">
                          {pageOptions.find(opt => opt.value === page)?.label || page}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="google" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google AdSense Integration</CardTitle>
              <CardDescription>
                Configure your Google AdSense ads for automatic placement across your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adsense-code">AdSense Code</Label>
                  <Textarea
                    id="adsense-code"
                    placeholder="Paste your Google AdSense code here..."
                    value={formData.google_adsense_code || ''}
                    onChange={(e) => setFormData({ ...formData, google_adsense_code: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ad-name">Ad Name</Label>
                    <Input
                      id="ad-name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter ad name..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="placement">Placement</Label>
                    <Select
                      value={formData.placement}
                      onValueChange={(value) => setFormData({ ...formData, placement: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {placementOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="ad_position">Position</Label>
                      <Input
                        id="ad_position"
                        type="number"
                        value={formData.ad_position || 1}
                        onChange={(e) => setFormData({ ...formData, ad_position: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Input
                        id="priority"
                        type="number"
                        value={formData.priority || 1}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Custom Ad Management</h3>
              <p className="text-gray-600">Create and manage your own custom ads with full control over design and placement</p>
            </div>
            <Button onClick={resetCustomForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Custom Ad
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Custom Ad Configuration</CardTitle>
              <CardDescription>
                Configure your custom ad settings, placement, and targeting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="custom-name">Ad Name</Label>
                    <Input
                      id="custom-name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter ad name..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-placement">Ad Placement</Label>
                    <Select
                      value={formData.placement}
                      onValueChange={(value) => setFormData({ ...formData, placement: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select placement" />
                      </SelectTrigger>
                      <SelectContent>
                        {placementOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="custom-position">Position</Label>
                      <Input
                        id="custom-position"
                        type="number"
                        value={formData.ad_position || 1}
                        onChange={(e) => setFormData({ ...formData, ad_position: parseInt(e.target.value) })}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-priority">Priority</Label>
                      <Input
                        id="custom-priority"
                        type="number"
                        value={formData.priority || 1}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        placeholder="1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="custom-pages">Target Pages</Label>
                    <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                      {pageOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`custom-${option.value}`}
                            checked={formData.pages?.includes(option.value) || false}
                            onChange={(e) => {
                              const pages = formData.pages || [];
                              if (e.target.checked) {
                                setFormData({ ...formData, pages: [...pages, option.value] });
                              } else {
                                setFormData({ ...formData, pages: pages.filter(p => p !== option.value) });
                              }
                            }}
                          />
                          <Label htmlFor={`custom-${option.value}`} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="click-url">Click URL</Label>
                    <Input
                      id="click-url"
                      value={formData.click_url || ''}
                      onChange={(e) => setFormData({ ...formData, click_url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alt-text">Alt Text</Label>
                    <Input
                      id="alt-text"
                      value={formData.alt_text || ''}
                      onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                      placeholder="Description of the image"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="custom-width">Width (px)</Label>
                      <Input
                        id="custom-width"
                        type="number"
                        value={formData.width || 728}
                        onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                        placeholder="728"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-height">Height (px)</Label>
                      <Input
                        id="custom-height"
                        type="number"
                        value={formData.height || 90}
                        onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                        placeholder="90"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-html">Custom HTML</Label>
                  <Textarea
                    id="custom-html"
                    value={formData.custom_html || ''}
                    onChange={(e) => setFormData({ ...formData, custom_html: e.target.value })}
                    placeholder="Enter custom HTML for your ad..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-css">Custom CSS</Label>
                  <Textarea
                    id="custom-css"
                    value={formData.custom_css || ''}
                    onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
                    placeholder="Enter custom CSS styles..."
                    rows={3}
                  />
                </div>
              </div>
              
              {/* Save Button for Custom Ad */}
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={handleSaveAd} 
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save Custom Ad'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${Object.values(adStats).reduce((sum, stat) => sum + stat.revenue, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Total Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Object.values(adStats).reduce((sum, stat) => sum + stat.clicks, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Total Impressions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Object.values(adStats).reduce((sum, stat) => sum + stat.impressions, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ad Placement Settings</CardTitle>
              <CardDescription>
                Configure global settings for ad placement and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pages">Pages to Show Ads</Label>
                  <div className="space-y-2 mt-2">
                    {pageOptions.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={option.value}
                          checked={formData.pages?.includes(option.value) || false}
                          onChange={(e) => {
                            const pages = formData.pages || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, pages: [...pages, option.value] });
                            } else {
                              setFormData({ ...formData, pages: pages.filter(p => p !== option.value) });
                            }
                          }}
                        />
                        <Label htmlFor={option.value} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="devices">Target Devices</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { value: 'desktop', label: 'Desktop', icon: Monitor },
                      { value: 'mobile', label: 'Mobile', icon: Smartphone },
                      { value: 'tablet', label: 'Tablet', icon: Smartphone }
                    ].map(device => (
                      <div key={device.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={device.value}
                          checked={formData.devices?.includes(device.value as any) || false}
                          onChange={(e) => {
                            const devices = formData.devices || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, devices: [...devices, device.value as any] });
                            } else {
                              setFormData({ ...formData, devices: devices.filter(d => d !== device.value) });
                            }
                          }}
                        />
                        <Label htmlFor={device.value} className="text-sm flex items-center gap-2">
                          <device.icon className="h-4 w-4" />
                          {device.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-ads">Max Ads Per Page</Label>
                  <Input
                    id="max-ads"
                    type="number"
                    value={formData.max_ads_per_page || 3}
                    onChange={(e) => setFormData({ ...formData, max_ads_per_page: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="ad-width">Ad Width (px)</Label>
                  <Input
                    id="ad-width"
                    type="number"
                    value={formData.width || 728}
                    onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={handleSaveAd} 
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ad Form Modal - Only for Google AdSense and editing, not for custom ad creation */}
      {selectedAd && selectedAd.type === 'google_adsense' && !isCreatingCustomAd && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl overflow-auto">
          <CardHeader>
            <CardTitle>Edit Ad</CardTitle>
            <CardDescription>Update ad configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="form-name">Ad Name</Label>
                <Input
                  id="form-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter ad name..."
                />
              </div>
              <div>
                <Label htmlFor="form-type">Ad Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google_adsense">Google AdSense</SelectItem>
                    <SelectItem value="custom">Custom Ad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'google_adsense' && (
              <div>
                <Label htmlFor="form-adsense">AdSense Code</Label>
                <Textarea
                  id="form-adsense"
                  value={formData.google_adsense_code || ''}
                  onChange={(e) => setFormData({ ...formData, google_adsense_code: e.target.value })}
                  placeholder="Paste your Google AdSense code here..."
                  rows={6}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSaveAd} disabled={saving}>
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Update Ad
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdManagerTab;
