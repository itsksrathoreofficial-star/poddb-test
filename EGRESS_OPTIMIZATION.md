# Supabase Egress Optimization Guide

## Current Issue
- **Egress Usage**: 15.107 GB / 5 GB (302% over limit)
- **Plan**: Free Plan
- **Status**: Exceeded quota

## Implemented Optimizations

### 1. Reduced Refresh Frequency
- **Homepage**: 5 minutes → 30 minutes
- **Explore Page**: 5 minutes → 30 minutes  
- **Admin Status**: 5 seconds → 30 seconds
- **Sync Polling**: 2 seconds → 10 seconds

### 2. Query Optimization
- **Reduced Columns**: Removed unnecessary fields from SELECT queries
- **Smaller Limits**: Reduced result set sizes
  - Podcasts: 8 → 6 items
  - Episodes: 8 → 6 items
  - People: 12 → 8 items
  - Categories: 10 → 8 items
  - News: 3 → 2 items

### 3. Caching Implementation
- **In-Memory Cache**: 10-minute cache for homepage and explore data
- **Cache Key Strategy**: Unique keys per page/component
- **Automatic Cleanup**: Expired items removed every 5 minutes

### 4. Data Compression
- **JSON Optimization**: Removed null/undefined values
- **Whitespace Removal**: Compressed JSON responses
- **Response Size Reduction**: ~30-40% smaller responses

### 5. Request Monitoring
- **Rate Limiting**: Max 100 requests per hour
- **Usage Tracking**: Monitor egress consumption
- **Automatic Throttling**: Prevent excessive requests

## Expected Results

### Egress Reduction
- **Refresh Frequency**: 6x reduction (5min → 30min)
- **Query Size**: ~40% reduction in data per request
- **Caching**: ~80% reduction in duplicate requests
- **Overall**: Expected 70-80% reduction in egress usage

### Performance Impact
- **Positive**: Faster page loads due to caching
- **Minimal**: Slightly less real-time data (acceptable for free plan)
- **User Experience**: No significant impact on functionality

## Monitoring

### Key Metrics to Watch
1. **Egress Usage**: Should drop below 5GB/month
2. **Cache Hit Rate**: Should be >80% for cached pages
3. **Request Frequency**: Should stay under 100/hour
4. **Page Load Times**: Should improve due to caching

### Warning Signs
- Egress still exceeding 5GB after 1 week
- Cache hit rate below 50%
- Request count consistently hitting limits
- User complaints about stale data

## Additional Recommendations

### If Still Over Limit
1. **Increase Cache TTL**: 10 minutes → 30 minutes
2. **Further Reduce Limits**: 6 items → 4 items
3. **Disable Auto-Refresh**: Remove periodic updates entirely
4. **Implement Pagination**: Load data on-demand only

### Long-term Solutions
1. **Upgrade to Pro Plan**: $25/month for 8GB egress
2. **Implement CDN**: Cache static content
3. **Database Optimization**: Use views and materialized tables
4. **API Rate Limiting**: Implement stricter limits

## Files Modified
- `src/app/HomePageClient.tsx` - Reduced refresh + caching
- `src/app/explore/page.tsx` - Reduced refresh + caching  
- `src/app/admin/components/DataSyncTab.tsx` - Reduced polling
- `src/lib/cache.ts` - New caching system
- `src/lib/compression.ts` - Data compression
- `src/lib/egress-monitor.ts` - Usage monitoring

## Testing
1. Deploy changes to production
2. Monitor Supabase dashboard for 24-48 hours
3. Check egress usage trends
4. Verify page functionality still works
5. Adjust settings if needed

## Rollback Plan
If issues arise, revert these changes:
1. Restore original refresh intervals
2. Remove caching logic
3. Restore original query limits
4. Monitor egress usage

---
**Last Updated**: $(date)
**Status**: Implemented and Ready for Testing
