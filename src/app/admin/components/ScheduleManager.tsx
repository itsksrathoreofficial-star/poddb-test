"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Edit, Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { 
  getScheduledReviews,
  updateScheduledReview,
  cancelScheduledReview,
  postScheduledReview,
  generateRandomSchedule,
  type ScheduledReview
} from "@/app/actions/fake-reviews";

interface ScheduleManagerProps {
  onRefresh?: () => void;
}

export default function ScheduleManager({ onRefresh }: ScheduleManagerProps) {
  const [scheduledReviews, setScheduledReviews] = useState<ScheduledReview[]>([]);
  const [editingReview, setEditingReview] = useState<ScheduledReview | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScheduledReviews();
  }, []);

  const fetchScheduledReviews = async () => {
    setLoading(true);
    const result = await getScheduledReviews();
    if (result.success) {
      setScheduledReviews(result.data || []);
    } else {
      toast.error("Failed to fetch scheduled reviews: " + result.error);
    }
    setLoading(false);
  };

  const handleEditSchedule = (review: ScheduledReview) => {
    setEditingReview(review);
    setShowEditDialog(true);
  };

  const handleUpdateSchedule = async (reviewId: string, updates: Partial<ScheduledReview>) => {
    const result = await updateScheduledReview(reviewId, updates);
    if (result.success) {
      toast.success("Schedule updated successfully");
      setShowEditDialog(false);
      setEditingReview(null);
      fetchScheduledReviews();
      onRefresh?.();
    } else {
      toast.error("Failed to update schedule: " + result.error);
    }
  };

  const handleCancelReview = async (reviewId: string) => {
    const result = await cancelScheduledReview(reviewId);
    if (result.success) {
      toast.success("Review cancelled successfully");
      fetchScheduledReviews();
      onRefresh?.();
    } else {
      toast.error("Failed to cancel review: " + result.error);
    }
  };

  const handlePostImmediate = async (reviewId: string) => {
    const result = await postScheduledReview(reviewId);
    if (result.success) {
      toast.success("Review posted successfully");
      fetchScheduledReviews();
      onRefresh?.();
    } else {
      toast.error("Failed to post review: " + result.error);
    }
  };

  const handleRegenerateRandomSchedule = async (reviewIds: string[], days: number) => {
    const result = await generateRandomSchedule(reviewIds, days);
    if (result.success) {
      toast.success("Random schedule regenerated successfully");
      fetchScheduledReviews();
      onRefresh?.();
    } else {
      toast.error("Failed to regenerate schedule: " + result.error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getUpcomingReviews = () => {
    const now = new Date();
    return scheduledReviews
      .filter(review => 
        review.status === 'pending' && 
        review.scheduled_date && 
        new Date(review.scheduled_date) > now
      )
      .sort((a, b) => 
        new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime()
      );
  };

  const getPendingImmediateReviews = () => {
    return scheduledReviews.filter(review => 
      review.status === 'pending' && review.schedule_type === 'immediate'
    );
  };

  const getRandomReviews = () => {
    return scheduledReviews.filter(review => 
      review.status === 'pending' && review.schedule_type === 'random'
    );
  };

  const upcomingReviews = getUpcomingReviews();
  const pendingImmediate = getPendingImmediateReviews();
  const randomReviews = getRandomReviews();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Schedule Management</h3>
        <Button onClick={fetchScheduledReviews} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Pending Immediate</p>
                <p className="text-2xl font-bold">{pendingImmediate.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Scheduled</p>
                <p className="text-2xl font-bold">{upcomingReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Random Reviews</p>
                <p className="text-2xl font-bold">{randomReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pause className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Total Pending</p>
                <p className="text-2xl font-bold">
                  {scheduledReviews.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Schedule */}
      {upcomingReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReviews.slice(0, 10).map((review) => (
                <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{review.fake_user?.display_name}</p>
                        <p className="text-sm text-muted-foreground">{review.target_name}</p>
                      </div>
                      <Badge variant="outline">{review.rating}⭐</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{review.review_title}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {formatDate(review.scheduled_date!)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditSchedule(review)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancelReview(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {upcomingReviews.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  And {upcomingReviews.length - 10} more scheduled reviews...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Immediate Reviews */}
      {pendingImmediate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Immediate Reviews</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingImmediate.map((review) => (
                <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{review.fake_user?.display_name}</p>
                        <p className="text-sm text-muted-foreground">{review.target_name}</p>
                      </div>
                      <Badge variant="outline">{review.rating}⭐</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{review.review_title}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handlePostImmediate(review.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Post Now
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancelReview(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Random Reviews Management */}
      {randomReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Random Reviews Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label>Regenerate Schedule for Random Reviews:</Label>
                <Select defaultValue="7" onValueChange={(value) => {
                  const days = parseInt(value);
                  const reviewIds = randomReviews.map(r => r.id);
                  handleRegenerateRandomSchedule(reviewIds, days);
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="2">2 Days</SelectItem>
                    <SelectItem value="4">4 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="10">10 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                {randomReviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{review.fake_user?.display_name}</p>
                        <p className="text-sm text-muted-foreground">{review.target_name}</p>
                      </div>
                      <Badge variant="outline">{review.rating}⭐</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {review.scheduled_date ? formatDate(review.scheduled_date) : 'Not scheduled'}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditSchedule(review)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Schedule Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
          </DialogHeader>
          {editingReview && (
            <EditScheduleForm
              review={editingReview}
              onSave={(updates) => handleUpdateSchedule(editingReview.id, updates)}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface EditScheduleFormProps {
  review: ScheduledReview;
  onSave: (updates: Partial<ScheduledReview>) => void;
  onCancel: () => void;
}

function EditScheduleForm({ review, onSave, onCancel }: EditScheduleFormProps) {
  const [scheduleType, setScheduleType] = useState(review.schedule_type);
  const [scheduledDate, setScheduledDate] = useState(
    review.scheduled_date ? new Date(review.scheduled_date).toISOString().slice(0, 16) : ''
  );
  const [randomDays, setRandomDays] = useState(review.random_days || 7);

  const handleSave = () => {
    const updates: Partial<ScheduledReview> = {
      schedule_type: scheduleType,
    };

    if (scheduleType === 'immediate') {
      updates.scheduled_date = new Date().toISOString();
    } else if (scheduleType === 'random') {
      updates.random_days = randomDays;
      // Generate a random date within the specified days
      const randomDaysValue = Math.floor(Math.random() * (randomDays + 1));
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() + randomDaysValue);
      randomDate.setHours(Math.floor(Math.random() * 24));
      randomDate.setMinutes(Math.floor(Math.random() * 60));
      updates.scheduled_date = randomDate.toISOString();
    } else if (scheduledDate) {
      updates.scheduled_date = new Date(scheduledDate).toISOString();
    }

    onSave(updates);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Schedule Type</Label>
        <Select value={scheduleType} onValueChange={(value: 'immediate' | 'random') => setScheduleType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Immediate</SelectItem>
            <SelectItem value="random">Random</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {scheduleType === 'random' && (
        <div>
          <Label>Random Days (0-{randomDays})</Label>
          <Select value={randomDays.toString()} onValueChange={(value) => setRandomDays(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Day</SelectItem>
              <SelectItem value="2">2 Days</SelectItem>
              <SelectItem value="4">4 Days</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="10">10 Days</SelectItem>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {scheduleType === 'immediate' && (
                 <div>
           <Label>Custom Date & Time</Label>
           <Input
             type="datetime-local"
             value={scheduledDate}
             onChange={(e) => setScheduledDate(e.target.value)}
             className="w-full"
           />
         </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
