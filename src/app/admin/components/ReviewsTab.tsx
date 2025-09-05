"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SimpleAutocomplete } from "@/components/SimpleAutocomplete";
import { StarRating } from "@/components/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Calendar, Clock, User, MessageSquare, Settings, Trash2, Edit, Play } from "lucide-react";
import { toast } from "sonner";
import { 
  getFakeUsers, 
  createFakeUser, 
  updateFakeUser, 
  deleteFakeUser,
  getTargetSuggestions,
  createScheduledReviews,
  createAndPostReviewsImmediately,
  getScheduledReviews,
  updateScheduledReview,
  cancelScheduledReview,
  postScheduledReview,
  generateRandomSchedule,
  type FakeUser,
  type ScheduledReview,
  type CreateFakeUserData,
  type CreateScheduledReviewData,
  type TargetSuggestion
} from "@/app/actions/fake-reviews";
import ScheduleManager from "./ScheduleManager";

type Review = {
  id: string;
  rating: number;
  review_title: string;
  review_text: string;
  status: "pending" | "approved" | "rejected";
  user_display_name: string;
  target_name: string;
};

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [fakeUsers, setFakeUsers] = useState<FakeUser[]>([]);
  const [scheduledReviews, setScheduledReviews] = useState<ScheduledReview[]>([]);
  const [activeTab, setActiveTab] = useState("manage");
  
  // Fake user management states
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<FakeUser | null>(null);
  const [newUserData, setNewUserData] = useState<CreateFakeUserData>({
    display_name: "",
    avatar_url: "",
    email: ""
  });

  // Review creation states
  const [showCreateReviewDialog, setShowCreateReviewDialog] = useState(false);
  const [reviewCount, setReviewCount] = useState(1);
  const [selectedTargetType, setSelectedTargetType] = useState<'podcasts' | 'episodes' | 'people'>('podcasts');
  const [targetSearch, setTargetSearch] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<TargetSuggestion | null>(null);
  const [scheduleType, setScheduleType] = useState<'immediate' | 'random'>('immediate');
  const [randomDays, setRandomDays] = useState(7);
  const [reviewForms, setReviewForms] = useState<CreateScheduledReviewData[]>([]);

  useEffect(() => {
    fetchReviews();
    fetchFakeUsers();
    fetchScheduledReviews();
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase.rpc('get_all_reviews_with_details');
    if (error) {
      console.error("Error fetching reviews:", error);
    } else {
      setReviews(data as Review[]);
    }
  };

  const fetchFakeUsers = async () => {
    const result = await getFakeUsers();
    if (result.success) {
      setFakeUsers(result.data || []);
    } else {
      toast.error("Failed to fetch fake users: " + result.error);
    }
  };

  const fetchScheduledReviews = async () => {
    const result = await getScheduledReviews();
    if (result.success) {
      setScheduledReviews(result.data || []);
    } else {
      toast.error("Failed to fetch scheduled reviews: " + result.error);
    }
  };

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await (supabase as any)
      .from("reviews")
      .update({ status } as any)
      .eq("id", id);

    if (error) {
      console.error("Error updating review status:", error);
    } else {
      setReviews(
        reviews.map((review) =>
          review.id === id ? { ...review, status } : review
        )
      );
    }
  };

  const handleCreateFakeUser = async () => {
    if (!newUserData.display_name.trim()) {
      toast.error("Display name is required");
      return;
    }

    const result = await createFakeUser(newUserData);
    if (result.success) {
      toast.success("Fake user created successfully");
      setNewUserData({ display_name: "", avatar_url: "", email: "" });
      setShowCreateUserDialog(false);
      fetchFakeUsers();
    } else {
      toast.error("Failed to create fake user: " + result.error);
    }
  };

  const handleUpdateFakeUser = async () => {
    if (!editingUser || !newUserData.display_name.trim()) {
      toast.error("Display name is required");
      return;
    }

    const result = await updateFakeUser(editingUser.id, newUserData);
    if (result.success) {
      toast.success("Fake user updated successfully");
      setEditingUser(null);
      setNewUserData({ display_name: "", avatar_url: "", email: "" });
      fetchFakeUsers();
    } else {
      toast.error("Failed to update fake user: " + result.error);
    }
  };

  const handleDeleteFakeUser = async (id: string) => {
    const result = await deleteFakeUser(id);
    if (result.success) {
      toast.success("Fake user deleted successfully");
      fetchFakeUsers();
    } else {
      toast.error("Failed to delete fake user: " + result.error);
    }
  };

  const handleTargetSearch = async (query: string) => {
    setTargetSearch(query);
    if (query.trim().length > 0) {
      const result = await getTargetSuggestions(selectedTargetType, query);
      if (result.success) {
        // The Autocomplete component will handle the suggestions
      }
    }
  };

  const handleTargetSelect = (target: TargetSuggestion) => {
    setSelectedTarget(target);
    setTargetSearch(target.name);
  };

  const initializeReviewForms = () => {
    const forms: CreateScheduledReviewData[] = [];
    for (let i = 0; i < reviewCount; i++) {
      forms.push({
        fake_user_id: "",
        target_table: selectedTargetType,
        target_id: selectedTarget?.id || "",
        rating: 1, // Start with 1 star (out of 10)
        review_title: "",
        review_text: "",
        schedule_type: scheduleType,
        random_days: scheduleType === 'random' ? randomDays : undefined
      });
    }
    setReviewForms(forms);
  };

  // Auto-update review forms when reviewCount changes
  useEffect(() => {
    if (selectedTarget && reviewCount > 0) {
      initializeReviewForms();
    }
  }, [reviewCount, selectedTarget, selectedTargetType, scheduleType, randomDays]);

  const handleCreateReviews = async () => {
    if (!selectedTarget) {
      toast.error("Please select a target");
      return;
    }

    const validForms = reviewForms.filter(form => 
      form.fake_user_id && 
      form.review_title.trim() && 
      form.review_text.trim() &&
      form.rating >= 1 && form.rating <= 10
    );

    if (validForms.length === 0) {
      toast.error("Please fill in all required fields and ensure ratings are between 1-10");
      return;
    }

    let result;
    
    if (scheduleType === 'immediate') {
      // Use the immediate posting function
      result = await createAndPostReviewsImmediately(validForms);
      if (result.success) {
        toast.success(`${validForms.length} reviews posted immediately`);
      }
    } else {
      // Use the regular scheduling function
      result = await createScheduledReviews(validForms);
      if (result.success) {
        toast.success(`${validForms.length} reviews scheduled successfully`);
      }
    }

    if (result.success) {
      setShowCreateReviewDialog(false);
      setReviewForms([]);
      setSelectedTarget(null);
      setTargetSearch("");
      fetchScheduledReviews();
    } else {
      toast.error("Failed to create reviews: " + result.error);
    }
  };

  const handlePostImmediate = async (reviewId: string) => {
    const result = await postScheduledReview(reviewId);
    if (result.success) {
      toast.success("Review posted successfully");
      fetchScheduledReviews();
    } else {
      toast.error("Failed to post review: " + result.error);
    }
  };

  const handleCancelReview = async (reviewId: string) => {
    const result = await cancelScheduledReview(reviewId);
    if (result.success) {
      toast.success("Review cancelled successfully");
      fetchScheduledReviews();
    } else {
      toast.error("Failed to cancel review: " + result.error);
    }
  };

  const handleGenerateRandomSchedule = async (reviewIds: string[], days: number) => {
    const result = await generateRandomSchedule(reviewIds, days);
    if (result.success) {
      toast.success("Random schedule generated successfully");
      fetchScheduledReviews();
    } else {
      toast.error("Failed to generate random schedule: " + result.error);
    }
  };

  const getTargetSuggestionsForAutocomplete = async (query: string) => {
    const result = await getTargetSuggestions(selectedTargetType, query);
    return result.success ? result.data || [] : [];
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Reviews</h2>
        <Button onClick={() => setShowCreateReviewDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Fake Reviews
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manage">Manage Reviews</TabsTrigger>
          <TabsTrigger value="fake-users">Fake Users</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reviews</TabsTrigger>
          <TabsTrigger value="schedule-manager">Schedule Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>{review.user_display_name}</TableCell>
                      <TableCell>{review.target_name}</TableCell>
                      <TableCell>
                        <StarRating rating={review.rating} size={16} readOnly />
                      </TableCell>
                      <TableCell>{review.review_title}</TableCell>
                      <TableCell className="max-w-xs truncate">{review.review_text}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(review.status)}>
                          {review.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {review.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(review.id, "approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateStatus(review.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fake-users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fake Users</CardTitle>
                <Button onClick={() => setShowCreateUserDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fakeUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>{user.display_name}</TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(user);
                              setNewUserData({
                                display_name: user.display_name,
                                avatar_url: user.avatar_url || "",
                                email: user.email || ""
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteFakeUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={review.fake_user?.avatar_url || undefined} />
                            <AvatarFallback>
                              {review.fake_user?.display_name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{review.fake_user?.display_name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{review.target_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <StarRating rating={review.rating} size={16} readOnly />
                      </TableCell>
                      <TableCell>{review.review_title}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {review.schedule_type === 'immediate' ? (
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Immediate
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {review.scheduled_date ? formatDate(review.scheduled_date) : 'Not scheduled'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(review.status)}>
                          {review.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {review.status === 'pending' && review.schedule_type === 'immediate' && (
                            <Button
                              size="sm"
                              onClick={() => handlePostImmediate(review.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {review.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelReview(review.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule-manager" className="space-y-4">
          <ScheduleManager onRefresh={fetchScheduledReviews} />
        </TabsContent>
      </Tabs>

      {/* Create Fake User Dialog */}
      <Dialog open={showCreateUserDialog || !!editingUser} onOpenChange={(open) => {
        if (!open) {
          setShowCreateUserDialog(false);
          setEditingUser(null);
          setNewUserData({ display_name: "", avatar_url: "", email: "" });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit Fake User' : 'Create Fake User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={newUserData.display_name}
                onChange={(e) => setNewUserData({ ...newUserData, display_name: e.target.value })}
                placeholder="Enter display name"
              />
            </div>
            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={newUserData.avatar_url}
                onChange={(e) => setNewUserData({ ...newUserData, avatar_url: e.target.value })}
                placeholder="Enter avatar URL"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowCreateUserDialog(false);
                setEditingUser(null);
                setNewUserData({ display_name: "", avatar_url: "", email: "" });
              }}>
                Cancel
              </Button>
              <Button onClick={editingUser ? handleUpdateFakeUser : handleCreateFakeUser}>
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Reviews Dialog */}
      <Dialog open={showCreateReviewDialog} onOpenChange={setShowCreateReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Fake Reviews</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Target Selection */}
            <div className="space-y-4">
              <div>
                <Label>Target Type</Label>
                <Select value={selectedTargetType} onValueChange={(value: 'podcasts' | 'episodes' | 'people') => {
                  setSelectedTargetType(value);
                  setSelectedTarget(null);
                  setTargetSearch("");
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="podcasts">Podcasts</SelectItem>
                    <SelectItem value="episodes">Episodes</SelectItem>
                    <SelectItem value="people">People</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Search Target</Label>
                <SimpleAutocomplete
                  value={targetSearch}
                  onChange={(value) => {
                    setTargetSearch(value);
                    // Clear selected target when user types
                    if (value !== selectedTarget?.name) {
                      setSelectedTarget(null);
                    }
                  }}
                  fetchSuggestions={getTargetSuggestionsForAutocomplete}
                  placeholder={`Search ${selectedTargetType}...`}
                  onSelect={(suggestion) => {
                    handleTargetSelect(suggestion);
                  }}
                  renderSuggestion={(suggestion) => (
                    <div>
                      <div className="font-medium">{suggestion.name}</div>
                      {suggestion.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {suggestion.description}
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>

              {selectedTarget && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">Selected: {selectedTarget.name}</p>
                  {selectedTarget.description && (
                    <p className="text-sm text-muted-foreground">{selectedTarget.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Review Count */}
            <div>
              <Label>Number of Reviews</Label>
              <Select value={reviewCount.toString()} onValueChange={(value) => {
                setReviewCount(parseInt(value));
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Type */}
            <div className="space-y-4">
              <div>
                <Label>Schedule Type</Label>
                <Select value={scheduleType} onValueChange={(value: 'immediate' | 'random') => {
                  setScheduleType(value);
                }}>
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
                  <Select value={randomDays.toString()} onValueChange={(value) => {
                    setRandomDays(parseInt(value));
                  }}>
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
            </div>



            {/* Review Forms */}
            {reviewForms.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Review Details</h3>
                {reviewForms.map((form, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">Review {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Fake User</Label>
                        <Select 
                          value={form.fake_user_id} 
                          onValueChange={(value) => {
                            const newForms = [...reviewForms];
                            newForms[index].fake_user_id = value;
                            setReviewForms(newForms);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fake user" />
                          </SelectTrigger>
                          <SelectContent>
                            {fakeUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={user.avatar_url || undefined} />
                                    <AvatarFallback>
                                      {user.display_name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{user.display_name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Rating</Label>
                        <StarRating
                          rating={form.rating}
                          onRatingChange={(rating) => {
                            const newForms = [...reviewForms];
                            newForms[index].rating = Math.max(1, Math.min(10, rating)); // Ensure rating is between 1-10
                            setReviewForms(newForms);
                          }}
                        />
                      </div>

                      <div>
                        <Label>Review Title</Label>
                        <Input
                          value={form.review_title}
                          onChange={(e) => {
                            const newForms = [...reviewForms];
                            newForms[index].review_title = e.target.value;
                            setReviewForms(newForms);
                          }}
                          placeholder="Enter review title"
                          maxLength={200}
                          autoComplete="off"
                          className="w-full"
                          spellCheck={false}
                        />
                      </div>

                      <div>
                        <Label>Review Text</Label>
                        <Textarea
                          value={form.review_text}
                          onChange={(e) => {
                            const newForms = [...reviewForms];
                            newForms[index].review_text = e.target.value;
                            setReviewForms(newForms);
                          }}
                          placeholder="Enter review text"
                          rows={3}
                          className="resize-none w-full"
                          maxLength={1000}
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateReviewDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateReviews}>
                    Create Reviews
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
