"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Megaphone as Ad, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw,
  BarChart3,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdConfig {
  id: string;
  name: string;
  type: 'google_adsense' | 'custom';
  status: 'active' | 'inactive';
  placement: 'content' | 'footer' | 'between_content';
  ad_position: number;
  pages: string[];
  devices: ('desktop' | 'mobile' | 'tablet')[];
  google_adsense_code?: string;
  custom_html?: string;
  custom_css?: string;
  click_url?: string;
  image_url?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  priority: number;
  created_at: string;
  updated_at: string;
}

const AdManager = () => {
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAd, setEditingAd] = useState<AdConfig | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form data
  const [formData, setFormData] = useState<Partial<AdConfig>>({
    name: '',
    type: 'custom',
    status: 'active',
    placement: 'content',
    ad_position: 1,
    pages: [],
    devices: ['desktop', 'mobile'],
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
    { value: 'all', label: 'All Pages' }
  ];

  const placementOptions = [
    { value: 'content', label: 'Content Area' },
    { value: 'footer', label: 'Footer' },
    { value: 'between_content', label: 'Between Content' }
  ];

  useEffect(() => {
    fetchAds();
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

  const handleSaveAd = async () => {
    try {
      setSaving(true);
      
      if (editingAd) {
        // Update existing ad
        const { error } = await (supabase as any)
          .from('ad_configs')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAd.id);

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
    setEditingAd(ad);
    setFormData(ad);
    setShowForm(true);
  };

  const handleCreateAd = () => {
    setEditingAd(null);
    resetForm();
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'custom',
      status: 'active',
      placement: 'content',
      ad_position: 1,
      pages: [],
      devices: ['desktop', 'mobile'],
      priority: 1,
      width: 728,
      height: 90
    });
    setEditingAd(null);
    setShowForm(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><RefreshCw className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ad Manager</h2>
          <p className="text-gray-600">Manage your website advertisements</p>
        </div>
        <Button onClick={handleCreateAd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Ad
        </Button>
      </div>

      {/* Ads List */}
      <div className="grid gap-4">
        {ads.map((ad) => (
          <Card key={ad.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ad.name}</CardTitle>
                  <CardDescription>
                    {ad.type === 'google_adsense' ? 'Google AdSense' : 'Custom Ad'} • {ad.placement} • Position {ad.ad_position}
                  </CardDescription>
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
                    onClick={() => handleDeleteAd(ad.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ad.pages.map(page => (
                  <Badge key={page} variant="outline" className="text-xs">
                    {pageOptions.find(opt => opt.value === page)?.label || page}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ad Form Modal */}
      {showForm && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl overflow-auto">
          <CardHeader>
            <CardTitle>{editingAd ? 'Edit Ad' : 'Create New Ad'}</CardTitle>
            <CardDescription>
              {editingAd ? 'Update ad configuration' : 'Configure your new ad settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Ad Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter ad name..."
                />
              </div>
              <div>
                <Label htmlFor="type">Ad Type</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
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

            <div>
              <Label>Target Pages</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto">
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

            {formData.type === 'google_adsense' && (
              <div>
                <Label htmlFor="adsense-code">AdSense Code</Label>
                <Textarea
                  id="adsense-code"
                  value={formData.google_adsense_code || ''}
                  onChange={(e) => setFormData({ ...formData, google_adsense_code: e.target.value })}
                  placeholder="Paste your Google AdSense code here..."
                  rows={6}
                />
              </div>
            )}

            {formData.type === 'custom' && (
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
                  <Label htmlFor="custom-html">Custom HTML</Label>
                  <Textarea
                    id="custom-html"
                    value={formData.custom_html || ''}
                    onChange={(e) => setFormData({ ...formData, custom_html: e.target.value })}
                    placeholder="Enter custom HTML for your ad..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSaveAd} disabled={saving}>
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingAd ? 'Update Ad' : 'Create Ad'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdManager;
