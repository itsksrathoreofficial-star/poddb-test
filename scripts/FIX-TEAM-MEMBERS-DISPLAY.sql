-- Fix team members display in get_podcast_details_by_slug function
-- The function should fetch team members from the team_members JSONB column in podcasts table
-- instead of from podcast_people table

CREATE OR REPLACE FUNCTION public.get_podcast_details_by_slug(p_slug text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN (

        SELECT jsonb_build_object(

            'id', p.id,

            'title', p.title,

            'description', p.description,

            'cover_image_url', p.cover_image_url,

            'additional_images', p.additional_images,

            'slug', p.slug,

            'total_episodes', p.total_episodes,

            'total_views', p.total_views,

            'total_likes', p.total_likes,

            'categories', p.categories,

            'language', p.language,

            'location', p.location,

            'social_links', p.social_links,

            'platform_links', p.platform_links,

            'official_website', p.official_website,

            'average_duration', p.average_duration,

            'last_episode_date', p.last_episode_date,

            'is_verified', p.is_verified,

            'team_members', COALESCE(p.team_members, '[]'::jsonb),

            'episodes', (

                SELECT jsonb_agg(e)

                FROM (

                    SELECT

                        e.id,

                        e.title,

                        e.description,

                        e.youtube_url,

                        e.youtube_video_id,

                        e.thumbnail_url,

                        e.duration,

                        e.published_at,

                        e.views,

                        e.likes,

                        e.comments,

                        e.slug,

                        e.episode_number,

                        e.season_number,

                        e.tags,

                        e.average_rating,

                        e.rating_count,

                        e.seo_metadata

                    FROM episodes e

                    WHERE e.podcast_id = p.id

                    ORDER BY e.episode_number ASC, e.published_at ASC

                ) e

            ),

            'reviews', (

                SELECT COALESCE(jsonb_agg(r), '[]'::jsonb)

                FROM (

                    SELECT

                        r.id,

                        r.rating,

                        r.review_title,

                        r.review_text,

                        r.created_at,

                        r.upvotes,

                        r.downvotes,

                        r.fake_user_name,

                        r.fake_user_avatar,

                        r.fake_user_email,

                        r.is_fake_review,

                        -- Use fake user info if it's a fake review, otherwise use profile info

                        CASE 

                            WHEN r.is_fake_review = true THEN

                                jsonb_build_object(

                                    'display_name', r.fake_user_name,

                                    'avatar_url', r.fake_user_avatar

                                )

                            ELSE

                                jsonb_build_object(

                                    'display_name', pr.display_name,

                                    'avatar_url', pr.avatar_url

                                )

                        END as profiles

                    FROM reviews r

                    LEFT JOIN profiles pr ON r.user_id = pr.user_id

                    WHERE r.target_id = p.id AND r.target_table = 'podcasts'

                    ORDER BY r.created_at DESC

                ) r

            )

        )

        FROM podcasts p

        WHERE p.slug = p_slug AND p.submission_status = 'approved'

    );

END;

$$;
