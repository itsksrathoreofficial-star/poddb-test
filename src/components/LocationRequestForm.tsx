import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { MapPin, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LocationRequestFormProps {
  onClose: () => void;
  initialLocation?: string;
}

export function LocationRequestForm({ onClose, initialLocation = '' }: LocationRequestFormProps) {
  const [locationName, setLocationName] = useState(initialLocation);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [proofs, setProofs] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setProofs(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
    }
  };

  const removeFile = (index: number) => {
    setProofs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationName.trim()) {
      toast.error('Location name is required');
      return;
    }

    if (!country.trim()) {
      toast.error('Country is required');
      return;
    }

    setSubmitting(true);
    
    try {
      // Upload proof files if any
      let proofFileUrls: string[] = [];
      if (proofs.length > 0) {
        // For now, we'll just store the file names
        // In a real implementation, you'd upload to a file storage service
        proofFileUrls = proofs.map(file => file.name);
      }

      // Submit to database
      const { data, error } = await supabase
        .from('location_requests')
        .insert({
          location_name: locationName.trim(),
          country: country.trim(),
          state: state.trim() || null,
          description: description.trim() || null,
          proof_files: proofFileUrls,
          status: 'pending'
        } as any);

      if (error) {
        throw error;
      }
      
      toast.success('Location request submitted successfully!', {
        description: 'Our team will review your request and add the location if verified.'
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting location request:', error);
      toast.error('Failed to submit location request', {
        description: 'Please try again later.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span>Request New Location</span>
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Help us expand our location database by requesting a new location. Please provide accurate information and supporting documents.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name *</Label>
              <Input
                id="locationName"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., Mumbai, Tokyo, London"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., India, Japan, United Kingdom"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State/Province/Region</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g., Maharashtra, Tokyo Prefecture, England"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Additional Information</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details about this location..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Supporting Documents (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              Upload documents that verify this location exists (maps, official documents, etc.)
            </p>
            
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Click to upload files or drag and drop
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG, PDF up to 10MB each (max 5 files)
                </span>
              </label>
            </div>
            
            {proofs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded Files:</p>
                {proofs.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

