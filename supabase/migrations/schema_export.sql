--
-- PostgreSQL database dump
--



-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: contribution_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contribution_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: contribution_target; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contribution_target AS ENUM (
    'podcasts',
    'episodes',
    'people'
);


--
-- Name: review_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.review_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: submission_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.submission_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'partial'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: add_category_if_not_exists(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_category_if_not_exists(cat_name text, cat_description text DEFAULT NULL::text) RETURNS text
    LANGUAGE plpgsql
    AS $$

BEGIN

  INSERT INTO public.podcast_categories (name, description)

  VALUES (cat_name, cat_description)

  ON CONFLICT (name) DO NOTHING;

  

  RETURN cat_name;

END;

$$;


--
-- Name: add_column_if_not_exists(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_column_if_not_exists(p_table_name text, p_column_name text, p_column_type text) RETURNS void
    LANGUAGE plpgsql
    AS $$

BEGIN

    IF NOT EXISTS (

        SELECT 1

        FROM information_schema.columns

        WHERE table_schema = 'public'

        AND table_name = p_table_name

        AND column_name = p_column_name

    ) THEN

        EXECUTE 'ALTER TABLE public.' || quote_ident(p_table_name) || 

                ' ADD COLUMN ' || quote_ident(p_column_name) || ' ' || p_column_type;

    END IF;

END;

$$;


--
-- Name: add_contribution_to_history(uuid, text, text, uuid, text, text, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_contribution_to_history(p_user_id uuid, p_contribution_type text, p_target_table text, p_target_id uuid, p_target_title text, p_target_slug text DEFAULT NULL::text, p_target_image_url text DEFAULT NULL::text, p_status text DEFAULT 'pending'::text, p_metadata jsonb DEFAULT NULL::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    history_id uuid;

BEGIN

    INSERT INTO public.contribution_history (

        user_id, contribution_type, target_table, target_id, target_title, 

        target_slug, target_image_url, status, metadata

    ) VALUES (

        p_user_id, p_contribution_type, p_target_table, p_target_id, p_target_title,

        p_target_slug, p_target_image_url, p_status, p_metadata

    ) RETURNING id INTO history_id;

    

    RETURN history_id;

END;

$$;


--
-- Name: add_language_if_not_exists(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_language_if_not_exists(lang_code text, lang_name text, lang_native_name text DEFAULT NULL::text) RETURNS text
    LANGUAGE plpgsql
    AS $$

BEGIN

  INSERT INTO public.languages (code, name, native_name)

  VALUES (lang_code, lang_name, lang_native_name)

  ON CONFLICT (code) DO NOTHING;

  

  RETURN lang_code;

END;

$$;


--
-- Name: approve_contribution(bigint, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.approve_contribution(contribution_id bigint, reviewer_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    _contribution contributions%ROWTYPE;

    _target_table_name TEXT;

    _update_query TEXT;

    _is_admin BOOLEAN;

BEGIN

    -- Check if the reviewer_id is an admin (when called from service role)

    -- or if the current user is an admin (when called from authenticated user)

    SELECT EXISTS (

        SELECT 1

        FROM public.profiles

        WHERE user_id = COALESCE(reviewer_id, auth.uid()) AND role = 'admin'

    ) INTO _is_admin;



    IF NOT _is_admin THEN

        RAISE EXCEPTION 'Only admins can approve contributions.';

    END IF;



    -- Retrieve the contribution and lock the row to prevent race conditions

    SELECT * INTO _contribution FROM public.contributions WHERE id = contribution_id AND status = 'pending' FOR UPDATE;



    IF NOT FOUND THEN

        RAISE EXCEPTION 'Pending contribution not found.';

    END IF;



    _target_table_name := _contribution.target_table::TEXT;



    -- Dynamically construct the UPDATE query based on the target table

    -- Filter out columns that don't exist in the target table

    IF _target_table_name = 'podcasts' THEN

        -- For podcasts table, only include valid columns

        _update_query := format(

            'UPDATE public.%I SET %s WHERE id = %L::uuid',

            _target_table_name,

            (SELECT string_agg(format('%I = %L', key, value), ', ') 

             FROM jsonb_each_text(_contribution.data) 

             WHERE key IN ('title', 'description', 'author', 'category', 'language', 'location', 'website_url', 'rss_url', 'image_url', 'tags', 'status', 'verified', 'featured', 'created_at', 'updated_at')),

            _contribution.target_id

        );

    ELSE

        _update_query := format(

            'UPDATE public.%I SET %s WHERE id = %L::uuid',

            _target_table_name,

            (SELECT string_agg(format('%I = %L', key, value), ', ') FROM jsonb_each_text(_contribution.data)),

            _contribution.target_id

        );

    END IF;



    EXECUTE _update_query;



    -- Update the contribution status to 'approved'

    UPDATE public.contributions

    SET

        status = 'approved',

        reviewed_by = COALESCE(reviewer_id, auth.uid()),

        reviewed_at = NOW()

    WHERE id = contribution_id;

END;

$$;


--
-- Name: calculate_daily_gains(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_daily_gains() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    -- Calculate daily gains for podcast_daily_stats

    IF TG_TABLE_NAME = 'podcast_daily_stats' THEN

        -- Get previous day's data

        SELECT 

            COALESCE(views, 0),

            COALESCE(likes, 0),

            COALESCE(comments, 0),

            COALESCE(total_watch_time, 0)

        INTO 

            NEW.daily_views_gain,

            NEW.daily_likes_gain,

            NEW.daily_comments_gain,

            NEW.daily_watch_time_gain

        FROM podcast_daily_stats 

        WHERE podcast_id = NEW.podcast_id 

        AND date = NEW.date - INTERVAL '1 day';

        

        -- Calculate gains (current - previous)

        NEW.daily_views_gain := NEW.views - COALESCE(NEW.daily_views_gain, 0);

        NEW.daily_likes_gain := NEW.likes - COALESCE(NEW.daily_likes_gain, 0);

        NEW.daily_comments_gain := NEW.comments - COALESCE(NEW.daily_comments_gain, 0);

        NEW.daily_watch_time_gain := NEW.total_watch_time - COALESCE(NEW.daily_watch_time_gain, 0);

    END IF;

    

    -- Calculate daily gains for episode_daily_stats

    IF TG_TABLE_NAME = 'episode_daily_stats' THEN

        -- Get previous day's data

        SELECT 

            COALESCE(views, 0),

            COALESCE(likes, 0),

            COALESCE(comments, 0),

            COALESCE(watch_time, 0)

        INTO 

            NEW.daily_views_gain,

            NEW.daily_likes_gain,

            NEW.daily_comments_gain,

            NEW.daily_watch_time_gain

        FROM episode_daily_stats 

        WHERE episode_id = NEW.episode_id 

        AND date = NEW.date - INTERVAL '1 day';

        

        -- Calculate gains (current - previous)

        NEW.daily_views_gain := NEW.views - COALESCE(NEW.daily_views_gain, 0);

        NEW.daily_likes_gain := NEW.likes - COALESCE(NEW.daily_likes_gain, 0);

        NEW.daily_comments_gain := NEW.comments - COALESCE(NEW.daily_comments_gain, 0);

        NEW.daily_watch_time_gain := NEW.watch_time - COALESCE(NEW.daily_watch_time_gain, 0);

    END IF;

    

    RETURN NEW;

END;

$$;


--
-- Name: calculate_monthly_stats(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_monthly_stats(year_num integer, month_num integer) RETURNS void
    LANGUAGE plpgsql
    AS $$

DECLARE

    month_start DATE;

    month_end DATE;

BEGIN

    month_start := DATE(year_num || '-' || LPAD(month_num::TEXT, 2, '0') || '-01');

    month_end := month_start + INTERVAL '1 month' - INTERVAL '1 day';



    -- Calculate monthly stats for podcasts

    INSERT INTO public.podcast_monthly_stats (

        podcast_id, year, month, month_start, month_end, total_views, total_likes, total_comments, total_shares,

        avg_daily_views, avg_daily_likes, avg_daily_comments, avg_daily_shares,

        peak_daily_views, peak_daily_likes, total_watch_time, avg_engagement_rate,

        monthly_growth_rate, new_episodes_count, total_episodes

    )

    SELECT 

        pds.podcast_id,

        year_num as year,

        month_num as month,

        month_start,

        month_end,

        SUM(pds.views) as total_views,

        SUM(pds.likes) as total_likes,

        SUM(pds.comments) as total_comments,

        SUM(pds.shares) as total_shares,

        ROUND(AVG(pds.views)) as avg_daily_views,

        ROUND(AVG(pds.likes)) as avg_daily_likes,

        ROUND(AVG(pds.comments)) as avg_daily_comments,

        ROUND(AVG(pds.shares)) as avg_daily_shares,

        MAX(pds.views) as peak_daily_views,

        MAX(pds.likes) as peak_daily_likes,

        SUM(pds.total_watch_time) as total_watch_time,

        CASE 

            WHEN SUM(pds.views) > 0 THEN 

                ROUND((SUM(pds.likes + pds.comments + pds.shares)::DECIMAL / SUM(pds.views))::DECIMAL, 4)

            ELSE 0 

        END as avg_engagement_rate,

        0 as monthly_growth_rate, -- Will be calculated separately

        COUNT(DISTINCT CASE WHEN pds.new_episodes > 0 THEN pds.podcast_id END) as new_episodes_count,

        MAX(pds.total_episodes) as total_episodes

    FROM public.podcast_daily_stats pds

    WHERE pds.date >= month_start AND pds.date <= month_end

    GROUP BY pds.podcast_id

    ON CONFLICT (podcast_id, year, month) DO UPDATE SET

        total_views = EXCLUDED.total_views,

        total_likes = EXCLUDED.total_likes,

        total_comments = EXCLUDED.total_comments,

        total_shares = EXCLUDED.total_shares,

        avg_daily_views = EXCLUDED.avg_daily_views,

        avg_daily_likes = EXCLUDED.avg_daily_likes,

        avg_daily_comments = EXCLUDED.avg_daily_comments,

        avg_daily_shares = EXCLUDED.avg_daily_shares,

        peak_daily_views = EXCLUDED.peak_daily_views,

        peak_daily_likes = EXCLUDED.peak_daily_likes,

        total_watch_time = EXCLUDED.total_watch_time,

        avg_engagement_rate = EXCLUDED.avg_engagement_rate,

        new_episodes_count = EXCLUDED.new_episodes_count,

        total_episodes = EXCLUDED.total_episodes,

        updated_at = NOW();



    -- Calculate monthly stats for episodes

    INSERT INTO public.episode_monthly_stats (

        episode_id, podcast_id, year, month, month_start, month_end, total_views, total_likes, total_comments, total_shares,

        avg_daily_views, avg_daily_likes, avg_daily_comments, avg_daily_shares,

        peak_daily_views, total_watch_time, avg_watch_percentage, avg_engagement_rate, avg_retention_rate

    )

    SELECT 

        eds.episode_id,

        eds.podcast_id,

        year_num as year,

        month_num as month,

        month_start,

        month_end,

        SUM(eds.views) as total_views,

        SUM(eds.likes) as total_likes,

        SUM(eds.comments) as total_comments,

        SUM(eds.shares) as total_shares,

        ROUND(AVG(eds.views)) as avg_daily_views,

        ROUND(AVG(eds.likes)) as avg_daily_likes,

        ROUND(AVG(eds.comments)) as avg_daily_comments,

        ROUND(AVG(eds.shares)) as avg_daily_shares,

        MAX(eds.views) as peak_daily_views,

        SUM(eds.watch_time) as total_watch_time,

        ROUND(AVG(eds.avg_watch_percentage), 2) as avg_watch_percentage,

        CASE 

            WHEN SUM(eds.views) > 0 THEN 

                ROUND((SUM(eds.likes + eds.comments + eds.shares)::DECIMAL / SUM(eds.views))::DECIMAL, 4)

            ELSE 0 

        END as avg_engagement_rate,

        ROUND(AVG(eds.retention_rate), 4) as avg_retention_rate

    FROM public.episode_daily_stats eds

    WHERE eds.date >= month_start AND eds.date <= month_end

    GROUP BY eds.episode_id, eds.podcast_id

    ON CONFLICT (episode_id, year, month) DO UPDATE SET

        total_views = EXCLUDED.total_views,

        total_likes = EXCLUDED.total_likes,

        total_comments = EXCLUDED.total_comments,

        total_shares = EXCLUDED.total_shares,

        avg_daily_views = EXCLUDED.avg_daily_views,

        avg_daily_likes = EXCLUDED.avg_daily_likes,

        avg_daily_comments = EXCLUDED.avg_daily_comments,

        avg_daily_shares = EXCLUDED.avg_daily_shares,

        peak_daily_views = EXCLUDED.peak_daily_views,

        total_watch_time = EXCLUDED.total_watch_time,

        avg_watch_percentage = EXCLUDED.avg_watch_percentage,

        avg_engagement_rate = EXCLUDED.avg_engagement_rate,

        avg_retention_rate = EXCLUDED.avg_retention_rate,

        updated_at = NOW();

END;

$$;


--
-- Name: calculate_session_metrics(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_session_metrics(session_uuid uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$

BEGIN

    UPDATE public.analytics_sessions 

    SET 

        page_views_count = (

            SELECT COUNT(*) FROM public.analytics_events 

            WHERE session_id = session_uuid AND event_type = 'page_view'

        ),

        clicks_count = (

            SELECT COUNT(*) FROM public.analytics_events 

            WHERE session_id = session_uuid AND event_type = 'click'

        ),

        searches_count = (

            SELECT COUNT(*) FROM public.analytics_events 

            WHERE session_id = session_uuid AND event_type = 'search'

        ),

        downloads_count = (

            SELECT COUNT(*) FROM public.analytics_events 

            WHERE session_id = session_uuid AND event_type = 'download'

        ),

        plays_count = (

            SELECT COUNT(*) FROM public.analytics_events 

            WHERE session_id = session_uuid AND event_type = 'play'

        )

    WHERE id = session_uuid;

END;

$$;


--
-- Name: calculate_weekly_stats(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_weekly_stats(start_date date) RETURNS void
    LANGUAGE plpgsql
    AS $$

BEGIN

    -- Calculate weekly stats for podcasts

    INSERT INTO public.podcast_weekly_stats (

        podcast_id, week_start, week_end, total_views, total_likes, total_comments, total_shares,

        avg_daily_views, avg_daily_likes, avg_daily_comments, avg_daily_shares,

        peak_daily_views, peak_daily_likes, total_watch_time, avg_engagement_rate,

        weekly_growth_rate, new_episodes_count, total_episodes

    )

    SELECT 

        pds.podcast_id,

        start_date as week_start,

        start_date + INTERVAL '6 days' as week_end,

        SUM(pds.views) as total_views,

        SUM(pds.likes) as total_likes,

        SUM(pds.comments) as total_comments,

        SUM(pds.shares) as total_shares,

        ROUND(AVG(pds.views)) as avg_daily_views,

        ROUND(AVG(pds.likes)) as avg_daily_likes,

        ROUND(AVG(pds.comments)) as avg_daily_comments,

        ROUND(AVG(pds.shares)) as avg_daily_shares,

        MAX(pds.views) as peak_daily_views,

        MAX(pds.likes) as peak_daily_likes,

        SUM(pds.total_watch_time) as total_watch_time,

        CASE 

            WHEN SUM(pds.views) > 0 THEN 

                ROUND((SUM(pds.likes + pds.comments + pds.shares)::DECIMAL / SUM(pds.views))::DECIMAL, 4)

            ELSE 0 

        END as avg_engagement_rate,

        0 as weekly_growth_rate, -- Will be calculated separately

        COUNT(DISTINCT CASE WHEN pds.new_episodes > 0 THEN pds.podcast_id END) as new_episodes_count,

        MAX(pds.total_episodes) as total_episodes

    FROM public.podcast_daily_stats pds

    WHERE pds.date >= start_date AND pds.date <= start_date + INTERVAL '6 days'

    GROUP BY pds.podcast_id

    ON CONFLICT (podcast_id, week_start) DO UPDATE SET

        total_views = EXCLUDED.total_views,

        total_likes = EXCLUDED.total_likes,

        total_comments = EXCLUDED.total_comments,

        total_shares = EXCLUDED.total_shares,

        avg_daily_views = EXCLUDED.avg_daily_views,

        avg_daily_likes = EXCLUDED.avg_daily_likes,

        avg_daily_comments = EXCLUDED.avg_daily_comments,

        avg_daily_shares = EXCLUDED.avg_daily_shares,

        peak_daily_views = EXCLUDED.peak_daily_views,

        peak_daily_likes = EXCLUDED.peak_daily_likes,

        total_watch_time = EXCLUDED.total_watch_time,

        avg_engagement_rate = EXCLUDED.avg_engagement_rate,

        new_episodes_count = EXCLUDED.new_episodes_count,

        total_episodes = EXCLUDED.total_episodes,

        updated_at = NOW();



    -- Calculate weekly stats for episodes

    INSERT INTO public.episode_weekly_stats (

        episode_id, podcast_id, week_start, week_end, total_views, total_likes, total_comments, total_shares,

        avg_daily_views, avg_daily_likes, avg_daily_comments, avg_daily_shares,

        peak_daily_views, total_watch_time, avg_watch_percentage, avg_engagement_rate, avg_retention_rate

    )

    SELECT 

        eds.episode_id,

        eds.podcast_id,

        start_date as week_start,

        start_date + INTERVAL '6 days' as week_end,

        SUM(eds.views) as total_views,

        SUM(eds.likes) as total_likes,

        SUM(eds.comments) as total_comments,

        SUM(eds.shares) as total_shares,

        ROUND(AVG(eds.views)) as avg_daily_views,

        ROUND(AVG(eds.likes)) as avg_daily_likes,

        ROUND(AVG(eds.comments)) as avg_daily_comments,

        ROUND(AVG(eds.shares)) as avg_daily_shares,

        MAX(eds.views) as peak_daily_views,

        SUM(eds.watch_time) as total_watch_time,

        ROUND(AVG(eds.avg_watch_percentage), 2) as avg_watch_percentage,

        CASE 

            WHEN SUM(eds.views) > 0 THEN 

                ROUND((SUM(eds.likes + eds.comments + eds.shares)::DECIMAL / SUM(eds.views))::DECIMAL, 4)

            ELSE 0 

        END as avg_engagement_rate,

        ROUND(AVG(eds.retention_rate), 4) as avg_retention_rate

    FROM public.episode_daily_stats eds

    WHERE eds.date >= start_date AND eds.date <= start_date + INTERVAL '6 days'

    GROUP BY eds.episode_id, eds.podcast_id

    ON CONFLICT (episode_id, week_start) DO UPDATE SET

        total_views = EXCLUDED.total_views,

        total_likes = EXCLUDED.total_likes,

        total_comments = EXCLUDED.total_comments,

        total_shares = EXCLUDED.total_shares,

        avg_daily_views = EXCLUDED.avg_daily_views,

        avg_daily_likes = EXCLUDED.avg_daily_likes,

        avg_daily_comments = EXCLUDED.avg_daily_comments,

        avg_daily_shares = EXCLUDED.avg_daily_shares,

        peak_daily_views = EXCLUDED.peak_daily_views,

        total_watch_time = EXCLUDED.total_watch_time,

        avg_watch_percentage = EXCLUDED.avg_watch_percentage,

        avg_engagement_rate = EXCLUDED.avg_engagement_rate,

        avg_retention_rate = EXCLUDED.avg_retention_rate,

        updated_at = NOW();

END;

$$;


--
-- Name: cast_vote(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cast_vote(p_nomination_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    v_category_id UUID;

    v_year INT;

    already_voted BOOLEAN;

BEGIN

    -- Get the category and year for the nomination

    SELECT category_id, year INTO v_category_id, v_year

    FROM public.nominations

    WHERE id = p_nomination_id;



    -- Check if the user has already voted in this category for this year

    SELECT EXISTS (

        SELECT 1

        FROM public.votes v

        JOIN public.nominations n ON v.nomination_id = n.id

        WHERE v.user_id = p_user_id

          AND n.category_id = v_category_id

          AND n.year = v_year

    ) INTO already_voted;



    IF already_voted THEN

        RETURN FALSE; -- User has already voted in this category for this year

    END IF;



    -- Insert the new vote

    INSERT INTO public.votes (user_id, nomination_id)

    VALUES (p_user_id, p_nomination_id);



    RETURN TRUE;

END;

$$;


--
-- Name: cast_vote(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cast_vote(p_poll_id uuid, p_nominated_podcast_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    poll_deadline TIMESTAMPTZ;

    already_voted BOOLEAN;

BEGIN

    -- Check if the poll is still open

    SELECT deadline INTO poll_deadline FROM public.nomination_polls WHERE id = p_poll_id;

    IF poll_deadline IS NULL OR poll_deadline < now() THEN

        RETURN FALSE; -- Poll is closed or doesn't exist

    END IF;



    -- Check if the user has already voted in this poll

    SELECT EXISTS (

        SELECT 1

        FROM public.votes v

        JOIN public.nominated_podcasts np ON v.nominated_podcast_id = np.id

        WHERE v.user_id = p_user_id AND np.poll_id = p_poll_id

    ) INTO already_voted;



    IF already_voted THEN

        RETURN FALSE; -- User has already voted

    END IF;



    -- Insert the new vote

    INSERT INTO public.votes (user_id, nominated_podcast_id)

    VALUES (p_user_id, p_nominated_podcast_id);



    RETURN TRUE;

END;

$$;


--
-- Name: create_contribution_notification(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_contribution_notification() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    notification_title text;

    notification_message text;

    notification_type text;

    target_url text;

    user_id uuid;

BEGIN

    -- Only proceed if status changed

    IF OLD.submission_status = NEW.submission_status THEN

        RETURN NEW;

    END IF;



    -- Get the user who submitted this contribution

    user_id := NEW.submitted_by;

    

    -- Determine notification details based on new status

    IF NEW.submission_status = 'approved' THEN

        notification_title := 'Contribution Approved! 🎉';

        notification_message := 'Your contribution "' || NEW.title || '" has been approved and is now live on PodDB Pro.';

        notification_type := 'approval';

        target_url := '/podcasts/' || NEW.slug;

    ELSIF NEW.submission_status = 'rejected' THEN

        notification_title := 'Contribution Update';

        notification_message := 'Your contribution "' || NEW.title || '" needs some adjustments. Please review and resubmit.';

        notification_type := 'rejection';

        target_url := '/contribution-history';

    ELSE

        -- For other status changes, don't create notification

        RETURN NEW;

    END IF;



    -- Create the notification

    PERFORM create_notification(

        user_id,

        notification_title,

        notification_message,

        notification_type,

        'podcasts',

        NEW.id,

        target_url,

        jsonb_build_object(

            'contribution_title', NEW.title,

            'contribution_type', 'podcast',

            'old_status', OLD.submission_status,

            'new_status', NEW.submission_status

        )

    );



    RETURN NEW;

END;

$$;


--
-- Name: create_notification(uuid, text, text, text, text, uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_notification(p_user_id uuid, p_title text, p_message text, p_type text, p_target_table text DEFAULT NULL::text, p_target_id uuid DEFAULT NULL::uuid, p_target_url text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    notification_id uuid;

BEGIN

    INSERT INTO public.notifications (

        user_id, title, message, type, target_table, target_id, target_url, metadata

    ) VALUES (

        p_user_id, p_title, p_message, p_type, p_target_table, p_target_id, p_target_url, p_metadata

    ) RETURNING id INTO notification_id;

    

    RETURN notification_id;

END;

$$;


--
-- Name: create_profile_for_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_profile_for_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    INSERT INTO public.profiles (user_id, email, role, display_name)

    VALUES (NEW.id, NEW.email, 'user', NEW.raw_user_meta_data->>'display_name');

    RETURN NEW;

END;

$$;


--
-- Name: create_verification_notification(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_verification_notification() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    notification_title text;

    notification_message text;

    notification_type text;

    target_url text;

    user_id uuid;

    target_name text;

BEGIN

    -- Only proceed if status changed

    IF OLD.status = NEW.status THEN

        RETURN NEW;

    END IF;



    -- Get the user who submitted this verification request

    user_id := NEW.user_id;

    

    -- Get target name from the verification request

    target_name := COALESCE(NEW.target_name, 'Your verification request');

    

    -- Determine notification details based on new status

    IF NEW.status = 'approved' THEN

        notification_title := 'Verification Approved! ✅';

        notification_message := 'Your verification request for "' || target_name || '" has been approved.';

        notification_type := 'verification';

        target_url := '/profile';

    ELSIF NEW.status = 'rejected' THEN

        notification_title := 'Verification Update';

        notification_message := 'Your verification request for "' || target_name || '" was not approved. ' || COALESCE(NEW.rejection_reason, 'Please review the requirements and try again.');

        notification_type := 'rejection';

        target_url := '/profile';

    ELSE

        -- For other status changes, don't create notification

        RETURN NEW;

    END IF;



    -- Create the notification

    PERFORM create_notification(

        user_id,

        notification_title,

        notification_message,

        notification_type,

        NEW.target_table,

        NEW.target_id,

        target_url,

        jsonb_build_object(

            'verification_target', target_name,

            'old_status', OLD.status,

            'new_status', NEW.status,

            'rejection_reason', NEW.rejection_reason

        )

    );



    RETURN NEW;

END;

$$;


--
-- Name: create_welcome_notification(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_welcome_notification() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    -- Create welcome notification for new user

    PERFORM create_notification(

        NEW.user_id,

        'Welcome to PodDB Pro! 🎉',

        'Thank you for joining PodDB Pro! Start exploring podcasts, contributing to our database, and connecting with other podcast enthusiasts.',

        'system',

        NULL,

        NULL,

        '/explore',

        jsonb_build_object(

            'is_welcome', true,

            'user_email', NEW.email

        )

    );



    RETURN NEW;

END;

$$;


--
-- Name: execute_sql(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.execute_sql(sql text) RETURNS SETOF json
    LANGUAGE plpgsql
    AS $$

BEGIN

  RETURN QUERY EXECUTE sql;

END;

$$;


--
-- Name: generate_error_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_error_id() RETURNS character varying
    LANGUAGE plpgsql
    AS $$

DECLARE

    error_id VARCHAR(50);

BEGIN

    -- Generate a short, readable error ID

    error_id := 'ERR-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 8);

    RETURN error_id;

END;

$$;


--
-- Name: FUNCTION generate_error_id(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.generate_error_id() IS 'Generates short, readable error IDs for easy reference';


--
-- Name: generate_random_schedule_dates(uuid[], integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_random_schedule_dates(review_ids uuid[], days_count integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    review_id uuid;

    random_days integer;

    scheduled_date timestamp with time zone;

BEGIN

    FOREACH review_id IN ARRAY review_ids

    LOOP

        -- Generate random days between 0 and days_count

        random_days := floor(random() * (days_count + 1));

        

        -- Calculate scheduled date

        scheduled_date := now() + (random_days || ' days')::interval + 

                         (floor(random() * 24) || ' hours')::interval +

                         (floor(random() * 60) || ' minutes')::interval;

        

        -- Update the scheduled review

        UPDATE public.scheduled_reviews

        SET 

            scheduled_date = scheduled_date,

            random_days = random_days

        WHERE id = review_id;

    END LOOP;

END;

$$;


--
-- Name: generate_slug(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_slug(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));

END;

$$;


--
-- Name: get_active_ads_for_page(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_active_ads_for_page(page_name text, device_type text) RETURNS TABLE(id uuid, name character varying, type character varying, placement character varying, ad_position integer, google_adsense_code text, custom_html text, custom_css text, custom_js text, click_url text, image_url text, alt_text text, width integer, height integer, priority integer)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT 

        ac.id,

        ac.name,

        ac.type,

        ac.placement,

        ac.ad_position,

        ac.google_adsense_code,

        ac.custom_html,

        ac.custom_css,

        ac.custom_js,

        ac.click_url,

        ac.image_url,

        ac.alt_text,

        ac.width,

        ac.height,

        ac.priority

    FROM ad_configs ac

    WHERE 

        ac.status = 'active'

        AND (ac.pages @> ARRAY[page_name] OR ac.pages @> ARRAY['all'])

        AND ac.devices @> ARRAY[device_type]

    ORDER BY ac.priority ASC, ac.ad_position ASC;

END;

$$;


--
-- Name: get_all_categories(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_categories() RETURNS TABLE(category text, podcast_count bigint)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT

        cat.category,

        count(p.id) as podcast_count

    FROM (

        SELECT DISTINCT unnest(categories) as category FROM podcasts WHERE submission_status = 'approved' AND categories IS NOT NULL

    ) as cat

    LEFT JOIN podcasts p ON p.categories @> ARRAY[cat.category] AND p.submission_status = 'approved'

    GROUP BY cat.category

    ORDER BY podcast_count DESC, category ASC;

END;

$$;


--
-- Name: get_all_contributions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_contributions() RETURNS TABLE(id bigint, user_id uuid, target_table text, target_id bigint, data jsonb, notes text, status text, created_at timestamp with time zone, reviewed_by uuid, reviewed_at timestamp with time zone, reviewer_notes text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    -- This function is called by service role, so we trust it

    -- No need to check admin status as service role has full access



    -- Return all contributions

    RETURN QUERY

    SELECT 

        c.id,

        c.user_id,

        c.target_table::TEXT,

        c.target_id,

        c.data,

        c.notes,

        c.status::TEXT,

        c.created_at,

        c.reviewed_by,

        c.reviewed_at,

        c.reviewer_notes

    FROM public.contributions c

    ORDER BY c.created_at DESC;

END;

$$;


--
-- Name: get_all_nominations(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_nominations() RETURNS TABLE(nomination_id uuid, category_name text, nominee_name text, nominee_type text, nominee_slug text, nominee_image_url text, nomination_year integer, votes_count integer)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT

        n.id AS nomination_id,

        nc.name AS category_name,

        CASE

            WHEN n.podcast_id IS NOT NULL THEN p.title

            WHEN n.person_id IS NOT NULL THEN ps.full_name

            ELSE 'Unknown'

        END AS nominee_name,

        CASE

            WHEN n.podcast_id IS NOT NULL THEN 'podcast'

            WHEN n.person_id IS NOT NULL THEN 'person'

            ELSE 'unknown'

        END AS nominee_type,

        CASE

            WHEN n.podcast_id IS NOT NULL THEN p.slug

            WHEN n.person_id IS NOT NULL THEN ps.slug

            ELSE NULL

        END AS nominee_slug,

        CASE

            WHEN n.podcast_id IS NOT NULL THEN p.cover_image_url

            WHEN n.person_id IS NOT NULL THEN ps.photo_urls[1]

            ELSE NULL

        END AS nominee_image_url,

        n.year AS nomination_year,

        (SELECT COUNT(*) FROM votes v WHERE v.nomination_id = n.id)::INT AS votes_count

    FROM

        nominations n

    JOIN

        nomination_categories nc ON n.category_id = nc.id

    LEFT JOIN

        podcasts p ON n.podcast_id = p.id

    LEFT JOIN

        people ps ON n.person_id = ps.id

    WHERE

        n.is_active = TRUE

    ORDER BY

        nc.name, nominee_name;

END;

$$;


--
-- Name: get_all_reviews_with_details(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_reviews_with_details() RETURNS TABLE(id uuid, rating smallint, review_title text, review_text text, status public.review_status, created_at timestamp with time zone, user_display_name text, target_name text, target_table text)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT

        r.id,

        r.rating,

        r.review_title,

        r.review_text,

        r.status,

        r.created_at,

        p.display_name AS user_display_name,

        CASE

            WHEN r.target_table = 'podcasts' THEN pod.title

            WHEN r.target_table = 'episodes' THEN ep.title

            WHEN r.target_table = 'people' THEN peo.full_name

            ELSE 'N/A'

        END AS target_name,

        r.target_table

    FROM

        public.reviews r

    JOIN

        public.profiles p ON r.user_id = p.user_id

    LEFT JOIN

        public.podcasts pod ON r.target_table = 'podcasts' AND r.target_id = pod.id

    LEFT JOIN

        public.episodes ep ON r.target_table = 'episodes' AND r.target_id = ep.id

    LEFT JOIN

        public.people peo ON r.target_table = 'people' AND r.target_id = peo.id

    ORDER BY

        r.created_at DESC;

END;

$$;


--
-- Name: get_all_verification_requests(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_all_verification_requests() RETURNS TABLE(request_id uuid, target_id text, target_table text, target_name text, target_image_url text, status text, requestor_name text, requestor_email text, notes text, requested_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    RETURN QUERY

    SELECT

        vr.id as request_id,

        vr.target_id,

        vr.target_table,

        CASE

            WHEN vr.target_table = 'podcasts' THEN (SELECT p.title FROM public.podcasts p WHERE p.id::text = vr.target_id)

            WHEN vr.target_table = 'people' THEN (SELECT pe.full_name FROM public.people pe WHERE pe.id::text = vr.target_id)

            ELSE 'N/A'

        END AS target_name,

        CASE

            WHEN vr.target_table = 'podcasts' THEN (SELECT p.cover_image_url FROM public.podcasts p WHERE p.id::text = vr.target_id)

            WHEN vr.target_table = 'people' THEN (SELECT (pe.photo_urls[1]) FROM public.people pe WHERE pe.id::text = vr.target_id)

            ELSE NULL

        END AS target_image_url,

        vr.status,

        prof.display_name AS requestor_name,

        prof.email AS requestor_email,

        vr.notes,

        vr.created_at AS requested_at

    FROM

        public.verification_requests vr

    LEFT JOIN

        public.profiles prof ON vr.user_id = prof.user_id

    ORDER BY

        vr.created_at DESC;

END;

$$;


--
-- Name: get_assigned_awards_details(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_assigned_awards_details() RETURNS TABLE(id uuid, assigned_at timestamp with time zone, award_name text, award_description text, award_icon_svg text, target_id uuid, target_table text, target_name text, target_slug text, target_cover_image_url text)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT 

        aa.id,

        aa.assigned_at,

        aw.name AS award_name,

        aw.description AS award_description,

        aw.icon_svg AS award_icon_svg,

        aa.target_id,

        aa.target_table,

        CASE

            WHEN aa.target_table = 'podcasts' THEN p.title

            WHEN aa.target_table = 'episodes' THEN e.title

            WHEN aa.target_table = 'people' THEN pe.full_name

            ELSE NULL

        END AS target_name,

        CASE

            WHEN aa.target_table = 'podcasts' THEN p.slug

            WHEN aa.target_table = 'episodes' THEN e.slug

            WHEN aa.target_table = 'people' THEN pe.slug

            ELSE NULL

        END AS target_slug,

        CASE

            WHEN aa.target_table = 'podcasts' THEN p.cover_image_url

            WHEN aa.target_table = 'episodes' THEN e.thumbnail_url

            WHEN aa.target_table = 'people' THEN pe.photo_urls[1]

            ELSE NULL

        END AS target_cover_image_url

    FROM assigned_awards aa

    JOIN awards aw ON aa.award_id = aw.id

    LEFT JOIN podcasts p ON aa.target_table = 'podcasts' AND aa.target_id = p.id

    LEFT JOIN episodes e ON aa.target_table = 'episodes' AND aa.target_id = e.id

    LEFT JOIN people pe ON aa.target_table = 'people' AND aa.target_id = pe.id

    ORDER BY aa.assigned_at DESC;

END;

$$;


--
-- Name: get_award_winners(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_award_winners() RETURNS json
    LANGUAGE plpgsql
    AS $$

DECLARE

    result_json JSON;

BEGIN

    SELECT json_agg(row_to_json(t)) INTO result_json

    FROM (

        SELECT 

            a.id AS award_id,

            a.name AS award_name,

            aa.target_table,

            aa.target_id,

            CASE

                WHEN aa.target_table = 'podcasts' THEN (SELECT title FROM podcasts WHERE id = aa.target_id)

                WHEN aa.target_table = 'episodes' THEN (SELECT title FROM episodes WHERE id = aa.target_id)

                WHEN aa.target_table = 'people' THEN (SELECT full_name FROM people WHERE id = aa.target_id)

            END AS winner_name

        FROM assigned_awards aa

        JOIN awards a ON aa.award_id = a.id

        ORDER BY aa.assigned_at DESC

    ) t;

    RETURN result_json;

END;

$$;


--
-- Name: get_awards_for_target(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_awards_for_target(target_id uuid) RETURNS TABLE(id uuid, name text, description text, icon_svg text, assigned_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT

        a.id,

        a.name,

        a.description,

        a.icon_svg,

        aa.assigned_at

    FROM

        assigned_awards aa

    JOIN

        awards a ON aa.award_id = a.id

    WHERE

        aa.target_id = get_awards_for_target.target_id

    ORDER BY

        aa.assigned_at DESC;

END;

$$;


--
-- Name: get_category_suggestions(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_category_suggestions(search_term text) RETURNS TABLE(name text, description text)
    LANGUAGE plpgsql STABLE
    AS $$

BEGIN

  RETURN QUERY

  SELECT c.name, c.description

  FROM public.podcast_categories c

  WHERE c.name ILIKE '%' || search_term || '%'

     OR c.description ILIKE '%' || search_term || '%'

  ORDER BY 

    CASE 

      WHEN c.name ILIKE search_term || '%' THEN 1

      WHEN c.name ILIKE '%' || search_term || '%' THEN 2

      ELSE 3

    END,

    c.name

  LIMIT 10;

END;

$$;


--
-- Name: get_db_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_db_stats() RETURNS TABLE(podcast_count bigint, episode_count bigint, creator_count bigint)
    LANGUAGE plpgsql
    AS $$

BEGIN

  RETURN QUERY

  SELECT

    (SELECT COUNT(*) FROM public.podcasts WHERE submission_status = 'approved') AS podcast_count,

    (SELECT COUNT(*) FROM public.episodes WHERE podcast_id IN (SELECT id FROM public.podcasts WHERE submission_status = 'approved')) AS episode_count,

    (SELECT COUNT(*) FROM public.people) AS creator_count;

END;

$$;


--
-- Name: get_episode_details_by_slug(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_episode_details_by_slug(p_slug text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN (

        SELECT jsonb_build_object(

            'id', e.id,

            'title', e.title,

            'description', e.description,

            'youtube_url', e.youtube_url,

            'youtube_video_id', e.youtube_video_id,

            'thumbnail_url', e.thumbnail_url,

            'duration', e.duration,

            'published_at', e.published_at,

            'views', e.views,

            'likes', e.likes,

            'comments', e.comments,

            'slug', e.slug,

            'podcasts', (

                SELECT jsonb_build_object(

                    'id', p.id,

                    'title', p.title,

                    'cover_image_url', p.cover_image_url

                )

                FROM podcasts p

                WHERE p.id = e.podcast_id

            ),

            'reviews', (

                SELECT jsonb_agg(r)

                FROM (

                    SELECT

                        r.id,

                        r.rating,

                        r.review_title,

                        r.review_text,

                        r.created_at,

                        r.upvotes,

                        r.downvotes,

                        jsonb_build_object(

                            'display_name', pr.display_name,

                            'avatar_url', pr.avatar_url

                        ) as profiles

                    FROM reviews r

                    JOIN profiles pr ON r.user_id = pr.id

                    WHERE r.target_id = e.id AND r.target_table = 'episodes'

                    ORDER BY r.created_at DESC

                ) r

            )

        )

        FROM episodes e

        WHERE e.slug = p_slug

    );

END;

$$;


--
-- Name: get_error_statistics(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_error_statistics(start_date date DEFAULT (CURRENT_DATE - '7 days'::interval), end_date date DEFAULT CURRENT_DATE) RETURNS TABLE(total_errors bigint, critical_errors bigint, high_errors bigint, medium_errors bigint, low_errors bigint, resolved_errors bigint, unresolved_errors bigint, unique_users bigint, unique_sessions bigint, avg_resolution_time interval)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT 

        COUNT(*) as total_errors,

        COUNT(*) FILTER (WHERE severity = 'critical') as critical_errors,

        COUNT(*) FILTER (WHERE severity = 'high') as high_errors,

        COUNT(*) FILTER (WHERE severity = 'medium') as medium_errors,

        COUNT(*) FILTER (WHERE severity = 'low') as low_errors,

        COUNT(*) FILTER (WHERE resolved = true) as resolved_errors,

        COUNT(*) FILTER (WHERE resolved = false) as unresolved_errors,

        COUNT(DISTINCT user_id) as unique_users,

        COUNT(DISTINCT session_id) as unique_sessions,

        AVG(resolved_at - created_at) as avg_resolution_time

    FROM public.error_logs

    WHERE created_at::date BETWEEN start_date AND end_date;

END;

$$;


--
-- Name: FUNCTION get_error_statistics(start_date date, end_date date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_error_statistics(start_date date, end_date date) IS 'Returns comprehensive error statistics for a date range';


--
-- Name: get_error_trends(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_error_trends(days integer DEFAULT 7) RETURNS TABLE(date date, total_errors bigint, critical_errors bigint, high_errors bigint, medium_errors bigint, low_errors bigint)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT 

        created_at::date as date,

        COUNT(*) as total_errors,

        COUNT(*) FILTER (WHERE severity = 'critical') as critical_errors,

        COUNT(*) FILTER (WHERE severity = 'high') as high_errors,

        COUNT(*) FILTER (WHERE severity = 'medium') as medium_errors,

        COUNT(*) FILTER (WHERE severity = 'low') as low_errors

    FROM public.error_logs

    WHERE created_at::date >= CURRENT_DATE - INTERVAL '1 day' * days

    GROUP BY created_at::date

    ORDER BY date DESC;

END;

$$;


--
-- Name: FUNCTION get_error_trends(days integer); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_error_trends(days integer) IS 'Returns error trends over a specified number of days';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gemini_api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gemini_api_keys (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    api_key text NOT NULL,
    requests_used bigint DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: get_gemini_api_keys(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_gemini_api_keys() RETURNS SETOF public.gemini_api_keys
    LANGUAGE sql SECURITY DEFINER
    AS $$

  select * from public.gemini_api_keys;

$$;


--
-- Name: get_homepage_data(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_homepage_data() RETURNS jsonb
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN jsonb_build_object(

        'carouselItems', (

            SELECT jsonb_agg(c)

            FROM (

                SELECT

                    id,

                    title,

                    description,

                    image_url,

                    redirect_link,

                    "order",

                    is_active,

                    created_at

                FROM explore_carousel

                WHERE is_active = true

                ORDER BY "order" ASC, created_at ASC

            ) c

        ),

        'top_podcasts', (

            SELECT jsonb_agg(p)

            FROM (

                SELECT

                    id,

                    slug,

                    title,

                    description,

                    cover_image_url,

                    total_episodes,

                    total_views,

                    total_likes,

                    categories,

                    average_duration,

                    last_episode_date,

                    average_rating,

                    rating_count,

                    is_verified

                FROM podcasts

                WHERE submission_status = 'approved'

                ORDER BY total_views DESC, total_likes DESC

                LIMIT 8

            ) p

        ),

        'latest_episodes', (

            SELECT jsonb_agg(e)

            FROM (

                SELECT

                    ep.id,

                    ep.slug,

                    ep.title,

                    ep.thumbnail_url,

                    ep.duration,

                    p.is_verified,

                    jsonb_build_object(

                        'title', p.title,

                        'cover_image_url', p.cover_image_url

                    ) as podcasts

                FROM episodes ep

                JOIN podcasts p ON ep.podcast_id = p.id

                WHERE p.submission_status = 'approved'

                ORDER BY ep.published_at DESC

                LIMIT 8

            ) e

        ),

        'featured_people', (

            SELECT jsonb_agg(fp)

            FROM (

                SELECT

                    p.id,

                    p.slug,

                    p.full_name,

                    p.photo_urls,

                    p.total_appearances,

                    p.is_verified,

                    (SELECT role FROM podcast_people WHERE person_id = p.id LIMIT 1) as primary_role

                FROM people p

                ORDER BY p.created_at DESC

                LIMIT 12

            ) fp

        ),

        'latest_news', (

             SELECT jsonb_agg(n)

            FROM (

                SELECT

                    id,

                    title,

                    slug,

                    excerpt,

                    featured_image_url,

                    published_at

                FROM news_articles

                WHERE published = true

                ORDER BY published_at DESC

                LIMIT 3

            ) n

        ),

        'categories', (

            SELECT jsonb_agg(c)

            FROM (

                SELECT

                    category,

                    count(*) as podcast_count

                FROM (

                    SELECT unnest(categories) as category FROM podcasts WHERE submission_status = 'approved' AND categories IS NOT NULL

                ) as unnested_categories

                GROUP BY category

                ORDER BY podcast_count DESC

                LIMIT 8

            ) c

        )

    );

END;

$$;


--
-- Name: get_language_suggestions(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_language_suggestions(search_term text) RETURNS TABLE(code text, name text, native_name text)
    LANGUAGE plpgsql STABLE
    AS $$

BEGIN

  RETURN QUERY

  SELECT l.code, l.name, l.native_name

  FROM public.languages l

  WHERE l.name ILIKE '%' || search_term || '%' 

     OR l.native_name ILIKE '%' || search_term || '%'

     OR l.code ILIKE '%' || search_term || '%'

  ORDER BY 

    CASE 

      WHEN l.name ILIKE search_term || '%' THEN 1

      WHEN l.name ILIKE '%' || search_term || '%' THEN 2

      ELSE 3

    END,

    l.name

  LIMIT 10;

END;

$$;


--
-- Name: get_latest_episode_sync_records(timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_latest_episode_sync_records(before_date timestamp with time zone) RETURNS TABLE(episode_id uuid, views bigint, likes bigint)
    LANGUAGE plpgsql
    AS $$

BEGIN

  RETURN QUERY

  WITH ranked_syncs AS (

    SELECT

      esh.episode_id,

      esh.views::BIGINT,

      esh.likes::BIGINT,

      ROW_NUMBER() OVER(PARTITION BY esh.episode_id ORDER BY esh.created_at DESC) as rn

    FROM public.episode_sync_history esh

    WHERE esh.created_at <= before_date

  )

  SELECT

    rs.episode_id,

    rs.views,

    rs.likes

  FROM ranked_syncs rs

  WHERE rs.rn = 1;

END;

$$;


--
-- Name: get_latest_pending_sync_history(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_latest_pending_sync_history() RETURNS TABLE(id uuid, podcast_id uuid, snapshot_data jsonb)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    WITH latest_sync AS (

        SELECT

            sh.podcast_id,

            MAX(sh.sync_timestamp) as max_ts

        FROM

            sync_history sh

        WHERE

            sh.status = 'pending_processing'

        GROUP BY

            sh.podcast_id

    )

    SELECT

        sh.id,

        sh.podcast_id,

        sh.snapshot_data

    FROM

        sync_history sh

    JOIN

        latest_sync ls ON sh.podcast_id = ls.podcast_id AND sh.sync_timestamp = ls.max_ts

    WHERE

        sh.status = 'pending_processing';

END;

$$;


--
-- Name: get_latest_podcast_sync_records(timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_latest_podcast_sync_records(before_date timestamp with time zone) RETURNS TABLE(podcast_id uuid, views bigint, likes bigint)
    LANGUAGE plpgsql
    AS $$

BEGIN

  RETURN QUERY

  WITH ranked_syncs AS (

    SELECT

      sh.podcast_id,

      (sh.snapshot_data->>'total_views')::BIGINT as views,

      (sh.snapshot_data->>'total_likes')::BIGINT as likes,

      ROW_NUMBER() OVER(PARTITION BY sh.podcast_id ORDER BY sh.created_at DESC) as rn

    FROM public.sync_history sh

    WHERE sh.created_at <= before_date

  )

  SELECT

    rs.podcast_id,

    rs.views,

    rs.likes

  FROM ranked_syncs rs

  WHERE rs.rn = 1;

END;

$$;


--
-- Name: get_location_requests_with_profiles(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_location_requests_with_profiles() RETURNS TABLE(id uuid, location_name text, country text, state text, description text, proof_files text[], status text, submitted_by uuid, reviewed_by uuid, review_notes text, created_at timestamp with time zone, updated_at timestamp with time zone, reviewed_at timestamp with time zone, display_name text, email text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    -- Check if user is admin

    IF NOT EXISTS (

        SELECT 1 FROM public.profiles 

        WHERE user_id = auth.uid() AND role = 'admin'

    ) THEN

        RAISE EXCEPTION 'Access denied. Admin role required.';

    END IF;



    RETURN QUERY

    SELECT 

        lr.id,

        lr.location_name,

        lr.country,

        lr.state,

        lr.description,

        lr.proof_files,

        lr.status,

        lr.submitted_by,

        lr.reviewed_by,

        lr.review_notes,

        lr.created_at,

        lr.updated_at,

        lr.reviewed_at,

        p.display_name,

        p.email

    FROM public.location_requests lr

    LEFT JOIN public.profiles p ON lr.submitted_by = p.user_id

    ORDER BY lr.created_at DESC;

END;

$$;


--
-- Name: get_monthly_episode_ranking_differences(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_monthly_episode_ranking_differences() RETURNS TABLE(episode_id uuid, title text, thumbnail_url text, podcast_title text, categories text[], views_difference bigint, likes_difference bigint, comments_difference bigint)
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_month_start date := date_trunc('month', CURRENT_DATE)::date;
    previous_month_start date := current_month_start - INTERVAL '1 month';
BEGIN
    RETURN QUERY
    WITH current_month_data AS (
        SELECT 
            esh.episode_id,
            esh.views,
            esh.likes,
            esh.comments,
            ROW_NUMBER() OVER (PARTITION BY esh.episode_id ORDER BY esh.created_at DESC) as rn
        FROM episode_sync_history esh
        WHERE DATE(esh.created_at) >= current_month_start
    ),
    previous_month_data AS (
        SELECT 
            esh.episode_id,
            esh.views,
            esh.likes,
            esh.comments,
            ROW_NUMBER() OVER (PARTITION BY esh.episode_id ORDER BY esh.created_at DESC) as rn
        FROM episode_sync_history esh
        WHERE DATE(esh.created_at) >= previous_month_start 
        AND DATE(esh.created_at) < current_month_start
    )
    SELECT 
        e.id as episode_id,
        e.title,
        e.thumbnail_url,
        p.title as podcast_title,
        p.categories,
        COALESCE(cmd.views, 0) - COALESCE(pmd.views, 0) as views_difference,
        COALESCE(cmd.likes, 0) - COALESCE(pmd.likes, 0) as likes_difference,
        COALESCE(cmd.comments, 0) - COALESCE(pmd.comments, 0) as comments_difference
    FROM episodes e
    JOIN podcasts p ON e.podcast_id = p.id
    LEFT JOIN current_month_data cmd ON e.id = cmd.episode_id AND cmd.rn = 1
    LEFT JOIN previous_month_data pmd ON e.id = pmd.episode_id AND pmd.rn = 1
    WHERE p.submission_status = 'approved'
    ORDER BY views_difference DESC;
END;
$$;


--
-- Name: get_monthly_ranking_differences(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_monthly_ranking_differences() RETURNS TABLE(podcast_id uuid, title text, categories text[], cover_image_url text, views_difference bigint, likes_difference bigint, comments_difference bigint)
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_month_start date := date_trunc('month', CURRENT_DATE)::date;
    previous_month_start date := current_month_start - INTERVAL '1 month';
BEGIN
    RETURN QUERY
    WITH current_month_data AS (
        SELECT 
            sh.podcast_id,
            sh.views,
            sh.likes,
            sh.comments,
            ROW_NUMBER() OVER (PARTITION BY sh.podcast_id ORDER BY sh.created_at DESC) as rn
        FROM sync_history sh
        WHERE DATE(sh.created_at) >= current_month_start
        AND sh.status = 'completed'
    ),
    previous_month_data AS (
        SELECT 
            sh.podcast_id,
            sh.views,
            sh.likes,
            sh.comments,
            ROW_NUMBER() OVER (PARTITION BY sh.podcast_id ORDER BY sh.created_at DESC) as rn
        FROM sync_history sh
        WHERE DATE(sh.created_at) >= previous_month_start 
        AND DATE(sh.created_at) < current_month_start
        AND sh.status = 'completed'
    )
    SELECT 
        p.id as podcast_id,
        p.title,
        p.categories,
        p.cover_image_url,
        COALESCE(cmd.views, 0) - COALESCE(pmd.views, 0) as views_difference,
        COALESCE(cmd.likes, 0) - COALESCE(pmd.likes, 0) as likes_difference,
        COALESCE(cmd.comments, 0) - COALESCE(pmd.comments, 0) as comments_difference
    FROM podcasts p
    LEFT JOIN current_month_data cmd ON p.id = cmd.podcast_id AND cmd.rn = 1
    LEFT JOIN previous_month_data pmd ON p.id = pmd.podcast_id AND pmd.rn = 1
    WHERE p.submission_status = 'approved'
    ORDER BY views_difference DESC;
END;
$$;


--
-- Name: get_my_claim(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_claim(claim text) RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$

  SELECT coalesce(current_setting('request.jwt.claims', true)::jsonb ->> claim, NULL)::jsonb;

$$;


--
-- Name: get_nominations_for_target(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_nominations_for_target(target_id uuid) RETURNS TABLE(id uuid, category_name text, year integer, votes_count integer)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT

        n.id,

        nc.name AS category_name,

        n.year,

        (SELECT COUNT(*) FROM votes v WHERE v.nomination_id = n.id)::INT AS votes_count

    FROM

        nominations n

    JOIN

        nomination_categories nc ON n.category_id = nc.id

    WHERE

        (n.podcast_id = get_nominations_for_target.target_id OR n.person_id = get_nominations_for_target.target_id)

    ORDER BY

        n.year DESC, nc.name;

END;

$$;


--
-- Name: get_pending_podcasts_with_profiles(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_pending_podcasts_with_profiles() RETURNS TABLE(id uuid, title text, description text, cover_image_url text, total_episodes integer, categories text[], submission_status public.submission_status, display_name text, email text, thumbnail_url text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    RETURN QUERY

    SELECT

        p.id,

        p.title,

        p.description,

        p.cover_image_url,

        p.total_episodes,

        p.categories,

        p.submission_status,

        prof.display_name,

        prof.email,

        p.cover_image_url AS thumbnail_url

    FROM public.podcasts p

    LEFT JOIN auth.users u ON p.submitted_by = u.id

    LEFT JOIN public.profiles prof ON u.id = prof.user_id

    WHERE p.submission_status = 'pending'

    ORDER BY p.created_at ASC;

END;

$$;


--
-- Name: get_pending_submissions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_pending_submissions() RETURNS TABLE(id text, title text, display_name text, email text, type text, target_table text, target_id text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    -- Set search_path to ensure all tables are found correctly.

    SET search_path = public, auth;

    RETURN QUERY

    -- Select pending new podcasts

    SELECT

        p.id::text,

        p.title,

        pr.display_name,

        u.email,

        'new' as type,

        NULL::text as target_table,

        NULL::text as target_id

    FROM

        podcasts p

    JOIN

        profiles pr ON p.submitted_by = pr.user_id

    JOIN

        users u ON p.submitted_by = u.id

    WHERE

        p.submission_status = 'pending'

    UNION ALL

    -- Select pending contribution updates with explicit casting

    SELECT

        c.id::text,

        c.data->>'title' as title,

        pr.display_name,

        u.email,

        'update' as type,

        c.target_table::text,

        c.target_id::text

    FROM

        contributions c

    JOIN

        profiles pr ON c.user_id = pr.user_id

    JOIN

        users u ON c.user_id = u.id

    WHERE

        c.status = 'pending';

END;

$$;


--
-- Name: get_people_with_details(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_people_with_details() RETURNS jsonb
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN (

        SELECT jsonb_agg(p)

        FROM (

            SELECT

                pe.id,

                pe.full_name,

                pe.bio,

                pe.photo_urls,

                pe.social_links,

                pe.total_appearances,

                pe.slug,

                pe.is_verified,

                (

                    SELECT jsonb_agg(DISTINCT pp.role)

                    FROM podcast_people pp

                    WHERE pp.person_id = pe.id

                ) as roles,

                (

                    SELECT jsonb_agg(DISTINCT po.title)

                    FROM podcasts po

                    JOIN podcast_people pp ON po.id = pp.podcast_id

                    WHERE pp.person_id = pe.id

                ) as podcasts

            FROM people pe

        ) p

    );

END;

$$;


--
-- Name: get_person_details_by_slug(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_person_details_by_slug(p_slug text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN (

        SELECT jsonb_build_object(

            'id', p.id,

            'full_name', p.full_name,

            'also_known_as', p.also_known_as,

            'bio', p.bio,

            'photo_urls', p.photo_urls,

            'social_links', p.social_links,

            'website_url', p.website_url,

            'birth_date', p.birth_date,

            'location', p.location,

            'is_verified', p.is_verified,

            'custom_fields', p.custom_fields,

            'total_appearances', p.total_appearances,

            'average_rating', p.average_rating,

            'rating_count', p.rating_count,

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

                    WHERE r.target_id = p.id AND r.target_table = 'people'

                    ORDER BY r.created_at DESC

                ) r

            )

        )

        FROM people p

        WHERE p.slug = p_slug

    );

END;

$$;


--
-- Name: get_podcast_details_by_slug(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_podcast_details_by_slug(p_slug text) RETURNS jsonb
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

            'team_members', (

                SELECT jsonb_agg(tm)

                FROM (

                    SELECT

                        pp.role,

                        pe.id,

                        pe.full_name,

                        pe.bio,

                        pe.photo_urls,

                        pe.social_links,

                        pe.is_verified

                    FROM podcast_people pp

                    JOIN people pe ON pp.person_id = pe.id

                    WHERE pp.podcast_id = p.id

                ) tm

            ),

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

                        e.slug

                    FROM episodes e

                    WHERE e.podcast_id = p.id

                    ORDER BY e.published_at DESC

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

        WHERE p.slug = p_slug

    );

END;

$$;


--
-- Name: get_podcast_diffs_for_sync(timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_podcast_diffs_for_sync(p_sync_timestamp timestamp with time zone) RETURNS TABLE(podcast_id uuid, title text, total_views bigint, view_diff bigint, total_likes bigint, like_diff bigint, total_comments bigint, comment_diff bigint)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT

        p.id as podcast_id,

        p.title,

        p.total_views,

        (p.total_views - (p.total_views - COALESCE((sh.differences->p.id::text->>'views')::bigint, 0))) as view_diff,

        p.total_likes,

        (p.total_likes - (p.total_likes - COALESCE((sh.differences->p.id::text->>'likes')::bigint, 0))) as like_diff,

        p.total_comments,

        (p.total_comments - (p.total_comments - COALESCE((sh.differences->p.id::text->>'comments')::bigint, 0))) as comment_diff

    FROM podcasts p

    JOIN sync_history sh ON (sh.differences ? p.id::text)

    WHERE sh.sync_timestamp = p_sync_timestamp;

END;

$$;


--
-- Name: get_podcast_for_award_assignment(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_podcast_for_award_assignment() RETURNS TABLE(id uuid, title text, cover_image_url text)
    LANGUAGE sql
    AS $$

  SELECT

    p.id, -- Specifying p.id to resolve ambiguity

    p.title,

    p.cover_image_url

  FROM podcasts p

  WHERE p.submission_status = 'approved'

  AND NOT EXISTS (

    SELECT 1

    FROM assigned_awards aa

    WHERE aa.target_id = p.id

  );

$$;


--
-- Name: get_rankings_by_period(text, text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_rankings_by_period(p_start_date text, p_type text, p_category text, p_limit integer) RETURNS TABLE(id uuid, title text, categories text[], total_views bigint, total_likes bigint, cover_image_url text, total_episodes integer, podcast_title text)
    LANGUAGE plpgsql
    AS $$

BEGIN

    IF p_type = 'podcasts' THEN

        RETURN QUERY

        SELECT p.id, p.title, p.categories, p.total_views, p.total_likes, p.cover_image_url, p.total_episodes, NULL::text

        FROM podcasts p

        WHERE p.submission_status = 'approved'

          AND (p_start_date IS NULL OR p.last_episode_date >= p_start_date::date)

          AND (p_category IS NULL OR p_category = 'all' OR p_category = ANY(p.categories))

        ORDER BY p.total_views DESC NULLS LAST

        LIMIT p_limit;

    ELSE

        RETURN QUERY

        SELECT e.id, e.title, p.categories, e.views as total_views, e.likes as total_likes, e.thumbnail_url as cover_image_url, 1 as total_episodes, p.title as podcast_title

        FROM episodes e

        JOIN podcasts p ON e.podcast_id = p.id

        WHERE p.submission_status = 'approved'

          AND (p_start_date IS NULL OR e.published_at >= p_start_date::date)

          AND (p_category IS NULL OR p_category = 'all' OR p_category = ANY(p.categories))

        ORDER BY e.views DESC NULLS LAST

        LIMIT p_limit;

    END IF;

END;

$$;


--
-- Name: get_seo_job_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_seo_job_stats() RETURNS TABLE(pending bigint, completed bigint, failed bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    RETURN QUERY

    SELECT

        COUNT(*) FILTER (WHERE status = 'pending') AS pending,

        COUNT(*) FILTER (WHERE status = 'completed') AS completed,

        COUNT(*) FILTER (WHERE status = 'failed') AS failed

    FROM public.seo_jobs;

END;

$$;


--
-- Name: get_target_suggestions(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_target_suggestions(target_table_param text, search_term text DEFAULT ''::text) RETURNS TABLE(id uuid, name text, description text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    IF target_table_param = 'podcasts' THEN

        RETURN QUERY

        SELECT 

            p.id,

            p.title as name,

            p.description

        FROM public.podcasts p

        WHERE p.title ILIKE '%' || search_term || '%'

        ORDER BY p.title

        LIMIT 20;

    ELSIF target_table_param = 'episodes' THEN

        RETURN QUERY

        SELECT 

            e.id,

            e.title as name,

            e.description

        FROM public.episodes e

        WHERE e.title ILIKE '%' || search_term || '%'

        ORDER BY e.title

        LIMIT 20;

    ELSIF target_table_param = 'people' THEN

        RETURN QUERY

        SELECT 

            pe.id,

            pe.full_name as name,  -- Fixed: use full_name instead of name

            pe.bio as description

        FROM public.people pe

        WHERE pe.full_name ILIKE '%' || search_term || '%'  -- Fixed: use full_name instead of name

        ORDER BY pe.full_name  -- Fixed: use full_name instead of name

        LIMIT 20;

    END IF;

END;

$$;


--
-- Name: get_unread_notification_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_unread_notification_count(p_user_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    RETURN (

        SELECT COUNT(*)

        FROM public.notifications

        WHERE user_id = p_user_id AND is_read = false

    );

END;

$$;


--
-- Name: get_user_contribution_history(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_contribution_history(p_user_id uuid) RETURNS TABLE(id uuid, contribution_type text, target_table text, target_id uuid, target_title text, target_slug text, target_image_url text, status text, admin_notes text, submitted_at timestamp with time zone, reviewed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    RETURN QUERY

    SELECT 

        ch.id,

        ch.contribution_type,

        ch.target_table,

        ch.target_id,

        ch.target_title,

        ch.target_slug,

        ch.target_image_url,

        ch.status,

        ch.admin_notes,

        ch.submitted_at,

        ch.reviewed_at,

        ch.metadata

    FROM public.contribution_history ch

    WHERE ch.user_id = p_user_id

    ORDER BY ch.submitted_at DESC;

END;

$$;


--
-- Name: get_user_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_profile() RETURNS TABLE(id uuid, user_id uuid, email text, display_name text, role public.user_role, avatar_url text, bio text)
    LANGUAGE sql SECURITY DEFINER
    AS $$

  SELECT 

    p.id,

    p.user_id,

    p.email,

    p.display_name,

    p.role,

    p.avatar_url,

    p.bio

  FROM public.profiles p

  WHERE p.user_id = auth.uid();

$$;


--
-- Name: get_user_verification_requests(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_verification_requests(p_user_id uuid) RETURNS TABLE(request_id uuid, target_id uuid, target_table text, target_name text, status text, notes text, rejection_reason text, requested_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $$

BEGIN

    RETURN QUERY

    SELECT vr.id, vr.target_id::uuid, vr.target_table,

           CASE WHEN vr.target_table = 'podcasts' THEN p.title ELSE pe.full_name END,

           vr.status, vr.notes, vr.rejection_reason, vr.created_at

    FROM verification_requests vr

    LEFT JOIN podcasts p ON vr.target_table = 'podcasts' AND vr.target_id = p.id::text

    LEFT JOIN people pe ON vr.target_table = 'people' AND vr.target_id = pe.id::text

    WHERE vr.user_id = p_user_id

    ORDER BY vr.created_at DESC;

END;

$$;


--
-- Name: get_weekly_episode_ranking_differences(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_weekly_episode_ranking_differences() RETURNS TABLE(episode_id uuid, title text, thumbnail_url text, podcast_title text, categories text[], views_difference bigint, likes_difference bigint, comments_difference bigint)
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_sunday_date date := date_trunc('week', CURRENT_DATE + INTERVAL '1 day')::date;
    previous_sunday_date date := current_sunday_date - INTERVAL '7 days';
BEGIN
    RETURN QUERY
    WITH current_week_data AS (
        SELECT 
            esh.episode_id,
            esh.views,
            esh.likes,
            esh.comments,
            ROW_NUMBER() OVER (PARTITION BY esh.episode_id ORDER BY esh.created_at DESC) as rn
        FROM episode_sync_history esh
        WHERE DATE(esh.created_at) >= current_sunday_date
    ),
    previous_week_data AS (
        SELECT 
            esh.episode_id,
            esh.views,
            esh.likes,
            esh.comments,
            ROW_NUMBER() OVER (PARTITION BY esh.episode_id ORDER BY esh.created_at DESC) as rn
        FROM episode_sync_history esh
        WHERE DATE(esh.created_at) >= previous_sunday_date 
        AND DATE(esh.created_at) < current_sunday_date
    )
    SELECT 
        e.id as episode_id,
        e.title,
        e.thumbnail_url,
        p.title as podcast_title,
        p.categories,
        COALESCE(cwd.views, 0) - COALESCE(pwd.views, 0) as views_difference,
        COALESCE(cwd.likes, 0) - COALESCE(pwd.likes, 0) as likes_difference,
        COALESCE(cwd.comments, 0) - COALESCE(pwd.comments, 0) as comments_difference
    FROM episodes e
    JOIN podcasts p ON e.podcast_id = p.id
    LEFT JOIN current_week_data cwd ON e.id = cwd.episode_id AND cwd.rn = 1
    LEFT JOIN previous_week_data pwd ON e.id = pwd.episode_id AND pwd.rn = 1
    WHERE p.submission_status = 'approved'
    ORDER BY views_difference DESC;
END;
$$;


--
-- Name: get_weekly_ranking_differences(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_weekly_ranking_differences() RETURNS TABLE(podcast_id uuid, title text, categories text[], cover_image_url text, views_difference bigint, likes_difference bigint, comments_difference bigint)
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_sunday_date date := date_trunc('week', CURRENT_DATE + INTERVAL '1 day')::date;
    previous_sunday_date date := current_sunday_date - INTERVAL '7 days';
BEGIN
    RETURN QUERY
    WITH current_week_data AS (
        SELECT 
            sh.podcast_id,
            sh.views,
            sh.likes,
            sh.comments,
            ROW_NUMBER() OVER (PARTITION BY sh.podcast_id ORDER BY sh.created_at DESC) as rn
        FROM sync_history sh
        WHERE DATE(sh.created_at) >= current_sunday_date
        AND sh.status = 'completed'
    ),
    previous_week_data AS (
        SELECT 
            sh.podcast_id,
            sh.views,
            sh.likes,
            sh.comments,
            ROW_NUMBER() OVER (PARTITION BY sh.podcast_id ORDER BY sh.created_at DESC) as rn
        FROM sync_history sh
        WHERE DATE(sh.created_at) >= previous_sunday_date 
        AND DATE(sh.created_at) < current_sunday_date
        AND sh.status = 'completed'
    )
    SELECT 
        p.id as podcast_id,
        p.title,
        p.categories,
        p.cover_image_url,
        COALESCE(cwd.views, 0) - COALESCE(pwd.views, 0) as views_difference,
        COALESCE(cwd.likes, 0) - COALESCE(pwd.likes, 0) as likes_difference,
        COALESCE(cwd.comments, 0) - COALESCE(pwd.comments, 0) as comments_difference
    FROM podcasts p
    LEFT JOIN current_week_data cwd ON p.id = cwd.podcast_id AND cwd.rn = 1
    LEFT JOIN previous_week_data pwd ON p.id = pwd.podcast_id AND pwd.rn = 1
    WHERE p.submission_status = 'approved'
    ORDER BY views_difference DESC;
END;
$$;


--
-- Name: youtube_api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.youtube_api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    api_key text NOT NULL,
    quota_used integer DEFAULT 0,
    quota_limit integer DEFAULT 10000,
    is_active boolean DEFAULT true,
    last_used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: get_youtube_api_keys(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_youtube_api_keys() RETURNS SETOF public.youtube_api_keys
    LANGUAGE sql SECURITY DEFINER
    AS $$

  select * from public.youtube_api_keys;

$$;


--
-- Name: global_search(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.global_search(search_term text) RETURNS json
    LANGUAGE plpgsql
    AS $$

DECLARE

    podcasts_json JSON;

    episodes_json JSON;

    people_json JSON;

BEGIN

    -- Search Podcasts

    SELECT json_agg(row_to_json(p)) INTO podcasts_json

    FROM (

        SELECT id, title, cover_image_url, categories

        FROM podcasts

        WHERE title ILIKE '%' || search_term || '%'

        AND submission_status = 'approved'

        ORDER BY total_views DESC

        LIMIT 10

    ) p;



    -- Search Episodes

    SELECT json_agg(row_to_json(e)) INTO episodes_json

    FROM (

        SELECT e.id, e.title, e.thumbnail_url, p.title as podcast_title

        FROM episodes e

        JOIN podcasts p ON e.podcast_id = p.id

        WHERE e.title ILIKE '%' || search_term || '%'

        AND p.submission_status = 'approved'

        ORDER BY e.views DESC

        LIMIT 10

    ) e;



    -- Search People

    SELECT json_agg(row_to_json(pe)) INTO people_json

    FROM (

        SELECT id, full_name, photo_urls[1] as photo_url

        FROM people

        WHERE full_name ILIKE '%' || search_term || '%'

        ORDER BY total_appearances DESC

        LIMIT 10

    ) pe;



    RETURN json_build_object(

        'podcasts', podcasts_json,

        'episodes', episodes_json,

        'people', people_json

    );

END;

$$;


--
-- Name: increment_gemini_requests_used(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_gemini_requests_used(key_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$

BEGIN

    UPDATE public.gemini_api_keys

    SET 

        requests_used = requests_used + 1,

        last_used_at = NOW()

    WHERE id = key_id;

END;

$$;


--
-- Name: increment_quota_used(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_quota_used(key_id uuid, increment_by integer) RETURNS void
    LANGUAGE plpgsql
    AS $$

BEGIN

    UPDATE public.youtube_api_keys

    SET quota_used = quota_used + increment_by,

        last_used_at = NOW()

    WHERE id = key_id;

END;

$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$

  SELECT EXISTS (

    SELECT 1

    FROM public.profiles

    WHERE user_id = auth.uid() AND role = 'admin'

  );

$$;


--
-- Name: is_admin_by_user_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin_by_user_id(p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    RETURN EXISTS (

        SELECT 1

        FROM public.profiles

        WHERE profiles.user_id = p_user_id AND profiles.role = 'admin'

    );

END;

$$;


--
-- Name: mark_all_notifications_read(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_all_notifications_read(p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    UPDATE public.notifications

    SET is_read = true, read_at = now()

    WHERE user_id = p_user_id AND is_read = false;

    

    RETURN FOUND;

END;

$$;


--
-- Name: mark_notification_read(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_notification_read(p_notification_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    UPDATE public.notifications

    SET is_read = true, read_at = now()

    WHERE id = p_notification_id AND user_id = auth.uid();

    

    RETURN FOUND;

END;

$$;


--
-- Name: notify_admins_of_error(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notify_admins_of_error() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

DECLARE

    admin_record RECORD;

BEGIN

    -- Get all admin users

    FOR admin_record IN 

        SELECT user_id FROM public.profiles WHERE role = 'admin'

    LOOP

        -- Insert notification for each admin

        INSERT INTO public.error_notifications (error_log_id, admin_user_id, notification_type)

        VALUES (NEW.id, admin_record.user_id, 'new_error');

    END LOOP;

    

    RETURN NEW;

END;

$$;


--
-- Name: FUNCTION notify_admins_of_error(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.notify_admins_of_error() IS 'Automatically notifies all admins when new errors occur';


--
-- Name: post_scheduled_review(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.post_scheduled_review(review_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    review_record record;

    fake_user_record record;

    admin_user_id uuid;

BEGIN

    -- Get the scheduled review

    SELECT * INTO review_record

    FROM public.scheduled_reviews

    WHERE id = review_id AND status = 'pending';

    

    IF NOT FOUND THEN

        RETURN false;

    END IF;

    

    -- Get the fake user

    SELECT * INTO fake_user_record

    FROM public.fake_users

    WHERE id = review_record.fake_user_id;

    

    IF NOT FOUND THEN

        RETURN false;

    END IF;

    

    -- Find an admin user to use as the poster

    SELECT user_id INTO admin_user_id

    FROM public.profiles

    WHERE role = 'admin'

    LIMIT 1;

    

    -- If no admin user found, use the first available user

    IF admin_user_id IS NULL THEN

        SELECT user_id INTO admin_user_id

        FROM public.profiles

        LIMIT 1;

    END IF;

    

    IF admin_user_id IS NULL THEN

        RETURN false;

    END IF;

    

    -- Insert the review with fake user information

    INSERT INTO public.reviews (

        user_id,

        target_table,

        target_id,

        rating,

        review_title,

        review_text,

        is_spoiler,

        status,

        fake_user_name,

        fake_user_avatar,

        fake_user_email,

        is_fake_review

    ) VALUES (

        admin_user_id,

        review_record.target_table,

        review_record.target_id,

        review_record.rating,

        review_record.review_title,

        review_record.review_text,

        false,

        'approved', -- Auto-approve fake reviews

        fake_user_record.display_name,

        fake_user_record.avatar_url,

        COALESCE(fake_user_record.email, fake_user_record.display_name || '@fakeuser.com'),

        true -- Mark as fake review

    );

    

    -- Update scheduled review status

    UPDATE public.scheduled_reviews

    SET 

        status = 'posted',

        posted_at = now()

    WHERE id = review_id;

    

    RETURN true;

END;

$$;


--
-- Name: recalculate_podcast_totals(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.recalculate_podcast_totals(p_podcast_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    total_v int;

    total_l int;

    total_c int;

    total_e int;

    avg_d int;

    first_e_date timestamptz;

    last_e_date timestamptz;

BEGIN

    SELECT

        COALESCE(SUM(views), 0),

        COALESCE(SUM(likes), 0),

        COALESCE(SUM(comments), 0),

        COALESCE(COUNT(id), 0),

        COALESCE(AVG(duration), 0),

        MIN(published_at),

        MAX(published_at)

    INTO

        total_v,

        total_l,

        total_c,

        total_e,

        avg_d,

        first_e_date,

        last_e_date

    FROM

        episodes

    WHERE

        podcast_id = p_podcast_id;



    UPDATE podcasts

    SET

        total_views = total_v,

        total_likes = total_l,

        total_comments = total_c,

        total_episodes = total_e,

        average_duration = avg_d,

        first_episode_date = first_e_date,

        last_episode_date = last_e_date,

        updated_at = now()

    WHERE

        id = p_podcast_id;

END;

$$;


--
-- Name: record_ad_click(uuid, uuid, inet, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_ad_click(p_ad_id uuid, p_user_id uuid DEFAULT NULL::uuid, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_referrer text DEFAULT NULL::text, p_page_url text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$

BEGIN

    INSERT INTO ad_clicks (ad_id, user_id, ip_address, user_agent, referrer, page_url)

    VALUES (p_ad_id, p_user_id, p_ip_address, p_user_agent, p_referrer, p_page_url);

END;

$$;


--
-- Name: record_ad_impression(uuid, uuid, inet, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_ad_impression(p_ad_id uuid, p_user_id uuid DEFAULT NULL::uuid, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_page_url text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql
    AS $$

BEGIN

    INSERT INTO ad_impressions (ad_id, user_id, ip_address, user_agent, page_url)

    VALUES (p_ad_id, p_user_id, p_ip_address, p_user_agent, p_page_url);

END;

$$;


--
-- Name: reject_contribution(bigint, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reject_contribution(contribution_id bigint, p_reviewer_notes text DEFAULT NULL::text, reviewer_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    _is_admin BOOLEAN;

BEGIN

    -- Check if the reviewer_id is an admin (when called from service role)

    -- or if the current user is an admin (when called from authenticated user)

    SELECT EXISTS (

        SELECT 1

        FROM public.profiles

        WHERE user_id = COALESCE(reviewer_id, auth.uid()) AND role = 'admin'

    ) INTO _is_admin;



    IF NOT _is_admin THEN

        RAISE EXCEPTION 'Only admins can reject contributions.';

    END IF;



    -- Update the contribution status to 'rejected'

    UPDATE public.contributions

    SET

        status = 'rejected',

        reviewed_by = COALESCE(reviewer_id, auth.uid()),

        reviewed_at = NOW(),

        reviewer_notes = p_reviewer_notes

    WHERE id = contribution_id AND status = 'pending';



    IF NOT FOUND THEN

        RAISE EXCEPTION 'Pending contribution not found.';

    END IF;

END;

$$;


--
-- Name: save_gemini_api_key(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.save_gemini_api_key(p_name text, p_api_key text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

  INSERT INTO public.gemini_api_keys (name, api_key)

  VALUES (p_name, p_api_key);

END;

$$;


--
-- Name: send_email_notification(uuid, uuid, text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.send_email_notification(p_user_id uuid, p_notification_id uuid, p_email_type text, p_subject text, p_content text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    email_id uuid;

BEGIN

    INSERT INTO public.email_notifications (

        user_id, notification_id, email_type, subject, content

    ) VALUES (

        p_user_id, p_notification_id, p_email_type, p_subject, p_content

    ) RETURNING id INTO email_id;

    

    RETURN email_id;

END;

$$;


--
-- Name: update_ad_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ad_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$

BEGIN

    -- Update or insert stats for the ad

    INSERT INTO ad_stats (ad_id, impressions, clicks, ctr, revenue)

    SELECT 

        NEW.ad_id,

        COALESCE(imp_count.count, 0),

        COALESCE(click_count.count, 0),

        CASE 

            WHEN COALESCE(imp_count.count, 0) > 0 

            THEN (COALESCE(click_count.count, 0)::DECIMAL / imp_count.count::DECIMAL) * 100

            ELSE 0

        END,

        COALESCE(click_count.count, 0) * 0.01 -- Assuming $0.01 per click

    FROM 

        (SELECT COUNT(*) as count FROM ad_impressions WHERE ad_id = NEW.ad_id AND date(viewed_at) = CURRENT_DATE) imp_count,

        (SELECT COUNT(*) as count FROM ad_clicks WHERE ad_id = NEW.ad_id AND date(clicked_at) = CURRENT_DATE) click_count

    ON CONFLICT (ad_id, date) 

    DO UPDATE SET

        impressions = EXCLUDED.impressions,

        clicks = EXCLUDED.clicks,

        ctr = EXCLUDED.ctr,

        revenue = EXCLUDED.revenue,

        updated_at = NOW();

    

    RETURN NEW;

END;

$_$;


--
-- Name: update_analytics_page_performance(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_analytics_page_performance() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    INSERT INTO public.analytics_page_performance (

        page_url, page_title, date, impressions, clicks, ctr, 

        avg_time_on_page, bounce_rate, exit_rate, unique_visitors, 

        total_visits, organic_traffic, direct_traffic, referral_traffic, 

        social_traffic, paid_traffic, updated_at

    )

    VALUES (

        NEW.page_url, NEW.page_title, DATE(NEW.created_at), 1, 0, 0,

        0, 1, 0, 1, 1, 0, 0, 0, 0, 0, NOW()

    )

    ON CONFLICT (page_url, date)

    DO UPDATE SET

        impressions = analytics_page_performance.impressions + 1,

        total_visits = analytics_page_performance.total_visits + 1,

        updated_at = NOW();

    

    RETURN NEW;

END;

$$;


--
-- Name: update_analytics_page_performance(text, date, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_analytics_page_performance(p_page_url text, p_date date, p_time_on_page numeric) RETURNS void
    LANGUAGE plpgsql
    AS $$

BEGIN

    INSERT INTO public.analytics_page_performance (

        page_url, date, avg_time_on_page, total_visits

    ) VALUES (

        p_page_url, p_date, p_time_on_page, 1

    )

    ON CONFLICT (page_url, date) 

    DO UPDATE SET 

        avg_time_on_page = (analytics_page_performance.avg_time_on_page * analytics_page_performance.total_visits + p_time_on_page) / (analytics_page_performance.total_visits + 1),

        total_visits = analytics_page_performance.total_visits + 1,

        updated_at = NOW();

END;

$$;


--
-- Name: update_analytics_summary(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_analytics_summary() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    -- Update podcast analytics summary

    INSERT INTO podcast_analytics_summary (

        podcast_id, date, total_views, total_likes, total_comments, 

        total_watch_time, total_episodes, daily_views_gain, 

        daily_likes_gain, daily_comments_gain, daily_watch_time_gain,

        new_episodes_count

    )

    VALUES (

        NEW.podcast_id, NEW.date, NEW.views, NEW.likes, NEW.comments,

        NEW.total_watch_time, NEW.total_episodes, NEW.daily_views_gain,

        NEW.daily_likes_gain, NEW.daily_comments_gain, NEW.daily_watch_time_gain,

        NEW.new_episodes_count

    )

    ON CONFLICT (podcast_id, date) 

    DO UPDATE SET

        total_views = EXCLUDED.total_views,

        total_likes = EXCLUDED.total_likes,

        total_comments = EXCLUDED.total_comments,

        total_watch_time = EXCLUDED.total_watch_time,

        total_episodes = EXCLUDED.total_episodes,

        daily_views_gain = EXCLUDED.daily_views_gain,

        daily_likes_gain = EXCLUDED.daily_likes_gain,

        daily_comments_gain = EXCLUDED.daily_comments_gain,

        daily_watch_time_gain = EXCLUDED.daily_watch_time_gain,

        new_episodes_count = EXCLUDED.new_episodes_count,

        updated_at = NOW();

    

    RETURN NEW;

END;

$$;


--
-- Name: update_average_rating(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_average_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

DECLARE

    p_target_table TEXT;

    p_target_id UUID;

    avg_rating NUMERIC;

    rating_count INT;

BEGIN

    IF (TG_OP = 'DELETE') THEN

        p_target_table := OLD.target_table;

        p_target_id := OLD.target_id;

    ELSE

        p_target_table := NEW.target_table;

        p_target_id := NEW.target_id;

    END IF;



    -- Recalculate average rating and count

    SELECT AVG(rating), COUNT(*)

    INTO avg_rating, rating_count

    FROM public.reviews

    WHERE target_table = p_target_table AND target_id = p_target_id;



    -- Update the target table

    EXECUTE format('

        UPDATE public.%I

        SET average_rating = %s, rating_count = %s

        WHERE id = %L

    ', p_target_table, COALESCE(avg_rating, 0), COALESCE(rating_count, 0), p_target_id);



    IF (TG_OP = 'DELETE') THEN

        RETURN OLD;

    ELSE

        RETURN NEW;

    END IF;

END;

$$;


--
-- Name: update_contribution_history_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_contribution_history_status() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    -- Update contribution history when status changes

    PERFORM update_contribution_status(

        TG_TABLE_NAME,

        NEW.id,

        NEW.submission_status,

        NULL, -- admin_notes

        NULL  -- reviewed_by

    );



    RETURN NEW;

END;

$$;


--
-- Name: update_contribution_status(text, uuid, text, text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_contribution_status(p_target_table text, p_target_id uuid, p_status text, p_admin_notes text DEFAULT NULL::text, p_reviewed_by uuid DEFAULT NULL::uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    UPDATE public.contribution_history

    SET 

        status = p_status,

        admin_notes = p_admin_notes,

        reviewed_by = p_reviewed_by,

        reviewed_at = now(),

        updated_at = now()

    WHERE target_table = p_target_table AND target_id = p_target_id;

    

    RETURN FOUND;

END;

$$;


--
-- Name: update_email_config_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_email_config_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = timezone('utc'::text, now());

    RETURN NEW;

END;

$$;


--
-- Name: update_episode_analytics_summary(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_episode_analytics_summary() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    -- Update episode analytics summary

    INSERT INTO episode_analytics_summary (

        episode_id, podcast_id, date, views, likes, comments, 

        watch_time, daily_views_gain, daily_likes_gain, 

        daily_comments_gain, daily_watch_time_gain, is_new_episode

    )

    VALUES (

        NEW.episode_id, NEW.podcast_id, NEW.date, NEW.views, NEW.likes, NEW.comments,

        NEW.watch_time, NEW.daily_views_gain, NEW.daily_likes_gain,

        NEW.daily_comments_gain, NEW.daily_watch_time_gain, NEW.is_new_episode

    )

    ON CONFLICT (episode_id, date) 

    DO UPDATE SET

        views = EXCLUDED.views,

        likes = EXCLUDED.likes,

        comments = EXCLUDED.comments,

        watch_time = EXCLUDED.watch_time,

        daily_views_gain = EXCLUDED.daily_views_gain,

        daily_likes_gain = EXCLUDED.daily_likes_gain,

        daily_comments_gain = EXCLUDED.daily_comments_gain,

        daily_watch_time_gain = EXCLUDED.daily_watch_time_gain,

        is_new_episode = EXCLUDED.is_new_episode,

        updated_at = NOW();

    

    RETURN NEW;

END;

$$;


--
-- Name: update_error_analytics(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_error_analytics() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    -- Update or insert analytics record for the error

    INSERT INTO public.error_analytics (date, error_type, severity, error_count, unique_users, unique_sessions)

    VALUES (

        CURRENT_DATE,

        NEW.error_type,

        NEW.severity,

        1,

        CASE WHEN NEW.user_id IS NOT NULL THEN 1 ELSE 0 END,

        CASE WHEN NEW.session_id IS NOT NULL THEN 1 ELSE 0 END

    )

    ON CONFLICT (date, error_type, severity)

    DO UPDATE SET

        error_count = error_analytics.error_count + 1,

        unique_users = error_analytics.unique_users + CASE WHEN NEW.user_id IS NOT NULL AND NOT EXISTS (

            SELECT 1 FROM public.error_logs 

            WHERE error_type = NEW.error_type 

            AND severity = NEW.severity 

            AND date(created_at) = CURRENT_DATE 

            AND user_id = NEW.user_id 

            AND id != NEW.id

        ) THEN 1 ELSE 0 END,

        unique_sessions = error_analytics.unique_sessions + CASE WHEN NEW.session_id IS NOT NULL AND NOT EXISTS (

            SELECT 1 FROM public.error_logs 

            WHERE error_type = NEW.error_type 

            AND severity = NEW.severity 

            AND date(created_at) = CURRENT_DATE 

            AND session_id = NEW.session_id 

            AND id != NEW.id

        ) THEN 1 ELSE 0 END,

        updated_at = NOW();

    

    RETURN NEW;

END;

$$;


--
-- Name: FUNCTION update_error_analytics(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.update_error_analytics() IS 'Updates daily error analytics when new errors are logged';


--
-- Name: update_location_requests_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_location_requests_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = now();

    RETURN NEW;

END;

$$;


--
-- Name: update_news_articles_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_news_articles_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;

$$;


--
-- Name: update_openrouter_api_keys_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_openrouter_api_keys_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;

$$;


--
-- Name: update_pages_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_pages_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;

$$;


--
-- Name: update_preview_status(uuid, text, timestamp with time zone, timestamp with time zone, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_preview_status(preview_id uuid, new_status text, approved_at timestamp with time zone DEFAULT NULL::timestamp with time zone, rejected_at timestamp with time zone DEFAULT NULL::timestamp with time zone, rejection_reason text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

  UPDATE preview_updates

  SET 

    status = new_status,

    approved_at = COALESCE(approved_at, preview_updates.approved_at),

    rejected_at = COALESCE(rejected_at, preview_updates.rejected_at),

    rejection_reason = COALESCE(rejection_reason, preview_updates.rejection_reason),

    updated_at = NOW()

  WHERE id = preview_id;

END;

$$;


--
-- Name: update_preview_updates_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_preview_updates_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  NEW.updated_at = NOW();

  RETURN NEW;

END;

$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = now();

    RETURN NEW;

END;

$$;


--
-- Name: vote_review(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.vote_review(review_id uuid, vote_type text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    current_vote TEXT;

BEGIN

    -- Check if the user has already voted on this review

    SELECT rv.vote_type INTO current_vote

    FROM public.review_votes rv

    WHERE rv.review_id = vote_review.review_id AND rv.user_id = auth.uid();



    IF current_vote IS NULL THEN

        -- No existing vote, so insert a new one

        INSERT INTO public.review_votes (review_id, user_id, vote_type)

        VALUES (vote_review.review_id, auth.uid(), vote_review.vote_type);

    ELSIF current_vote = vote_review.vote_type THEN

        -- User is clicking the same button again, so remove the vote

        DELETE FROM public.review_votes rv

        WHERE rv.review_id = vote_review.review_id AND rv.user_id = auth.uid();

    ELSE

        -- User is changing their vote

        UPDATE public.review_votes

        SET vote_type = vote_review.vote_type

        WHERE rv.review_id = vote_review.review_id AND rv.user_id = auth.uid();

    END IF;



    -- Update the upvotes and downvotes counts on the reviews table

    UPDATE public.reviews

    SET

        upvotes = (SELECT COUNT(*) FROM public.review_votes WHERE review_id = vote_review.review_id AND vote_type = 'upvote'),

        downvotes = (SELECT COUNT(*) FROM public.review_votes WHERE review_id = vote_review.review_id AND vote_type = 'downvote')

    WHERE id = vote_review.review_id;

END;

$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_id text NOT NULL,
    client_secret_hash text NOT NULL,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: ad_clicks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_clicks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ad_id uuid NOT NULL,
    user_id uuid,
    ip_address inet,
    user_agent text,
    referrer text,
    page_url text,
    clicked_at timestamp with time zone DEFAULT now()
);


--
-- Name: ad_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    placement character varying(50) NOT NULL,
    ad_position integer DEFAULT 1 NOT NULL,
    pages text[] DEFAULT '{}'::text[],
    devices text[] DEFAULT '{desktop,mobile}'::text[],
    google_adsense_code text,
    custom_html text,
    custom_css text,
    custom_js text,
    click_url text,
    image_url text,
    alt_text text,
    width integer DEFAULT 728,
    height integer DEFAULT 90,
    max_ads_per_page integer DEFAULT 3,
    priority integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ad_configs_placement_check CHECK (((placement)::text = ANY ((ARRAY['header'::character varying, 'sidebar'::character varying, 'content'::character varying, 'footer'::character varying, 'between_content'::character varying])::text[]))),
    CONSTRAINT ad_configs_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'paused'::character varying])::text[]))),
    CONSTRAINT ad_configs_type_check CHECK (((type)::text = ANY ((ARRAY['google_adsense'::character varying, 'custom'::character varying])::text[])))
);


--
-- Name: ad_impressions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_impressions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ad_id uuid NOT NULL,
    user_id uuid,
    ip_address inet,
    user_agent text,
    page_url text,
    viewed_at timestamp with time zone DEFAULT now()
);


--
-- Name: ad_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ad_id uuid NOT NULL,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    ctr numeric(5,2) DEFAULT 0.00,
    revenue numeric(10,2) DEFAULT 0.00,
    date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: analytics_conversions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_conversions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid,
    conversion_type text NOT NULL,
    conversion_value numeric(10,2),
    page_url text,
    referrer_url text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: analytics_custom_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_custom_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid,
    event_category text NOT NULL,
    event_action text NOT NULL,
    event_label text,
    event_value integer,
    page_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid,
    event_type text NOT NULL,
    page_url text NOT NULL,
    page_title text,
    referrer_url text,
    user_agent text,
    ip_address inet,
    country_code text,
    region text,
    city text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    device_type text,
    browser text,
    browser_version text,
    os text,
    os_version text,
    screen_resolution text,
    language text,
    timezone text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT analytics_events_event_type_check CHECK ((event_type = ANY (ARRAY['page_view'::text, 'click'::text, 'search'::text, 'download'::text, 'play'::text, 'pause'::text, 'complete'::text, 'share'::text, 'form_submit'::text, 'conversion'::text])))
);


--
-- Name: analytics_keywords; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_keywords (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    keyword text NOT NULL,
    date date NOT NULL,
    search_volume integer DEFAULT 0,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    ctr numeric(5,4) DEFAULT 0,
    avg_position numeric(5,2) DEFAULT 0,
    avg_cpc numeric(8,4) DEFAULT 0,
    competition_level text,
    search_intent text,
    related_pages text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: analytics_page_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_page_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_url text NOT NULL,
    page_title text,
    date date NOT NULL,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    ctr numeric(5,4) DEFAULT 0,
    avg_time_on_page numeric(10,2) DEFAULT 0,
    bounce_rate numeric(5,4) DEFAULT 0,
    exit_rate numeric(5,4) DEFAULT 0,
    unique_visitors integer DEFAULT 0,
    total_visits integer DEFAULT 0,
    organic_traffic integer DEFAULT 0,
    direct_traffic integer DEFAULT 0,
    referral_traffic integer DEFAULT 0,
    social_traffic integer DEFAULT 0,
    paid_traffic integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: analytics_seo_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_seo_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_url text NOT NULL,
    date date NOT NULL,
    google_indexed boolean DEFAULT false,
    google_position integer,
    google_impressions integer DEFAULT 0,
    google_clicks integer DEFAULT 0,
    google_ctr numeric(5,4) DEFAULT 0,
    bing_indexed boolean DEFAULT false,
    bing_position integer,
    bing_impressions integer DEFAULT 0,
    bing_clicks integer DEFAULT 0,
    bing_ctr numeric(5,4) DEFAULT 0,
    page_speed_score integer,
    mobile_friendly boolean,
    core_web_vitals jsonb,
    seo_score integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: analytics_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_start timestamp with time zone DEFAULT now(),
    session_end timestamp with time zone,
    duration_seconds integer,
    page_views_count integer DEFAULT 0,
    clicks_count integer DEFAULT 0,
    searches_count integer DEFAULT 0,
    downloads_count integer DEFAULT 0,
    plays_count integer DEFAULT 0,
    country_code text,
    region text,
    city text,
    device_type text,
    browser text,
    os text,
    referrer_domain text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_term text,
    utm_content text,
    is_bounce boolean DEFAULT true,
    exit_page text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: analytics_traffic_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_traffic_sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_domain text NOT NULL,
    source_type text NOT NULL,
    date date NOT NULL,
    sessions integer DEFAULT 0,
    users integer DEFAULT 0,
    page_views integer DEFAULT 0,
    avg_session_duration numeric(10,2) DEFAULT 0,
    bounce_rate numeric(5,4) DEFAULT 0,
    conversion_rate numeric(5,4) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT analytics_traffic_sources_source_type_check CHECK ((source_type = ANY (ARRAY['organic'::text, 'direct'::text, 'referral'::text, 'social'::text, 'paid'::text])))
);


--
-- Name: analytics_user_demographics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_user_demographics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    age_group text NOT NULL,
    gender text,
    country_code text,
    region text,
    city text,
    sessions integer DEFAULT 0,
    users integer DEFAULT 0,
    page_views integer DEFAULT 0,
    avg_session_duration numeric(10,2) DEFAULT 0,
    bounce_rate numeric(5,4) DEFAULT 0,
    conversion_rate numeric(5,4) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: assigned_awards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assigned_awards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    award_id uuid NOT NULL,
    target_table text NOT NULL,
    target_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now()
);


--
-- Name: auto_sync_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auto_sync_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sync_session_id uuid,
    operation_type text NOT NULL,
    podcast_id uuid,
    status text NOT NULL,
    message text,
    duration_ms integer,
    retry_count integer DEFAULT 0,
    error_details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: auto_sync_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auto_sync_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enabled boolean DEFAULT false,
    schedule_type text DEFAULT 'daily'::text,
    schedule_time time without time zone DEFAULT '02:00:00'::time without time zone,
    schedule_days integer[] DEFAULT '{1,2,3,4,5,6,7}'::integer[],
    schedule_day_of_month integer DEFAULT 1,
    max_retries integer DEFAULT 3,
    retry_delay_minutes integer DEFAULT 30,
    batch_size integer DEFAULT 10,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT auto_sync_settings_schedule_type_check CHECK ((schedule_type = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text])))
);


--
-- Name: awards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.awards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    icon_svg text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    user_id uuid,
    ip_address inet,
    user_agent text,
    status text DEFAULT 'new'::text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contact_submissions_status_check CHECK ((status = ANY (ARRAY['new'::text, 'read'::text, 'replied'::text, 'closed'::text])))
);


--
-- Name: contribution_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contribution_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    contribution_type text NOT NULL,
    target_table text NOT NULL,
    target_id uuid NOT NULL,
    target_title text NOT NULL,
    target_slug text,
    target_image_url text,
    status text NOT NULL,
    admin_notes text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contribution_history_contribution_type_check CHECK ((contribution_type = ANY (ARRAY['podcast'::text, 'episode'::text, 'person'::text, 'review'::text, 'verification_request'::text, 'location_request'::text]))),
    CONSTRAINT contribution_history_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'draft'::text])))
);


--
-- Name: contributions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contributions (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    target_table public.contribution_target NOT NULL,
    target_id text NOT NULL,
    data jsonb NOT NULL,
    notes text,
    status public.contribution_status DEFAULT 'pending'::public.contribution_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    reviewer_notes text
);


--
-- Name: TABLE contributions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.contributions IS 'Stores user-submitted edits for various tables.';


--
-- Name: COLUMN contributions.data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.contributions.data IS 'JSONB object containing the proposed changes.';


--
-- Name: COLUMN contributions.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.contributions.notes IS 'Optional notes from the contributor.';


--
-- Name: COLUMN contributions.reviewer_notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.contributions.reviewer_notes IS 'Optional notes from the admin who reviewed the contribution.';


--
-- Name: contributions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.contributions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.contributions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: daily_rankings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_rankings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    podcast_id uuid,
    episode_id uuid,
    date date NOT NULL,
    views integer DEFAULT 0,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    type character varying(10) NOT NULL
);


--
-- Name: edit_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.edit_suggestions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    suggested_by uuid,
    target_table text NOT NULL,
    target_id uuid NOT NULL,
    field_name text NOT NULL,
    current_value text,
    suggested_value text NOT NULL,
    status text DEFAULT 'pending'::text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: email_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    smtp_host text NOT NULL,
    smtp_port integer NOT NULL,
    smtp_username text NOT NULL,
    smtp_password text NOT NULL,
    from_email text NOT NULL,
    from_name text DEFAULT 'PodDB Pro'::text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    profile_picture text,
    incoming_email_address text,
    incoming_email_enabled boolean DEFAULT false,
    incoming_email_subject_prefix text DEFAULT '[Contact Form]'::text
);


--
-- Name: COLUMN email_config.profile_picture; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.email_config.profile_picture IS 'URL of the profile picture/logo to display in email templates';


--
-- Name: COLUMN email_config.incoming_email_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.email_config.incoming_email_address IS 'Email address to receive contact form submissions';


--
-- Name: COLUMN email_config.incoming_email_enabled; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.email_config.incoming_email_enabled IS 'Whether incoming email notifications are enabled';


--
-- Name: COLUMN email_config.incoming_email_subject_prefix; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.email_config.incoming_email_subject_prefix IS 'Prefix to add to contact form email subjects';


--
-- Name: email_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    notification_id uuid,
    email_type text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'pending'::text,
    sent_at timestamp with time zone,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT email_notifications_email_type_check CHECK ((email_type = ANY (ARRAY['welcome'::text, 'contribution'::text, 'approval'::text, 'rejection'::text, 'system'::text, 'admin'::text, 'verification'::text, 'news'::text, 'password_reset'::text, 'account_created'::text]))),
    CONSTRAINT email_notifications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'bounced'::text])))
);


--
-- Name: episode_analytics_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_analytics_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    episode_id uuid NOT NULL,
    podcast_id uuid NOT NULL,
    date date NOT NULL,
    views integer DEFAULT 0,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    watch_time integer DEFAULT 0,
    daily_views_gain integer DEFAULT 0,
    daily_likes_gain integer DEFAULT 0,
    daily_comments_gain integer DEFAULT 0,
    daily_watch_time_gain integer DEFAULT 0,
    is_new_episode boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: episode_daily_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_daily_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    episode_id uuid NOT NULL,
    podcast_id uuid NOT NULL,
    date date NOT NULL,
    views integer DEFAULT 0,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    shares integer DEFAULT 0,
    watch_time numeric(10,2) DEFAULT 0,
    avg_watch_percentage numeric(5,2) DEFAULT 0,
    engagement_rate numeric(5,4) DEFAULT 0,
    retention_rate numeric(5,4) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    daily_views_gain integer DEFAULT 0,
    daily_likes_gain integer DEFAULT 0,
    daily_comments_gain integer DEFAULT 0,
    daily_watch_time_gain integer DEFAULT 0,
    is_new_episode boolean DEFAULT false
);


--
-- Name: episode_discovery_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_discovery_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    episode_id uuid NOT NULL,
    podcast_id uuid NOT NULL,
    discovered_at timestamp with time zone DEFAULT now(),
    youtube_video_id text,
    video_duration integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: episode_monthly_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_monthly_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    episode_id uuid NOT NULL,
    podcast_id uuid NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    month_start date NOT NULL,
    month_end date NOT NULL,
    total_views integer DEFAULT 0,
    total_likes integer DEFAULT 0,
    total_comments integer DEFAULT 0,
    total_shares integer DEFAULT 0,
    avg_daily_views integer DEFAULT 0,
    avg_daily_likes integer DEFAULT 0,
    avg_daily_comments integer DEFAULT 0,
    avg_daily_shares integer DEFAULT 0,
    peak_daily_views integer DEFAULT 0,
    total_watch_time numeric(10,2) DEFAULT 0,
    avg_watch_percentage numeric(5,2) DEFAULT 0,
    avg_engagement_rate numeric(5,4) DEFAULT 0,
    avg_retention_rate numeric(5,4) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: episode_people; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_people (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    episode_id uuid NOT NULL,
    person_id uuid NOT NULL,
    role text NOT NULL
);


--
-- Name: episode_sync_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_sync_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    episode_id uuid NOT NULL,
    sync_history_id uuid NOT NULL,
    views integer,
    likes integer,
    comments integer,
    created_at timestamp with time zone DEFAULT now(),
    this_week jsonb,
    this_month jsonb,
    sync_duration_ms integer,
    retry_count integer DEFAULT 0
);


--
-- Name: episode_weekly_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episode_weekly_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    episode_id uuid NOT NULL,
    podcast_id uuid NOT NULL,
    week_start date NOT NULL,
    week_end date NOT NULL,
    total_views integer DEFAULT 0,
    total_likes integer DEFAULT 0,
    total_comments integer DEFAULT 0,
    total_shares integer DEFAULT 0,
    avg_daily_views integer DEFAULT 0,
    avg_daily_likes integer DEFAULT 0,
    avg_daily_comments integer DEFAULT 0,
    avg_daily_shares integer DEFAULT 0,
    peak_daily_views integer DEFAULT 0,
    total_watch_time numeric(10,2) DEFAULT 0,
    avg_watch_percentage numeric(5,2) DEFAULT 0,
    avg_engagement_rate numeric(5,4) DEFAULT 0,
    avg_retention_rate numeric(5,4) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: episodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.episodes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    podcast_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    youtube_video_id text NOT NULL,
    youtube_url text NOT NULL,
    thumbnail_url text,
    duration integer NOT NULL,
    views bigint DEFAULT 0,
    likes bigint DEFAULT 0,
    comments bigint DEFAULT 0,
    published_at timestamp with time zone,
    episode_number integer,
    season_number integer,
    tags text[],
    average_rating numeric(4,2) DEFAULT 0.00,
    rating_count integer DEFAULT 0,
    seo_metadata jsonb,
    slug text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: error_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.error_analytics (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    date date NOT NULL,
    error_type text NOT NULL,
    severity text NOT NULL,
    error_count integer DEFAULT 0,
    unique_users integer DEFAULT 0,
    unique_sessions integer DEFAULT 0,
    avg_resolution_time interval,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE error_analytics; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.error_analytics IS 'Daily analytics and statistics for error tracking';


--
-- Name: error_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.error_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    error_id character varying(50) NOT NULL,
    error_type text NOT NULL,
    severity text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    stack_trace text,
    file_path text,
    line_number integer,
    function_name text,
    component_name text,
    page_url text NOT NULL,
    user_id uuid,
    session_id uuid,
    user_agent text,
    ip_address inet,
    country_code character varying(2),
    browser text,
    browser_version text,
    os text,
    device_type text,
    screen_resolution text,
    viewport_size text,
    console_logs jsonb DEFAULT '[]'::jsonb,
    network_logs jsonb DEFAULT '[]'::jsonb,
    performance_metrics jsonb DEFAULT '{}'::jsonb,
    error_context jsonb DEFAULT '{}'::jsonb,
    resolved boolean DEFAULT false,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    resolution_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT error_logs_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))
);


--
-- Name: TABLE error_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.error_logs IS 'Comprehensive error logging system for tracking all application errors';


--
-- Name: error_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.error_notifications (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    error_log_id uuid NOT NULL,
    admin_user_id uuid NOT NULL,
    notification_type text NOT NULL,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT error_notifications_notification_type_check CHECK ((notification_type = ANY (ARRAY['new_error'::text, 'error_update'::text, 'error_resolved'::text])))
);


--
-- Name: TABLE error_notifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.error_notifications IS 'Notifications for admins when new errors occur';


--
-- Name: explore_carousel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.explore_carousel (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    image_url text NOT NULL,
    redirect_link text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: fake_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fake_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    display_name text NOT NULL,
    avatar_url text,
    email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: help_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.help_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    color text,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.languages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    native_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sync_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sync_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    sync_timestamp timestamp with time zone DEFAULT now(),
    podcast_id uuid,
    status text DEFAULT 'pending_processing'::text,
    snapshot_data jsonb,
    warnings text[],
    differences jsonb,
    new_podcasts integer DEFAULT 0,
    new_episodes integer DEFAULT 0,
    new_views integer DEFAULT 0,
    new_likes integer DEFAULT 0,
    new_comments integer DEFAULT 0,
    error_message text,
    total_new_episodes integer,
    views integer,
    likes integer,
    comments integer,
    this_week jsonb,
    this_month jsonb,
    auto_sync_enabled boolean DEFAULT false,
    last_auto_sync_at timestamp with time zone,
    sync_duration_ms integer,
    retry_count integer DEFAULT 0,
    error_details jsonb
);


--
-- Name: latest_sync_history; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.latest_sync_history AS
 WITH ranked_sync_history AS (
         SELECT sh.id,
            sh.created_at,
            sh.sync_timestamp,
            sh.podcast_id,
            sh.status,
            sh.snapshot_data,
            sh.warnings,
            sh.differences,
            sh.new_podcasts,
            sh.new_episodes,
            sh.new_views,
            sh.new_likes,
            sh.new_comments,
            sh.error_message,
            sh.total_new_episodes,
            sh.views,
            sh.likes,
            sh.comments,
            sh.this_week,
            sh.this_month,
            row_number() OVER (PARTITION BY sh.podcast_id ORDER BY sh.created_at DESC) AS rn
           FROM public.sync_history sh
        )
 SELECT id,
    podcast_id,
    status,
    total_new_episodes,
    views,
    likes,
    comments,
    snapshot_data,
    this_week,
    this_month,
    created_at
   FROM ranked_sync_history
  WHERE (rn = 1);


--
-- Name: location_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.location_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    location_name text NOT NULL,
    country text NOT NULL,
    state text,
    description text,
    proof_files text[],
    status text DEFAULT 'pending'::text,
    submitted_by uuid,
    reviewed_by uuid,
    review_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    CONSTRAINT location_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    display_name text,
    role public.user_role DEFAULT 'user'::public.user_role,
    avatar_url text,
    bio text,
    social_links jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    people_id uuid
);


--
-- Name: location_requests_with_profiles; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.location_requests_with_profiles WITH (security_invoker='true') AS
 SELECT lr.id,
    lr.location_name,
    lr.country,
    lr.state,
    lr.description,
    lr.proof_files,
    lr.status,
    lr.submitted_by,
    lr.reviewed_by,
    lr.review_notes,
    lr.created_at,
    lr.updated_at,
    lr.reviewed_at,
    p.display_name,
    p.email
   FROM (public.location_requests lr
     LEFT JOIN public.profiles p ON ((lr.submitted_by = p.user_id)));


--
-- Name: news_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_articles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    featured_image_url text,
    author_id uuid,
    tags text[],
    published boolean DEFAULT false,
    published_at timestamp with time zone,
    seo_metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    meta_keywords text[],
    author_name text,
    author_bio text,
    author_photo_url text,
    meta_title text,
    meta_description text,
    schema_markup jsonb,
    custom_schema_code text,
    seo_score integer DEFAULT 0,
    reading_time integer DEFAULT 0,
    featured boolean DEFAULT false,
    category text,
    canonical_url text,
    social_title text,
    social_description text,
    social_image_url text
);


--
-- Name: nominated_podcasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nominated_podcasts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    poll_id uuid NOT NULL,
    podcast_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: nomination_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nomination_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    year integer NOT NULL
);


--
-- Name: nomination_polls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nomination_polls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    deadline timestamp with time zone NOT NULL,
    status text DEFAULT 'open'::text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: nominations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nominations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    podcast_id uuid,
    person_id uuid,
    year integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT either_podcast_or_person CHECK ((((podcast_id IS NOT NULL) AND (person_id IS NULL)) OR ((podcast_id IS NULL) AND (person_id IS NOT NULL))))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    target_table text,
    target_id uuid,
    target_url text,
    is_read boolean DEFAULT false,
    is_email_sent boolean DEFAULT false,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone,
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['contribution'::text, 'approval'::text, 'rejection'::text, 'system'::text, 'admin'::text, 'verification'::text, 'news'::text])))
);


--
-- Name: openrouter_api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.openrouter_api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    api_key text NOT NULL,
    is_active boolean DEFAULT true,
    requests_used integer DEFAULT 0,
    requests_limit integer DEFAULT 1000,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    page_type text NOT NULL,
    featured_image_url text,
    published boolean DEFAULT false,
    featured boolean DEFAULT false,
    order_index integer DEFAULT 0,
    meta_title text,
    meta_description text,
    meta_keywords text[],
    canonical_url text,
    social_title text,
    social_description text,
    social_image_url text,
    schema_markup jsonb,
    custom_schema_code text,
    seo_score integer DEFAULT 0,
    author_name text,
    author_bio text,
    author_photo_url text,
    tags text[],
    category text,
    reading_time integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    published_at timestamp with time zone,
    created_by uuid,
    help_category text,
    difficulty_level text,
    related_pages uuid[],
    faq_items jsonb,
    show_in_navigation boolean DEFAULT true,
    show_in_footer boolean DEFAULT false,
    allow_comments boolean DEFAULT false,
    require_auth boolean DEFAULT false,
    CONSTRAINT pages_difficulty_level_check CHECK ((difficulty_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))),
    CONSTRAINT pages_page_type_check CHECK ((page_type = ANY (ARRAY['about'::text, 'privacy'::text, 'terms'::text, 'help'::text, 'custom'::text])))
);


--
-- Name: people; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.people (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name text NOT NULL,
    bio text,
    photo_urls text[],
    social_links jsonb,
    website_url text,
    birth_date date,
    location text,
    is_verified boolean DEFAULT false,
    custom_fields jsonb,
    total_appearances integer DEFAULT 0,
    average_rating numeric(4,2) DEFAULT 0.00,
    rating_count integer DEFAULT 0,
    seo_metadata jsonb,
    slug text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    also_known_as text
);


--
-- Name: podcast_analytics_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcast_analytics_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    podcast_id uuid NOT NULL,
    date date NOT NULL,
    total_views integer DEFAULT 0,
    total_likes integer DEFAULT 0,
    total_comments integer DEFAULT 0,
    total_watch_time integer DEFAULT 0,
    total_episodes integer DEFAULT 0,
    daily_views_gain integer DEFAULT 0,
    daily_likes_gain integer DEFAULT 0,
    daily_comments_gain integer DEFAULT 0,
    daily_watch_time_gain integer DEFAULT 0,
    new_episodes_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: podcast_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcast_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: podcast_daily_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcast_daily_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    podcast_id uuid NOT NULL,
    date date NOT NULL,
    views integer DEFAULT 0,
    likes integer DEFAULT 0,
    comments integer DEFAULT 0,
    shares integer DEFAULT 0,
    subscribers integer DEFAULT 0,
    total_episodes integer DEFAULT 0,
    new_episodes integer DEFAULT 0,
    avg_episode_duration numeric(10,2) DEFAULT 0,
    total_watch_time numeric(12,2) DEFAULT 0,
    engagement_rate numeric(5,4) DEFAULT 0,
    growth_rate numeric(5,4) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    daily_views_gain integer DEFAULT 0,
    daily_likes_gain integer DEFAULT 0,
    daily_comments_gain integer DEFAULT 0,
    daily_watch_time_gain integer DEFAULT 0,
    new_episodes_count integer DEFAULT 0
);


--
-- Name: podcast_monthly_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcast_monthly_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    podcast_id uuid NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    month_start date NOT NULL,
    month_end date NOT NULL,
    total_views integer DEFAULT 0,
    total_likes integer DEFAULT 0,
    total_comments integer DEFAULT 0,
    total_shares integer DEFAULT 0,
    avg_daily_views integer DEFAULT 0,
    avg_daily_likes integer DEFAULT 0,
    avg_daily_comments integer DEFAULT 0,
    avg_daily_shares integer DEFAULT 0,
    peak_daily_views integer DEFAULT 0,
    peak_daily_likes integer DEFAULT 0,
    total_watch_time numeric(12,2) DEFAULT 0,
    avg_engagement_rate numeric(5,4) DEFAULT 0,
    monthly_growth_rate numeric(5,4) DEFAULT 0,
    new_episodes_count integer DEFAULT 0,
    total_episodes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: podcast_people; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcast_people (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    podcast_id uuid NOT NULL,
    person_id uuid NOT NULL,
    role text NOT NULL
);


--
-- Name: podcast_weekly_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcast_weekly_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    podcast_id uuid NOT NULL,
    week_start date NOT NULL,
    week_end date NOT NULL,
    total_views integer DEFAULT 0,
    total_likes integer DEFAULT 0,
    total_comments integer DEFAULT 0,
    total_shares integer DEFAULT 0,
    avg_daily_views integer DEFAULT 0,
    avg_daily_likes integer DEFAULT 0,
    avg_daily_comments integer DEFAULT 0,
    avg_daily_shares integer DEFAULT 0,
    peak_daily_views integer DEFAULT 0,
    peak_daily_likes integer DEFAULT 0,
    total_watch_time numeric(12,2) DEFAULT 0,
    avg_engagement_rate numeric(5,4) DEFAULT 0,
    weekly_growth_rate numeric(5,4) DEFAULT 0,
    new_episodes_count integer DEFAULT 0,
    total_episodes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: podcasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.podcasts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    cover_image_url text,
    youtube_playlist_url text,
    youtube_playlist_id text,
    language text,
    categories text[],
    tags text[],
    is_verified boolean DEFAULT false,
    platform_links jsonb,
    social_links jsonb,
    official_website text,
    team_members jsonb,
    total_episodes integer DEFAULT 0,
    total_views bigint DEFAULT 0,
    total_likes bigint DEFAULT 0,
    total_comments bigint DEFAULT 0,
    average_duration integer DEFAULT 0,
    first_episode_date timestamp with time zone,
    last_episode_date timestamp with time zone,
    submission_status public.submission_status DEFAULT 'pending'::public.submission_status,
    submitted_by uuid,
    approved_by uuid,
    rejection_reason text,
    field_status jsonb,
    average_rating numeric(4,2) DEFAULT 0.00,
    rating_count integer DEFAULT 0,
    seo_metadata jsonb,
    slug text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    additional_images text[] DEFAULT '{}'::text[],
    logo_metadata jsonb,
    additional_images_metadata jsonb,
    location text
);


--
-- Name: preview_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preview_updates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    target_table text NOT NULL,
    target_id text NOT NULL,
    original_data jsonb NOT NULL,
    updated_data jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    rejection_reason text,
    approved_by uuid,
    rejected_by uuid,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT preview_updates_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: ranking_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ranking_snapshots (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    snapshot_date date NOT NULL,
    ranking_type text NOT NULL,
    period_start date,
    period_end date,
    total_podcasts integer DEFAULT 0,
    total_episodes integer DEFAULT 0,
    ranking_data jsonb NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ranking_snapshots_ranking_type_check CHECK ((ranking_type = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text, 'overall'::text])))
);


--
-- Name: review_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vote_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT review_votes_vote_type_check CHECK ((vote_type = ANY (ARRAY['upvote'::text, 'downvote'::text])))
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    target_table text NOT NULL,
    target_id uuid NOT NULL,
    rating smallint,
    review_title text,
    review_text text,
    is_spoiler boolean DEFAULT false,
    upvotes integer DEFAULT 0,
    downvotes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    status public.review_status DEFAULT 'pending'::public.review_status,
    fake_user_name text,
    fake_user_avatar text,
    fake_user_email text,
    is_fake_review boolean DEFAULT false,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 10)))
);


--
-- Name: scheduled_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scheduled_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fake_user_id uuid,
    target_table text NOT NULL,
    target_id uuid NOT NULL,
    rating smallint NOT NULL,
    review_title text NOT NULL,
    review_text text NOT NULL,
    schedule_type text NOT NULL,
    scheduled_date timestamp with time zone,
    random_days integer,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    posted_at timestamp with time zone,
    CONSTRAINT scheduled_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 10))),
    CONSTRAINT scheduled_reviews_schedule_type_check CHECK ((schedule_type = ANY (ARRAY['immediate'::text, 'random'::text]))),
    CONSTRAINT scheduled_reviews_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'posted'::text, 'cancelled'::text]))),
    CONSTRAINT scheduled_reviews_target_table_check CHECK ((target_table = ANY (ARRAY['podcasts'::text, 'episodes'::text, 'people'::text])))
);


--
-- Name: seo_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seo_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    target_id uuid NOT NULL,
    target_table text NOT NULL,
    status text DEFAULT 'pending'::text,
    context jsonb,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT seo_jobs_target_table_valid CHECK ((target_table = ANY (ARRAY['podcasts'::text, 'episodes'::text, 'people'::text, 'news_articles'::text])))
);


--
-- Name: TABLE seo_jobs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.seo_jobs IS 'SEO generation jobs for various content types. Uses polymorphic relationship with target_table and target_id.';


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    maintenance_mode boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT settings_id_check CHECK ((id = 1))
);


--
-- Name: sync_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sync_sessions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    session_type text NOT NULL,
    status text NOT NULL,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    total_podcasts integer DEFAULT 0,
    total_episodes integer DEFAULT 0,
    processed_podcasts integer DEFAULT 0,
    processed_episodes integer DEFAULT 0,
    successful_podcasts integer DEFAULT 0,
    successful_episodes integer DEFAULT 0,
    failed_podcasts integer DEFAULT 0,
    failed_episodes integer DEFAULT 0,
    error_details jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT sync_sessions_session_type_check CHECK ((session_type = ANY (ARRAY['manual'::text, 'automatic'::text, 'scheduled'::text]))),
    CONSTRAINT sync_sessions_status_check CHECK ((status = ANY (ARRAY['running'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])))
);


--
-- Name: sync_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sync_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    weekly_sync_days integer DEFAULT 7,
    monthly_sync_days integer DEFAULT 30,
    yearly_sync_days integer DEFAULT 365,
    auto_sync_enabled boolean DEFAULT false,
    last_sync_at timestamp with time zone
);


--
-- Name: verification_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    target_table text NOT NULL,
    target_id text NOT NULL,
    notes text,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    nominated_podcast_id uuid,
    is_manual_vote boolean DEFAULT false,
    poll_id uuid
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2025_08_22; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_22 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_23; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_23 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_24; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_24 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_25; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_25 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_26; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_26 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_08_27; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_27 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: messages_2025_08_22; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_22 FOR VALUES FROM ('2025-08-22 00:00:00') TO ('2025-08-23 00:00:00');


--
-- Name: messages_2025_08_23; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_23 FOR VALUES FROM ('2025-08-23 00:00:00') TO ('2025-08-24 00:00:00');


--
-- Name: messages_2025_08_24; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_24 FOR VALUES FROM ('2025-08-24 00:00:00') TO ('2025-08-25 00:00:00');


--
-- Name: messages_2025_08_25; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_25 FOR VALUES FROM ('2025-08-25 00:00:00') TO ('2025-08-26 00:00:00');


--
-- Name: messages_2025_08_26; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_26 FOR VALUES FROM ('2025-08-26 00:00:00') TO ('2025-08-27 00:00:00');


--
-- Name: messages_2025_08_27; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_27 FOR VALUES FROM ('2025-08-27 00:00:00') TO ('2025-08-28 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_client_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ad_clicks ad_clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_clicks
    ADD CONSTRAINT ad_clicks_pkey PRIMARY KEY (id);


--
-- Name: ad_configs ad_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_configs
    ADD CONSTRAINT ad_configs_pkey PRIMARY KEY (id);


--
-- Name: ad_impressions ad_impressions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_impressions
    ADD CONSTRAINT ad_impressions_pkey PRIMARY KEY (id);


--
-- Name: ad_stats ad_stats_ad_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_stats
    ADD CONSTRAINT ad_stats_ad_id_date_key UNIQUE (ad_id, date);


--
-- Name: ad_stats ad_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_stats
    ADD CONSTRAINT ad_stats_pkey PRIMARY KEY (id);


--
-- Name: analytics_conversions analytics_conversions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_conversions
    ADD CONSTRAINT analytics_conversions_pkey PRIMARY KEY (id);


--
-- Name: analytics_custom_events analytics_custom_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_custom_events
    ADD CONSTRAINT analytics_custom_events_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: analytics_keywords analytics_keywords_keyword_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_keywords
    ADD CONSTRAINT analytics_keywords_keyword_date_key UNIQUE (keyword, date);


--
-- Name: analytics_keywords analytics_keywords_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_keywords
    ADD CONSTRAINT analytics_keywords_pkey PRIMARY KEY (id);


--
-- Name: analytics_page_performance analytics_page_performance_page_url_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_page_performance
    ADD CONSTRAINT analytics_page_performance_page_url_date_key UNIQUE (page_url, date);


--
-- Name: analytics_page_performance analytics_page_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_page_performance
    ADD CONSTRAINT analytics_page_performance_pkey PRIMARY KEY (id);


--
-- Name: analytics_seo_performance analytics_seo_performance_page_url_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_seo_performance
    ADD CONSTRAINT analytics_seo_performance_page_url_date_key UNIQUE (page_url, date);


--
-- Name: analytics_seo_performance analytics_seo_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_seo_performance
    ADD CONSTRAINT analytics_seo_performance_pkey PRIMARY KEY (id);


--
-- Name: analytics_sessions analytics_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_sessions
    ADD CONSTRAINT analytics_sessions_pkey PRIMARY KEY (id);


--
-- Name: analytics_traffic_sources analytics_traffic_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_traffic_sources
    ADD CONSTRAINT analytics_traffic_sources_pkey PRIMARY KEY (id);


--
-- Name: analytics_traffic_sources analytics_traffic_sources_source_domain_source_type_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_traffic_sources
    ADD CONSTRAINT analytics_traffic_sources_source_domain_source_type_date_key UNIQUE (source_domain, source_type, date);


--
-- Name: analytics_user_demographics analytics_user_demographics_date_age_group_gender_country_c_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_user_demographics
    ADD CONSTRAINT analytics_user_demographics_date_age_group_gender_country_c_key UNIQUE (date, age_group, gender, country_code, region, city);


--
-- Name: analytics_user_demographics analytics_user_demographics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_user_demographics
    ADD CONSTRAINT analytics_user_demographics_pkey PRIMARY KEY (id);


--
-- Name: assigned_awards assigned_awards_award_id_target_table_target_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigned_awards
    ADD CONSTRAINT assigned_awards_award_id_target_table_target_id_key UNIQUE (award_id, target_table, target_id);


--
-- Name: assigned_awards assigned_awards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigned_awards
    ADD CONSTRAINT assigned_awards_pkey PRIMARY KEY (id);


--
-- Name: auto_sync_logs auto_sync_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_sync_logs
    ADD CONSTRAINT auto_sync_logs_pkey PRIMARY KEY (id);


--
-- Name: auto_sync_settings auto_sync_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_sync_settings
    ADD CONSTRAINT auto_sync_settings_pkey PRIMARY KEY (id);


--
-- Name: awards awards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.awards
    ADD CONSTRAINT awards_pkey PRIMARY KEY (id);


--
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- Name: contribution_history contribution_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contribution_history
    ADD CONSTRAINT contribution_history_pkey PRIMARY KEY (id);


--
-- Name: contributions contributions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributions
    ADD CONSTRAINT contributions_pkey PRIMARY KEY (id);


--
-- Name: daily_rankings daily_rankings_episode_id_date_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_rankings
    ADD CONSTRAINT daily_rankings_episode_id_date_type_key UNIQUE (episode_id, date, type);


--
-- Name: daily_rankings daily_rankings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_rankings
    ADD CONSTRAINT daily_rankings_pkey PRIMARY KEY (id);


--
-- Name: daily_rankings daily_rankings_podcast_id_date_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_rankings
    ADD CONSTRAINT daily_rankings_podcast_id_date_type_key UNIQUE (podcast_id, date, type);


--
-- Name: edit_suggestions edit_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edit_suggestions
    ADD CONSTRAINT edit_suggestions_pkey PRIMARY KEY (id);


--
-- Name: email_config email_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_config
    ADD CONSTRAINT email_config_pkey PRIMARY KEY (id);


--
-- Name: email_notifications email_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_pkey PRIMARY KEY (id);


--
-- Name: episode_analytics_summary episode_analytics_summary_episode_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_analytics_summary
    ADD CONSTRAINT episode_analytics_summary_episode_id_date_key UNIQUE (episode_id, date);


--
-- Name: episode_analytics_summary episode_analytics_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_analytics_summary
    ADD CONSTRAINT episode_analytics_summary_pkey PRIMARY KEY (id);


--
-- Name: episode_daily_stats episode_daily_stats_episode_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_daily_stats
    ADD CONSTRAINT episode_daily_stats_episode_id_date_key UNIQUE (episode_id, date);


--
-- Name: episode_daily_stats episode_daily_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_daily_stats
    ADD CONSTRAINT episode_daily_stats_pkey PRIMARY KEY (id);


--
-- Name: episode_discovery_log episode_discovery_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_discovery_log
    ADD CONSTRAINT episode_discovery_log_pkey PRIMARY KEY (id);


--
-- Name: episode_monthly_stats episode_monthly_stats_episode_id_year_month_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_monthly_stats
    ADD CONSTRAINT episode_monthly_stats_episode_id_year_month_key UNIQUE (episode_id, year, month);


--
-- Name: episode_monthly_stats episode_monthly_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_monthly_stats
    ADD CONSTRAINT episode_monthly_stats_pkey PRIMARY KEY (id);


--
-- Name: episode_people episode_people_episode_id_person_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_people
    ADD CONSTRAINT episode_people_episode_id_person_id_role_key UNIQUE (episode_id, person_id, role);


--
-- Name: episode_people episode_people_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_people
    ADD CONSTRAINT episode_people_pkey PRIMARY KEY (id);


--
-- Name: episode_sync_history episode_sync_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_sync_history
    ADD CONSTRAINT episode_sync_history_pkey PRIMARY KEY (id);


--
-- Name: episode_weekly_stats episode_weekly_stats_episode_id_week_start_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_weekly_stats
    ADD CONSTRAINT episode_weekly_stats_episode_id_week_start_key UNIQUE (episode_id, week_start);


--
-- Name: episode_weekly_stats episode_weekly_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_weekly_stats
    ADD CONSTRAINT episode_weekly_stats_pkey PRIMARY KEY (id);


--
-- Name: episodes episodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episodes
    ADD CONSTRAINT episodes_pkey PRIMARY KEY (id);


--
-- Name: episodes episodes_podcast_id_youtube_video_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episodes
    ADD CONSTRAINT episodes_podcast_id_youtube_video_id_key UNIQUE (podcast_id, youtube_video_id);


--
-- Name: episodes episodes_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episodes
    ADD CONSTRAINT episodes_slug_key UNIQUE (slug);


--
-- Name: error_analytics error_analytics_date_error_type_severity_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_analytics
    ADD CONSTRAINT error_analytics_date_error_type_severity_key UNIQUE (date, error_type, severity);


--
-- Name: error_analytics error_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_analytics
    ADD CONSTRAINT error_analytics_pkey PRIMARY KEY (id);


--
-- Name: error_logs error_logs_error_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_error_id_key UNIQUE (error_id);


--
-- Name: error_logs error_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_pkey PRIMARY KEY (id);


--
-- Name: error_notifications error_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_notifications
    ADD CONSTRAINT error_notifications_pkey PRIMARY KEY (id);


--
-- Name: explore_carousel explore_carousel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.explore_carousel
    ADD CONSTRAINT explore_carousel_pkey PRIMARY KEY (id);


--
-- Name: fake_users fake_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fake_users
    ADD CONSTRAINT fake_users_pkey PRIMARY KEY (id);


--
-- Name: gemini_api_keys gemini_api_keys_api_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gemini_api_keys
    ADD CONSTRAINT gemini_api_keys_api_key_key UNIQUE (api_key);


--
-- Name: gemini_api_keys gemini_api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gemini_api_keys
    ADD CONSTRAINT gemini_api_keys_pkey PRIMARY KEY (id);


--
-- Name: help_categories help_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.help_categories
    ADD CONSTRAINT help_categories_name_key UNIQUE (name);


--
-- Name: help_categories help_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.help_categories
    ADD CONSTRAINT help_categories_pkey PRIMARY KEY (id);


--
-- Name: languages languages_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_code_key UNIQUE (code);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- Name: location_requests location_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_requests
    ADD CONSTRAINT location_requests_pkey PRIMARY KEY (id);


--
-- Name: news_articles news_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_articles
    ADD CONSTRAINT news_articles_pkey PRIMARY KEY (id);


--
-- Name: news_articles news_articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_articles
    ADD CONSTRAINT news_articles_slug_key UNIQUE (slug);


--
-- Name: nominated_podcasts nominated_podcasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominated_podcasts
    ADD CONSTRAINT nominated_podcasts_pkey PRIMARY KEY (id);


--
-- Name: nominated_podcasts nominated_podcasts_poll_id_podcast_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominated_podcasts
    ADD CONSTRAINT nominated_podcasts_poll_id_podcast_id_key UNIQUE (poll_id, podcast_id);


--
-- Name: nomination_categories nomination_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nomination_categories
    ADD CONSTRAINT nomination_categories_name_key UNIQUE (name);


--
-- Name: nomination_categories nomination_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nomination_categories
    ADD CONSTRAINT nomination_categories_pkey PRIMARY KEY (id);


--
-- Name: nomination_polls nomination_polls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nomination_polls
    ADD CONSTRAINT nomination_polls_pkey PRIMARY KEY (id);


--
-- Name: nominations nominations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominations
    ADD CONSTRAINT nominations_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: openrouter_api_keys openrouter_api_keys_api_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.openrouter_api_keys
    ADD CONSTRAINT openrouter_api_keys_api_key_key UNIQUE (api_key);


--
-- Name: openrouter_api_keys openrouter_api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.openrouter_api_keys
    ADD CONSTRAINT openrouter_api_keys_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: pages pages_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_slug_key UNIQUE (slug);


--
-- Name: people people_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_pkey PRIMARY KEY (id);


--
-- Name: people people_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_slug_key UNIQUE (slug);


--
-- Name: podcast_analytics_summary podcast_analytics_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_analytics_summary
    ADD CONSTRAINT podcast_analytics_summary_pkey PRIMARY KEY (id);


--
-- Name: podcast_analytics_summary podcast_analytics_summary_podcast_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_analytics_summary
    ADD CONSTRAINT podcast_analytics_summary_podcast_id_date_key UNIQUE (podcast_id, date);


--
-- Name: podcast_categories podcast_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_categories
    ADD CONSTRAINT podcast_categories_name_key UNIQUE (name);


--
-- Name: podcast_categories podcast_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_categories
    ADD CONSTRAINT podcast_categories_pkey PRIMARY KEY (id);


--
-- Name: podcast_daily_stats podcast_daily_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_daily_stats
    ADD CONSTRAINT podcast_daily_stats_pkey PRIMARY KEY (id);


--
-- Name: podcast_daily_stats podcast_daily_stats_podcast_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_daily_stats
    ADD CONSTRAINT podcast_daily_stats_podcast_id_date_key UNIQUE (podcast_id, date);


--
-- Name: podcast_monthly_stats podcast_monthly_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_monthly_stats
    ADD CONSTRAINT podcast_monthly_stats_pkey PRIMARY KEY (id);


--
-- Name: podcast_monthly_stats podcast_monthly_stats_podcast_id_year_month_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_monthly_stats
    ADD CONSTRAINT podcast_monthly_stats_podcast_id_year_month_key UNIQUE (podcast_id, year, month);


--
-- Name: podcast_people podcast_people_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_people
    ADD CONSTRAINT podcast_people_pkey PRIMARY KEY (id);


--
-- Name: podcast_people podcast_people_podcast_id_person_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_people
    ADD CONSTRAINT podcast_people_podcast_id_person_id_role_key UNIQUE (podcast_id, person_id, role);


--
-- Name: podcast_weekly_stats podcast_weekly_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_weekly_stats
    ADD CONSTRAINT podcast_weekly_stats_pkey PRIMARY KEY (id);


--
-- Name: podcast_weekly_stats podcast_weekly_stats_podcast_id_week_start_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_weekly_stats
    ADD CONSTRAINT podcast_weekly_stats_podcast_id_week_start_key UNIQUE (podcast_id, week_start);


--
-- Name: podcasts podcasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcasts
    ADD CONSTRAINT podcasts_pkey PRIMARY KEY (id);


--
-- Name: podcasts podcasts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcasts
    ADD CONSTRAINT podcasts_slug_key UNIQUE (slug);


--
-- Name: preview_updates preview_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preview_updates
    ADD CONSTRAINT preview_updates_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: ranking_snapshots ranking_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranking_snapshots
    ADD CONSTRAINT ranking_snapshots_pkey PRIMARY KEY (id);


--
-- Name: ranking_snapshots ranking_snapshots_snapshot_date_ranking_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranking_snapshots
    ADD CONSTRAINT ranking_snapshots_snapshot_date_ranking_type_key UNIQUE (snapshot_date, ranking_type);


--
-- Name: review_votes review_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_votes
    ADD CONSTRAINT review_votes_pkey PRIMARY KEY (id);


--
-- Name: review_votes review_votes_review_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_votes
    ADD CONSTRAINT review_votes_review_id_user_id_key UNIQUE (review_id, user_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: scheduled_reviews scheduled_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_reviews
    ADD CONSTRAINT scheduled_reviews_pkey PRIMARY KEY (id);


--
-- Name: seo_jobs seo_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seo_jobs
    ADD CONSTRAINT seo_jobs_pkey PRIMARY KEY (id);


--
-- Name: seo_jobs seo_jobs_target_table_target_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seo_jobs
    ADD CONSTRAINT seo_jobs_target_table_target_id_key UNIQUE (target_table, target_id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: sync_history sync_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_history
    ADD CONSTRAINT sync_history_pkey PRIMARY KEY (id);


--
-- Name: sync_sessions sync_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_sessions
    ADD CONSTRAINT sync_sessions_pkey PRIMARY KEY (id);


--
-- Name: sync_settings sync_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_settings
    ADD CONSTRAINT sync_settings_pkey PRIMARY KEY (id);


--
-- Name: nominations unique_nomination; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominations
    ADD CONSTRAINT unique_nomination UNIQUE (category_id, podcast_id, person_id, year);


--
-- Name: verification_requests verification_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_pkey PRIMARY KEY (id);


--
-- Name: verification_requests verification_requests_target_table_target_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_target_table_target_id_key UNIQUE (target_table, target_id);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: youtube_api_keys youtube_api_keys_api_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.youtube_api_keys
    ADD CONSTRAINT youtube_api_keys_api_key_key UNIQUE (api_key);


--
-- Name: youtube_api_keys youtube_api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.youtube_api_keys
    ADD CONSTRAINT youtube_api_keys_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_22 messages_2025_08_22_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_22
    ADD CONSTRAINT messages_2025_08_22_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_23 messages_2025_08_23_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_23
    ADD CONSTRAINT messages_2025_08_23_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_24 messages_2025_08_24_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_24
    ADD CONSTRAINT messages_2025_08_24_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_25 messages_2025_08_25_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_25
    ADD CONSTRAINT messages_2025_08_25_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_26 messages_2025_08_26_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_26
    ADD CONSTRAINT messages_2025_08_26_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_08_27 messages_2025_08_27_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_27
    ADD CONSTRAINT messages_2025_08_27_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_clients_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_client_id_idx ON auth.oauth_clients USING btree (client_id);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_ad_clicks_ad_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_clicks_ad_id ON public.ad_clicks USING btree (ad_id);


--
-- Name: idx_ad_clicks_clicked_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_clicks_clicked_at ON public.ad_clicks USING btree (clicked_at);


--
-- Name: idx_ad_configs_devices; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_configs_devices ON public.ad_configs USING gin (devices);


--
-- Name: idx_ad_configs_pages; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_configs_pages ON public.ad_configs USING gin (pages);


--
-- Name: idx_ad_configs_placement; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_configs_placement ON public.ad_configs USING btree (placement);


--
-- Name: idx_ad_configs_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_configs_priority ON public.ad_configs USING btree (priority);


--
-- Name: idx_ad_configs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_configs_status ON public.ad_configs USING btree (status);


--
-- Name: idx_ad_impressions_ad_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_impressions_ad_id ON public.ad_impressions USING btree (ad_id);


--
-- Name: idx_ad_impressions_viewed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_impressions_viewed_at ON public.ad_impressions USING btree (viewed_at);


--
-- Name: idx_ad_stats_ad_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_stats_ad_id ON public.ad_stats USING btree (ad_id);


--
-- Name: idx_ad_stats_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_stats_date ON public.ad_stats USING btree (date);


--
-- Name: idx_analytics_conversions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_conversions_created_at ON public.analytics_conversions USING btree (created_at);


--
-- Name: idx_analytics_conversions_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_conversions_session_id ON public.analytics_conversions USING btree (session_id);


--
-- Name: idx_analytics_conversions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_conversions_type ON public.analytics_conversions USING btree (conversion_type);


--
-- Name: idx_analytics_custom_events_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_custom_events_category ON public.analytics_custom_events USING btree (event_category);


--
-- Name: idx_analytics_custom_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_custom_events_created_at ON public.analytics_custom_events USING btree (created_at);


--
-- Name: idx_analytics_custom_events_session_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_custom_events_session_category ON public.analytics_custom_events USING btree (session_id, event_category, event_action);


--
-- Name: idx_analytics_custom_events_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_custom_events_session_id ON public.analytics_custom_events USING btree (session_id);


--
-- Name: idx_analytics_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_created_at ON public.analytics_events USING btree (created_at);


--
-- Name: idx_analytics_events_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_event_type ON public.analytics_events USING btree (event_type);


--
-- Name: idx_analytics_events_page_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_page_url ON public.analytics_events USING btree (page_url);


--
-- Name: idx_analytics_events_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_session_id ON public.analytics_events USING btree (session_id);


--
-- Name: idx_analytics_events_session_type_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_events_session_type_url ON public.analytics_events USING btree (session_id, event_type, page_url);


--
-- Name: idx_analytics_keywords_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_keywords_date ON public.analytics_keywords USING btree (date);


--
-- Name: idx_analytics_keywords_keyword; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_keywords_keyword ON public.analytics_keywords USING btree (keyword);


--
-- Name: idx_analytics_page_performance_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_page_performance_date ON public.analytics_page_performance USING btree (date);


--
-- Name: idx_analytics_page_performance_page_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_page_performance_page_url ON public.analytics_page_performance USING btree (page_url);


--
-- Name: idx_analytics_seo_performance_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_seo_performance_date ON public.analytics_seo_performance USING btree (date);


--
-- Name: idx_analytics_seo_performance_page_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_seo_performance_page_url ON public.analytics_seo_performance USING btree (page_url);


--
-- Name: idx_analytics_sessions_country_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_sessions_country_code ON public.analytics_sessions USING btree (country_code);


--
-- Name: idx_analytics_sessions_session_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_sessions_session_start ON public.analytics_sessions USING btree (session_start);


--
-- Name: idx_analytics_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_sessions_user_id ON public.analytics_sessions USING btree (user_id);


--
-- Name: idx_analytics_traffic_sources_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_traffic_sources_date ON public.analytics_traffic_sources USING btree (date);


--
-- Name: idx_analytics_traffic_sources_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_traffic_sources_source ON public.analytics_traffic_sources USING btree (source_domain);


--
-- Name: idx_analytics_user_demographics_country; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_user_demographics_country ON public.analytics_user_demographics USING btree (country_code);


--
-- Name: idx_analytics_user_demographics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analytics_user_demographics_date ON public.analytics_user_demographics USING btree (date);


--
-- Name: idx_auto_sync_logs_podcast_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auto_sync_logs_podcast_created ON public.auto_sync_logs USING btree (podcast_id, created_at DESC);


--
-- Name: idx_auto_sync_logs_session_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auto_sync_logs_session_created ON public.auto_sync_logs USING btree (sync_session_id, created_at DESC);


--
-- Name: idx_contact_submissions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions USING btree (created_at);


--
-- Name: idx_contact_submissions_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_submissions_email ON public.contact_submissions USING btree (email);


--
-- Name: idx_contact_submissions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_submissions_status ON public.contact_submissions USING btree (status);


--
-- Name: idx_contribution_history_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contribution_history_status ON public.contribution_history USING btree (status);


--
-- Name: idx_contribution_history_submitted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contribution_history_submitted_at ON public.contribution_history USING btree (submitted_at);


--
-- Name: idx_contribution_history_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contribution_history_target ON public.contribution_history USING btree (target_table, target_id);


--
-- Name: idx_contribution_history_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contribution_history_type ON public.contribution_history USING btree (contribution_type);


--
-- Name: idx_contribution_history_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contribution_history_user_id ON public.contribution_history USING btree (user_id);


--
-- Name: idx_contributions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contributions_status ON public.contributions USING btree (status);


--
-- Name: idx_contributions_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contributions_target ON public.contributions USING btree (target_table, target_id);


--
-- Name: idx_contributions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contributions_user_id ON public.contributions USING btree (user_id);


--
-- Name: idx_daily_rankings_date_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_rankings_date_type ON public.daily_rankings USING btree (date, type);


--
-- Name: idx_edit_suggestions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_edit_suggestions_status ON public.edit_suggestions USING btree (status);


--
-- Name: idx_email_notifications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_notifications_status ON public.email_notifications USING btree (status);


--
-- Name: idx_email_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_notifications_user_id ON public.email_notifications USING btree (user_id);


--
-- Name: idx_episode_analytics_summary_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_analytics_summary_date ON public.episode_analytics_summary USING btree (date);


--
-- Name: idx_episode_analytics_summary_episode_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_analytics_summary_episode_id ON public.episode_analytics_summary USING btree (episode_id);


--
-- Name: idx_episode_analytics_summary_podcast_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_analytics_summary_podcast_id ON public.episode_analytics_summary USING btree (podcast_id);


--
-- Name: idx_episode_daily_stats_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_daily_stats_date ON public.episode_daily_stats USING btree (date DESC);


--
-- Name: idx_episode_daily_stats_episode_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_daily_stats_episode_date ON public.episode_daily_stats USING btree (episode_id, date DESC);


--
-- Name: idx_episode_daily_stats_podcast_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_daily_stats_podcast_date ON public.episode_daily_stats USING btree (podcast_id, date DESC);


--
-- Name: idx_episode_discovery_log_discovered_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_discovery_log_discovered_at ON public.episode_discovery_log USING btree (discovered_at);


--
-- Name: idx_episode_discovery_log_podcast_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_discovery_log_podcast_id ON public.episode_discovery_log USING btree (podcast_id);


--
-- Name: idx_episode_monthly_stats_episode_year_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_monthly_stats_episode_year_month ON public.episode_monthly_stats USING btree (episode_id, year DESC, month DESC);


--
-- Name: idx_episode_monthly_stats_podcast_year_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_monthly_stats_podcast_year_month ON public.episode_monthly_stats USING btree (podcast_id, year DESC, month DESC);


--
-- Name: idx_episode_sync_history_episode_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_sync_history_episode_created ON public.episode_sync_history USING btree (episode_id, created_at DESC);


--
-- Name: idx_episode_weekly_stats_episode_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_weekly_stats_episode_week ON public.episode_weekly_stats USING btree (episode_id, week_start DESC);


--
-- Name: idx_episode_weekly_stats_podcast_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episode_weekly_stats_podcast_week ON public.episode_weekly_stats USING btree (podcast_id, week_start DESC);


--
-- Name: idx_episodes_podcast; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episodes_podcast ON public.episodes USING btree (podcast_id);


--
-- Name: idx_episodes_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episodes_slug ON public.episodes USING btree (slug);


--
-- Name: idx_episodes_youtube; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_episodes_youtube ON public.episodes USING btree (youtube_video_id);


--
-- Name: idx_error_analytics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_analytics_date ON public.error_analytics USING btree (date DESC);


--
-- Name: idx_error_analytics_error_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_analytics_error_type ON public.error_analytics USING btree (error_type);


--
-- Name: idx_error_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_logs_created_at ON public.error_logs USING btree (created_at DESC);


--
-- Name: idx_error_logs_error_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_logs_error_id ON public.error_logs USING btree (error_id);


--
-- Name: idx_error_logs_error_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_logs_error_type ON public.error_logs USING btree (error_type);


--
-- Name: idx_error_logs_page_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_logs_page_url ON public.error_logs USING btree (page_url);


--
-- Name: idx_error_logs_resolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_logs_resolved ON public.error_logs USING btree (resolved);


--
-- Name: idx_error_logs_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_logs_session_id ON public.error_logs USING btree (session_id);


--
-- Name: idx_error_logs_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_logs_severity ON public.error_logs USING btree (severity);


--
-- Name: idx_error_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_logs_user_id ON public.error_logs USING btree (user_id);


--
-- Name: idx_error_notifications_admin_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_notifications_admin_user_id ON public.error_notifications USING btree (admin_user_id);


--
-- Name: idx_error_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_notifications_created_at ON public.error_notifications USING btree (created_at DESC);


--
-- Name: idx_error_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_error_notifications_is_read ON public.error_notifications USING btree (is_read);


--
-- Name: idx_languages_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_languages_code ON public.languages USING btree (code);


--
-- Name: idx_languages_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_languages_name ON public.languages USING gin (to_tsvector('english'::regconfig, name));


--
-- Name: idx_languages_native_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_languages_native_name ON public.languages USING gin (to_tsvector('english'::regconfig, native_name));


--
-- Name: idx_location_requests_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_requests_created_at ON public.location_requests USING btree (created_at);


--
-- Name: idx_location_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_location_requests_status ON public.location_requests USING btree (status);


--
-- Name: idx_news_articles_author; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_articles_author ON public.news_articles USING btree (author_name);


--
-- Name: idx_news_articles_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_articles_category ON public.news_articles USING btree (category);


--
-- Name: idx_news_articles_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_articles_featured ON public.news_articles USING btree (featured);


--
-- Name: idx_news_articles_meta_keywords; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_articles_meta_keywords ON public.news_articles USING gin (meta_keywords);


--
-- Name: idx_news_articles_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_articles_slug ON public.news_articles USING btree (slug);


--
-- Name: idx_news_articles_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_news_articles_tags ON public.news_articles USING gin (tags);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_openrouter_api_keys_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_openrouter_api_keys_created_at ON public.openrouter_api_keys USING btree (created_at);


--
-- Name: idx_openrouter_api_keys_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_openrouter_api_keys_is_active ON public.openrouter_api_keys USING btree (is_active);


--
-- Name: idx_pages_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_featured ON public.pages USING btree (featured);


--
-- Name: idx_pages_help_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_help_category ON public.pages USING btree (help_category);


--
-- Name: idx_pages_meta_keywords; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_meta_keywords ON public.pages USING gin (meta_keywords);


--
-- Name: idx_pages_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_order ON public.pages USING btree (order_index);


--
-- Name: idx_pages_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_published ON public.pages USING btree (published);


--
-- Name: idx_pages_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_slug ON public.pages USING btree (slug);


--
-- Name: idx_pages_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_tags ON public.pages USING gin (tags);


--
-- Name: idx_pages_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_type ON public.pages USING btree (page_type);


--
-- Name: idx_people_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_people_name ON public.people USING btree (full_name);


--
-- Name: idx_people_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_people_slug ON public.people USING btree (slug);


--
-- Name: idx_podcast_analytics_summary_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcast_analytics_summary_date ON public.podcast_analytics_summary USING btree (date);


--
-- Name: idx_podcast_analytics_summary_podcast_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcast_analytics_summary_podcast_id ON public.podcast_analytics_summary USING btree (podcast_id);


--
-- Name: idx_podcast_categories_description; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcast_categories_description ON public.podcast_categories USING gin (to_tsvector('english'::regconfig, description));


--
-- Name: idx_podcast_categories_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcast_categories_name ON public.podcast_categories USING gin (to_tsvector('english'::regconfig, name));


--
-- Name: idx_podcast_daily_stats_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcast_daily_stats_date ON public.podcast_daily_stats USING btree (date DESC);


--
-- Name: idx_podcast_daily_stats_podcast_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcast_daily_stats_podcast_date ON public.podcast_daily_stats USING btree (podcast_id, date DESC);


--
-- Name: idx_podcast_monthly_stats_podcast_year_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcast_monthly_stats_podcast_year_month ON public.podcast_monthly_stats USING btree (podcast_id, year DESC, month DESC);


--
-- Name: idx_podcast_monthly_stats_year_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcast_monthly_stats_year_month ON public.podcast_monthly_stats USING btree (year DESC, month DESC);


--
-- Name: idx_podcast_weekly_stats_podcast_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcast_weekly_stats_podcast_week ON public.podcast_weekly_stats USING btree (podcast_id, week_start DESC);


--
-- Name: idx_podcast_weekly_stats_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcast_weekly_stats_week ON public.podcast_weekly_stats USING btree (week_start DESC);


--
-- Name: idx_podcasts_categories; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcasts_categories ON public.podcasts USING gin (categories);


--
-- Name: idx_podcasts_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcasts_slug ON public.podcasts USING btree (slug);


--
-- Name: idx_podcasts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_podcasts_status ON public.podcasts USING btree (submission_status);


--
-- Name: idx_preview_updates_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_preview_updates_created_at ON public.preview_updates USING btree (created_at);


--
-- Name: idx_preview_updates_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_preview_updates_status ON public.preview_updates USING btree (status);


--
-- Name: idx_preview_updates_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_preview_updates_target ON public.preview_updates USING btree (target_table, target_id);


--
-- Name: idx_preview_updates_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_preview_updates_user_id ON public.preview_updates USING btree (user_id);


--
-- Name: idx_profiles_people_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_people_id ON public.profiles USING btree (people_id);


--
-- Name: idx_ranking_snapshots_date_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ranking_snapshots_date_type ON public.ranking_snapshots USING btree (snapshot_date DESC, ranking_type);


--
-- Name: idx_reviews_is_fake; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_is_fake ON public.reviews USING btree (is_fake_review);


--
-- Name: idx_reviews_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_target ON public.reviews USING btree (target_table, target_id);


--
-- Name: idx_scheduled_reviews_scheduled_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_reviews_scheduled_date ON public.scheduled_reviews USING btree (scheduled_date);


--
-- Name: idx_scheduled_reviews_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_reviews_status ON public.scheduled_reviews USING btree (status);


--
-- Name: idx_scheduled_reviews_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_reviews_target ON public.scheduled_reviews USING btree (target_table, target_id);


--
-- Name: idx_seo_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seo_jobs_status ON public.seo_jobs USING btree (status);


--
-- Name: idx_seo_jobs_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seo_jobs_status_created ON public.seo_jobs USING btree (status, created_at DESC);


--
-- Name: idx_seo_jobs_target_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seo_jobs_target_lookup ON public.seo_jobs USING btree (target_table, target_id);


--
-- Name: idx_sync_history_podcast_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sync_history_podcast_created ON public.sync_history USING btree (podcast_id, created_at DESC);


--
-- Name: idx_sync_history_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sync_history_status_created ON public.sync_history USING btree (status, created_at DESC);


--
-- Name: idx_sync_sessions_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sync_sessions_status_created ON public.sync_sessions USING btree (status, created_at DESC);


--
-- Name: idx_verification_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_verification_requests_status ON public.verification_requests USING btree (status);


--
-- Name: idx_youtube_api_keys_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_youtube_api_keys_active ON public.youtube_api_keys USING btree (is_active);


--
-- Name: reviews_real_user_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX reviews_real_user_unique_idx ON public.reviews USING btree (user_id, target_table, target_id) WHERE (is_fake_review IS NOT TRUE);


--
-- Name: votes_nominated_podcast_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX votes_nominated_podcast_id_idx ON public.votes USING btree (nominated_podcast_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: messages_2025_08_22_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_22_pkey;


--
-- Name: messages_2025_08_23_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_23_pkey;


--
-- Name: messages_2025_08_24_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_24_pkey;


--
-- Name: messages_2025_08_25_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_25_pkey;


--
-- Name: messages_2025_08_26_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_26_pkey;


--
-- Name: messages_2025_08_27_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_27_pkey;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();


--
-- Name: reviews on_review_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_review_change AFTER INSERT OR DELETE OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_average_rating();


--
-- Name: podcasts podcast_status_notification_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER podcast_status_notification_trigger AFTER UPDATE OF submission_status ON public.podcasts FOR EACH ROW EXECUTE FUNCTION public.create_contribution_notification();


--
-- Name: episode_daily_stats trigger_calculate_episode_daily_gains; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_calculate_episode_daily_gains BEFORE INSERT OR UPDATE ON public.episode_daily_stats FOR EACH ROW EXECUTE FUNCTION public.calculate_daily_gains();


--
-- Name: podcast_daily_stats trigger_calculate_podcast_daily_gains; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_calculate_podcast_daily_gains BEFORE INSERT OR UPDATE ON public.podcast_daily_stats FOR EACH ROW EXECUTE FUNCTION public.calculate_daily_gains();


--
-- Name: error_logs trigger_notify_admins_error; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_notify_admins_error AFTER INSERT ON public.error_logs FOR EACH ROW EXECUTE FUNCTION public.notify_admins_of_error();


--
-- Name: ad_clicks trigger_update_ad_stats_on_click; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_ad_stats_on_click AFTER INSERT ON public.ad_clicks FOR EACH ROW EXECUTE FUNCTION public.update_ad_stats();


--
-- Name: ad_impressions trigger_update_ad_stats_on_impression; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_ad_stats_on_impression AFTER INSERT ON public.ad_impressions FOR EACH ROW EXECUTE FUNCTION public.update_ad_stats();


--
-- Name: episode_daily_stats trigger_update_episode_analytics_summary; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_episode_analytics_summary AFTER INSERT OR UPDATE ON public.episode_daily_stats FOR EACH ROW EXECUTE FUNCTION public.update_episode_analytics_summary();


--
-- Name: error_logs trigger_update_error_analytics; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_error_analytics AFTER INSERT ON public.error_logs FOR EACH ROW EXECUTE FUNCTION public.update_error_analytics();


--
-- Name: openrouter_api_keys trigger_update_openrouter_api_keys_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_openrouter_api_keys_updated_at BEFORE UPDATE ON public.openrouter_api_keys FOR EACH ROW EXECUTE FUNCTION public.update_openrouter_api_keys_updated_at();


--
-- Name: analytics_events trigger_update_page_performance; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_page_performance AFTER INSERT ON public.analytics_events FOR EACH ROW WHEN ((new.event_type = 'page_view'::text)) EXECUTE FUNCTION public.update_analytics_page_performance();


--
-- Name: podcast_daily_stats trigger_update_podcast_analytics_summary; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_podcast_analytics_summary AFTER INSERT OR UPDATE ON public.podcast_daily_stats FOR EACH ROW EXECUTE FUNCTION public.update_analytics_summary();


--
-- Name: contact_submissions update_contact_submissions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: contribution_history update_contribution_history_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contribution_history_updated_at BEFORE UPDATE ON public.contribution_history FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: email_config update_email_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_email_config_updated_at BEFORE UPDATE ON public.email_config FOR EACH ROW EXECUTE FUNCTION public.update_email_config_updated_at();


--
-- Name: episodes update_episodes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON public.episodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: location_requests update_location_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_location_requests_updated_at BEFORE UPDATE ON public.location_requests FOR EACH ROW EXECUTE FUNCTION public.update_location_requests_updated_at();


--
-- Name: news_articles update_news_articles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION public.update_news_articles_updated_at();


--
-- Name: pages update_pages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_pages_updated_at();


--
-- Name: people update_people_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: podcasts update_podcast_contribution_history; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_podcast_contribution_history AFTER UPDATE OF submission_status ON public.podcasts FOR EACH ROW EXECUTE FUNCTION public.update_contribution_history_status();


--
-- Name: podcasts update_podcasts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_podcasts_updated_at BEFORE UPDATE ON public.podcasts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: preview_updates update_preview_updates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_preview_updates_updated_at BEFORE UPDATE ON public.preview_updates FOR EACH ROW EXECUTE FUNCTION public.update_preview_updates_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: verification_requests verification_status_notification_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER verification_status_notification_trigger AFTER UPDATE OF status ON public.verification_requests FOR EACH ROW EXECUTE FUNCTION public.create_verification_notification();


--
-- Name: profiles welcome_notification_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER welcome_notification_trigger AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_welcome_notification();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: ad_clicks ad_clicks_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_clicks
    ADD CONSTRAINT ad_clicks_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ad_configs(id) ON DELETE CASCADE;


--
-- Name: ad_clicks ad_clicks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_clicks
    ADD CONSTRAINT ad_clicks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: ad_impressions ad_impressions_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_impressions
    ADD CONSTRAINT ad_impressions_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ad_configs(id) ON DELETE CASCADE;


--
-- Name: ad_impressions ad_impressions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_impressions
    ADD CONSTRAINT ad_impressions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: ad_stats ad_stats_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_stats
    ADD CONSTRAINT ad_stats_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ad_configs(id) ON DELETE CASCADE;


--
-- Name: analytics_conversions analytics_conversions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_conversions
    ADD CONSTRAINT analytics_conversions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.analytics_sessions(id) ON DELETE CASCADE;


--
-- Name: analytics_conversions analytics_conversions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_conversions
    ADD CONSTRAINT analytics_conversions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: analytics_custom_events analytics_custom_events_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_custom_events
    ADD CONSTRAINT analytics_custom_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.analytics_sessions(id) ON DELETE CASCADE;


--
-- Name: analytics_custom_events analytics_custom_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_custom_events
    ADD CONSTRAINT analytics_custom_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: analytics_events analytics_events_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.analytics_sessions(id) ON DELETE CASCADE;


--
-- Name: analytics_events analytics_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: analytics_sessions analytics_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_sessions
    ADD CONSTRAINT analytics_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: assigned_awards assigned_awards_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigned_awards
    ADD CONSTRAINT assigned_awards_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: assigned_awards assigned_awards_award_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigned_awards
    ADD CONSTRAINT assigned_awards_award_id_fkey FOREIGN KEY (award_id) REFERENCES public.awards(id) ON DELETE CASCADE;


--
-- Name: auto_sync_logs auto_sync_logs_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_sync_logs
    ADD CONSTRAINT auto_sync_logs_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: contact_submissions contact_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: contribution_history contribution_history_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contribution_history
    ADD CONSTRAINT contribution_history_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: contribution_history contribution_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contribution_history
    ADD CONSTRAINT contribution_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: contributions contributions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributions
    ADD CONSTRAINT contributions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: contributions contributions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributions
    ADD CONSTRAINT contributions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: daily_rankings daily_rankings_episode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_rankings
    ADD CONSTRAINT daily_rankings_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;


--
-- Name: daily_rankings daily_rankings_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_rankings
    ADD CONSTRAINT daily_rankings_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: edit_suggestions edit_suggestions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edit_suggestions
    ADD CONSTRAINT edit_suggestions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;


--
-- Name: edit_suggestions edit_suggestions_suggested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.edit_suggestions
    ADD CONSTRAINT edit_suggestions_suggested_by_fkey FOREIGN KEY (suggested_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;


--
-- Name: email_notifications email_notifications_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;


--
-- Name: email_notifications email_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: episode_analytics_summary episode_analytics_summary_episode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_analytics_summary
    ADD CONSTRAINT episode_analytics_summary_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;


--
-- Name: episode_analytics_summary episode_analytics_summary_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_analytics_summary
    ADD CONSTRAINT episode_analytics_summary_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: episode_daily_stats episode_daily_stats_episode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_daily_stats
    ADD CONSTRAINT episode_daily_stats_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;


--
-- Name: episode_daily_stats episode_daily_stats_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_daily_stats
    ADD CONSTRAINT episode_daily_stats_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: episode_discovery_log episode_discovery_log_episode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_discovery_log
    ADD CONSTRAINT episode_discovery_log_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;


--
-- Name: episode_discovery_log episode_discovery_log_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_discovery_log
    ADD CONSTRAINT episode_discovery_log_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: episode_monthly_stats episode_monthly_stats_episode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_monthly_stats
    ADD CONSTRAINT episode_monthly_stats_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;


--
-- Name: episode_monthly_stats episode_monthly_stats_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_monthly_stats
    ADD CONSTRAINT episode_monthly_stats_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: episode_people episode_people_episode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_people
    ADD CONSTRAINT episode_people_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;


--
-- Name: episode_people episode_people_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_people
    ADD CONSTRAINT episode_people_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: episode_sync_history episode_sync_history_episode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_sync_history
    ADD CONSTRAINT episode_sync_history_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;


--
-- Name: episode_sync_history episode_sync_history_sync_history_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_sync_history
    ADD CONSTRAINT episode_sync_history_sync_history_id_fkey FOREIGN KEY (sync_history_id) REFERENCES public.sync_history(id) ON DELETE CASCADE;


--
-- Name: episode_weekly_stats episode_weekly_stats_episode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_weekly_stats
    ADD CONSTRAINT episode_weekly_stats_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id) ON DELETE CASCADE;


--
-- Name: episode_weekly_stats episode_weekly_stats_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episode_weekly_stats
    ADD CONSTRAINT episode_weekly_stats_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: episodes episodes_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.episodes
    ADD CONSTRAINT episodes_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: error_logs error_logs_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: error_logs error_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: error_notifications error_notifications_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_notifications
    ADD CONSTRAINT error_notifications_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: error_notifications error_notifications_error_log_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_notifications
    ADD CONSTRAINT error_notifications_error_log_id_fkey FOREIGN KEY (error_log_id) REFERENCES public.error_logs(id) ON DELETE CASCADE;


--
-- Name: profiles fk_profiles_people; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT fk_profiles_people FOREIGN KEY (people_id) REFERENCES public.people(id) ON DELETE SET NULL;


--
-- Name: location_requests location_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_requests
    ADD CONSTRAINT location_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: location_requests location_requests_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_requests
    ADD CONSTRAINT location_requests_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: news_articles news_articles_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_articles
    ADD CONSTRAINT news_articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: nominated_podcasts nominated_podcasts_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominated_podcasts
    ADD CONSTRAINT nominated_podcasts_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: nominated_podcasts nominated_podcasts_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominated_podcasts
    ADD CONSTRAINT nominated_podcasts_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.nomination_polls(id) ON DELETE CASCADE;


--
-- Name: nomination_polls nomination_polls_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nomination_polls
    ADD CONSTRAINT nomination_polls_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: nominations nominations_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominations
    ADD CONSTRAINT nominations_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.nomination_categories(id);


--
-- Name: nominations nominations_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominations
    ADD CONSTRAINT nominations_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id);


--
-- Name: nominations nominations_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nominations
    ADD CONSTRAINT nominations_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: pages pages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: podcast_analytics_summary podcast_analytics_summary_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_analytics_summary
    ADD CONSTRAINT podcast_analytics_summary_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: podcast_daily_stats podcast_daily_stats_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_daily_stats
    ADD CONSTRAINT podcast_daily_stats_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: podcast_monthly_stats podcast_monthly_stats_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_monthly_stats
    ADD CONSTRAINT podcast_monthly_stats_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: podcast_people podcast_people_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_people
    ADD CONSTRAINT podcast_people_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: podcast_people podcast_people_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_people
    ADD CONSTRAINT podcast_people_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: podcast_weekly_stats podcast_weekly_stats_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcast_weekly_stats
    ADD CONSTRAINT podcast_weekly_stats_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: podcasts podcasts_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcasts
    ADD CONSTRAINT podcasts_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: podcasts podcasts_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.podcasts
    ADD CONSTRAINT podcasts_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: preview_updates preview_updates_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preview_updates
    ADD CONSTRAINT preview_updates_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: preview_updates preview_updates_rejected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preview_updates
    ADD CONSTRAINT preview_updates_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES auth.users(id);


--
-- Name: preview_updates preview_updates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preview_updates
    ADD CONSTRAINT preview_updates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: review_votes review_votes_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_votes
    ADD CONSTRAINT review_votes_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: review_votes review_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_votes
    ADD CONSTRAINT review_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;


--
-- Name: scheduled_reviews scheduled_reviews_fake_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_reviews
    ADD CONSTRAINT scheduled_reviews_fake_user_id_fkey FOREIGN KEY (fake_user_id) REFERENCES public.fake_users(id) ON DELETE CASCADE;


--
-- Name: sync_history sync_history_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_history
    ADD CONSTRAINT sync_history_podcast_id_fkey FOREIGN KEY (podcast_id) REFERENCES public.podcasts(id) ON DELETE CASCADE;


--
-- Name: verification_requests verification_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(user_id);


--
-- Name: verification_requests verification_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_requests
    ADD CONSTRAINT verification_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;


--
-- Name: votes votes_nominated_podcast_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_nominated_podcast_id_fkey FOREIGN KEY (nominated_podcast_id) REFERENCES public.nominated_podcasts(id) ON DELETE CASCADE;


--
-- Name: votes votes_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.nomination_polls(id) ON DELETE CASCADE;


--
-- Name: votes votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_clicks Ad clicks are insertable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Ad clicks are insertable by everyone" ON public.ad_clicks FOR INSERT WITH CHECK (true);


--
-- Name: ad_configs Ad configs are manageable by admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Ad configs are manageable by admins" ON public.ad_configs USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: ad_configs Ad configs are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Ad configs are viewable by everyone" ON public.ad_configs FOR SELECT USING (true);


--
-- Name: ad_impressions Ad impressions are insertable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Ad impressions are insertable by everyone" ON public.ad_impressions FOR INSERT WITH CHECK (true);


--
-- Name: ad_stats Ad stats are viewable by admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Ad stats are viewable by admins" ON public.ad_stats FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: notifications Admins can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: email_notifications Admins can manage all email notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all email notifications" ON public.email_notifications USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: email_config Admins can manage email config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage email config" ON public.email_config USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: contact_submissions Admins can update contact submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: contribution_history Admins can update contribution history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update contribution history" ON public.contribution_history FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: error_logs Admins can update error logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update error logs" ON public.error_logs FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: location_requests Admins can update location requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update location requests" ON public.location_requests FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: preview_updates Admins can update preview updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update preview updates" ON public.preview_updates FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: error_notifications Admins can update their error notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update their error notifications" ON public.error_notifications FOR UPDATE USING ((admin_user_id = auth.uid()));


--
-- Name: contact_submissions Admins can view all contact submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: contribution_history Admins can view all contribution history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all contribution history" ON public.contribution_history FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: error_logs Admins can view all error logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all error logs" ON public.error_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: location_requests Admins can view all location requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all location requests" ON public.location_requests FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: notifications Admins can view all notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all notifications" ON public.notifications FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: preview_updates Admins can view all preview updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all preview updates" ON public.preview_updates FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: error_analytics Admins can view error analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view error analytics" ON public.error_analytics FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: error_notifications Admins can view their error notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view their error notifications" ON public.error_notifications FOR SELECT USING ((admin_user_id = auth.uid()));


--
-- Name: daily_rankings Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.daily_rankings USING (public.is_admin());


--
-- Name: edit_suggestions Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.edit_suggestions USING (public.is_admin());


--
-- Name: episode_people Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.episode_people USING (public.is_admin());


--
-- Name: episodes Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.episodes USING (public.is_admin());


--
-- Name: news_articles Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.news_articles USING (public.is_admin());


--
-- Name: people Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.people USING (public.is_admin());


--
-- Name: podcast_people Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.podcast_people USING (public.is_admin());


--
-- Name: podcasts Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.podcasts USING (public.is_admin());


--
-- Name: profiles Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.profiles USING (public.is_admin());


--
-- Name: reviews Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.reviews USING (public.is_admin());


--
-- Name: sync_history Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.sync_history USING (public.is_admin());


--
-- Name: sync_settings Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.sync_settings USING (public.is_admin());


--
-- Name: verification_requests Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.verification_requests USING (public.is_admin());


--
-- Name: youtube_api_keys Admins have full access.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins have full access." ON public.youtube_api_keys USING (public.is_admin());


--
-- Name: settings Allow admin full access to settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin full access to settings" ON public.settings USING (public.is_admin_by_user_id(auth.uid())) WITH CHECK (public.is_admin_by_user_id(auth.uid()));


--
-- Name: verification_requests Allow admin to read all requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin to read all requests" ON public.verification_requests FOR SELECT TO service_role USING (true);


--
-- Name: sync_history Allow admin users to read sync history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin users to read sync history" ON public.sync_history FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: nominated_podcasts Allow admins full access to nominees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins full access to nominees" ON public.nominated_podcasts USING (public.is_admin_by_user_id(auth.uid())) WITH CHECK (public.is_admin_by_user_id(auth.uid()));


--
-- Name: nomination_polls Allow admins to delete polls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to delete polls" ON public.nomination_polls FOR DELETE USING (public.is_admin_by_user_id(auth.uid()));


--
-- Name: contributions Allow admins to manage all contributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to manage all contributions" ON public.contributions USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: nomination_polls Allow admins to update polls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admins to update polls" ON public.nomination_polls FOR UPDATE USING (public.is_admin_by_user_id(auth.uid())) WITH CHECK (public.is_admin_by_user_id(auth.uid()));


--
-- Name: help_categories Allow all for authenticated users on help_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users on help_categories" ON public.help_categories USING ((auth.role() = 'authenticated'::text));


--
-- Name: pages Allow all for authenticated users on pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated users on pages" ON public.pages USING ((auth.role() = 'authenticated'::text));


--
-- Name: openrouter_api_keys Allow all for debug; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for debug" ON public.openrouter_api_keys FOR SELECT USING (true);


--
-- Name: analytics_conversions Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_conversions USING ((auth.role() = 'authenticated'::text));


--
-- Name: analytics_custom_events Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_custom_events USING ((auth.role() = 'authenticated'::text));


--
-- Name: analytics_events Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_events USING ((auth.role() = 'authenticated'::text));


--
-- Name: analytics_keywords Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_keywords USING ((auth.role() = 'authenticated'::text));


--
-- Name: analytics_page_performance Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_page_performance USING ((auth.role() = 'authenticated'::text));


--
-- Name: analytics_seo_performance Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_seo_performance USING ((auth.role() = 'authenticated'::text));


--
-- Name: analytics_sessions Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_sessions USING ((auth.role() = 'authenticated'::text));


--
-- Name: analytics_traffic_sources Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_traffic_sources USING ((auth.role() = 'authenticated'::text));


--
-- Name: analytics_user_demographics Allow all operations for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all operations for authenticated users" ON public.analytics_user_demographics USING ((auth.role() = 'authenticated'::text));


--
-- Name: votes Allow authenticated users to cast votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to cast votes" ON public.votes FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: nomination_polls Allow authenticated users to create polls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to create polls" ON public.nomination_polls FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: votes Allow authenticated users to insert votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to insert votes" ON public.votes FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: sync_history Allow authenticated users to read sync history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users to read sync history" ON public.sync_history FOR SELECT TO authenticated USING (true);


--
-- Name: gemini_api_keys Allow full access for admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access for admin" ON public.gemini_api_keys TO service_role USING (true) WITH CHECK (true);


--
-- Name: settings Allow full access for admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access for admin" ON public.settings TO service_role USING (true) WITH CHECK (true);


--
-- Name: verification_requests Allow full access for admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access for admin" ON public.verification_requests TO service_role USING (true) WITH CHECK (true);


--
-- Name: youtube_api_keys Allow full access for admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access for admin" ON public.youtube_api_keys TO service_role USING (true) WITH CHECK (true);


--
-- Name: votes Allow full access for service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access for service_role" ON public.votes USING ((auth.role() = 'service_role'::text)) WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: assigned_awards Allow full access to admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access to admins" ON public.assigned_awards USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: awards Allow full access to admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access to admins" ON public.awards USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: explore_carousel Allow full access to admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access to admins" ON public.explore_carousel USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: gemini_api_keys Allow full access to admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access to admins" ON public.gemini_api_keys USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: nominated_podcasts Allow full access to admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access to admins" ON public.nominated_podcasts USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: nomination_polls Allow full access to admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access to admins" ON public.nomination_polls USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: seo_jobs Allow full access to admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access to admins" ON public.seo_jobs USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: settings Allow full access to admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access to admins" ON public.settings USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: youtube_api_keys Allow full access to admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access to admins" ON public.youtube_api_keys USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: profiles Allow individual update access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow individual update access" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: episode_analytics_summary Allow insert access to episode_analytics_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert access to episode_analytics_summary" ON public.episode_analytics_summary FOR INSERT WITH CHECK (true);


--
-- Name: episode_discovery_log Allow insert access to episode_discovery_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert access to episode_discovery_log" ON public.episode_discovery_log FOR INSERT WITH CHECK (true);


--
-- Name: podcast_analytics_summary Allow insert access to podcast_analytics_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert access to podcast_analytics_summary" ON public.podcast_analytics_summary FOR INSERT WITH CHECK (true);


--
-- Name: assigned_awards Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.assigned_awards FOR SELECT USING (true);


--
-- Name: awards Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.awards FOR SELECT USING (true);


--
-- Name: episodes Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.episodes FOR SELECT USING (true);


--
-- Name: explore_carousel Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.explore_carousel FOR SELECT USING (true);


--
-- Name: news_articles Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.news_articles FOR SELECT USING (true);


--
-- Name: nominated_podcasts Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.nominated_podcasts FOR SELECT USING (true);


--
-- Name: nomination_polls Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.nomination_polls FOR SELECT USING (true);


--
-- Name: people Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.people FOR SELECT USING (true);


--
-- Name: podcasts Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.podcasts FOR SELECT USING (true);


--
-- Name: reviews Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.reviews FOR SELECT USING ((status = 'approved'::public.review_status));


--
-- Name: episodes Allow public read access for episodes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access for episodes" ON public.episodes FOR SELECT USING (true);


--
-- Name: nominated_podcasts Allow public read access to nominated podcasts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to nominated podcasts" ON public.nominated_podcasts FOR SELECT USING (true);


--
-- Name: nomination_categories Allow public read access to nomination categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to nomination categories" ON public.nomination_categories FOR SELECT USING (true);


--
-- Name: nomination_polls Allow public read access to nomination polls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to nomination polls" ON public.nomination_polls FOR SELECT USING (true);


--
-- Name: nominations Allow public read access to nominations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to nominations" ON public.nominations FOR SELECT USING (true);


--
-- Name: nominated_podcasts Allow public read access to nominees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to nominees" ON public.nominated_podcasts FOR SELECT USING (true);


--
-- Name: nomination_polls Allow public read access to polls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to polls" ON public.nomination_polls FOR SELECT USING (true);


--
-- Name: settings Allow public read access to settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to settings" ON public.settings FOR SELECT USING (true);


--
-- Name: sync_history Allow public read access to sync history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to sync history" ON public.sync_history FOR SELECT USING (true);


--
-- Name: votes Allow public read access to votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to votes" ON public.votes FOR SELECT USING (true);


--
-- Name: profiles Allow read access for self and admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read access for self and admins" ON public.profiles FOR SELECT USING (((auth.uid() = user_id) OR public.is_admin()));


--
-- Name: episode_sync_history Allow read access to all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read access to all users" ON public.episode_sync_history FOR SELECT USING (true);


--
-- Name: explore_carousel Allow read access to all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read access to all users" ON public.explore_carousel FOR SELECT USING (true);


--
-- Name: settings Allow read access to all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read access to all users" ON public.settings FOR SELECT USING (true);


--
-- Name: settings Allow read access to authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read access to authenticated users" ON public.settings FOR SELECT TO authenticated USING (true);


--
-- Name: episode_analytics_summary Allow read access to episode_analytics_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read access to episode_analytics_summary" ON public.episode_analytics_summary FOR SELECT USING (true);


--
-- Name: episode_discovery_log Allow read access to episode_discovery_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read access to episode_discovery_log" ON public.episode_discovery_log FOR SELECT USING (true);


--
-- Name: podcast_analytics_summary Allow read access to podcast_analytics_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read access to podcast_analytics_summary" ON public.podcast_analytics_summary FOR SELECT USING (true);


--
-- Name: episode_analytics_summary Allow update access to episode_analytics_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow update access to episode_analytics_summary" ON public.episode_analytics_summary FOR UPDATE USING (true);


--
-- Name: podcast_analytics_summary Allow update access to podcast_analytics_summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow update access to podcast_analytics_summary" ON public.podcast_analytics_summary FOR UPDATE USING (true);


--
-- Name: verification_requests Allow user to read their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow user to read their own requests" ON public.verification_requests FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: contributions Allow users to insert their own contributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to insert their own contributions" ON public.contributions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: verification_requests Allow users to see their own requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to see their own requests" ON public.verification_requests FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: contributions Allow users to view their own contributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to view their own contributions" ON public.contributions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: analytics_events Analytics events are insertable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Analytics events are insertable by authenticated users" ON public.analytics_events FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: analytics_events Analytics events are viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Analytics events are viewable by authenticated users" ON public.analytics_events FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: podcasts Authenticated users can contribute.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can contribute." ON public.podcasts FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: reviews Authenticated users can create reviews.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create reviews." ON public.reviews FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: help_categories Authenticated users can delete help categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete help categories" ON public.help_categories FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: pages Authenticated users can delete pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete pages" ON public.pages FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: help_categories Authenticated users can insert help categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert help categories" ON public.help_categories FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: pages Authenticated users can insert pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert pages" ON public.pages FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: email_config Authenticated users can read email config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read email config" ON public.email_config FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: verification_requests Authenticated users can submit requests.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can submit requests." ON public.verification_requests FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: edit_suggestions Authenticated users can suggest edits.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can suggest edits." ON public.edit_suggestions FOR INSERT TO authenticated WITH CHECK ((auth.uid() = suggested_by));


--
-- Name: help_categories Authenticated users can update help categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update help categories" ON public.help_categories FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: pages Authenticated users can update pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update pages" ON public.pages FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: help_categories Authenticated users can view all help categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view all help categories" ON public.help_categories FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: pages Authenticated users can view all pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view all pages" ON public.pages FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: openrouter_api_keys Enable all operations for admin users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all operations for admin users" ON public.openrouter_api_keys TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: sync_history Enable insert for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users" ON public.sync_history FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: sync_history Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.sync_history FOR SELECT TO authenticated, anon, service_role USING (true);


--
-- Name: sync_history Enable update for service_role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for service_role" ON public.sync_history FOR UPDATE TO service_role USING (true) WITH CHECK (true);


--
-- Name: fake_users Only admins can manage fake users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage fake users" ON public.fake_users USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: scheduled_reviews Only admins can manage scheduled reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage scheduled reviews" ON public.scheduled_reviews USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: profiles Profiles are viewable by everyone.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);


--
-- Name: help_categories Public can read help categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read help categories" ON public.help_categories FOR SELECT USING (true);


--
-- Name: pages Public can read published pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read published pages" ON public.pages FOR SELECT USING ((published = true));


--
-- Name: help_categories Public can view help categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view help categories" ON public.help_categories FOR SELECT USING (true);


--
-- Name: pages Public can view published pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view published pages" ON public.pages FOR SELECT USING ((published = true));


--
-- Name: episode_people Public data is viewable by everyone.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public data is viewable by everyone." ON public.episode_people FOR SELECT USING (true);


--
-- Name: episodes Public data is viewable by everyone.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public data is viewable by everyone." ON public.episodes FOR SELECT USING (true);


--
-- Name: news_articles Public data is viewable by everyone.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public data is viewable by everyone." ON public.news_articles FOR SELECT USING ((published = true));


--
-- Name: people Public data is viewable by everyone.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public data is viewable by everyone." ON public.people FOR SELECT USING (true);


--
-- Name: podcast_people Public data is viewable by everyone.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public data is viewable by everyone." ON public.podcast_people FOR SELECT USING (true);


--
-- Name: podcasts Public data is viewable by everyone.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public data is viewable by everyone." ON public.podcasts FOR SELECT USING (true);


--
-- Name: reviews Public data is viewable by everyone.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public data is viewable by everyone." ON public.reviews FOR SELECT USING (true);


--
-- Name: contact_submissions Service role can insert contact submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert contact submissions" ON public.contact_submissions FOR INSERT WITH CHECK ((auth.role() = 'service_role'::text));


--
-- Name: error_logs Service role can insert error logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert error logs" ON public.error_logs FOR INSERT WITH CHECK (true);


--
-- Name: error_notifications Service role can insert error notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can insert error notifications" ON public.error_notifications FOR INSERT WITH CHECK (true);


--
-- Name: notifications Service role can manage all notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage all notifications" ON public.notifications USING ((auth.role() = 'service_role'::text));


--
-- Name: error_analytics Service role can manage error analytics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage error analytics" ON public.error_analytics USING (true);


--
-- Name: email_config Service role full access to email config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role full access to email config" ON public.email_config USING ((auth.role() = 'service_role'::text));


--
-- Name: preview_updates Users can create their own preview updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own preview updates" ON public.preview_updates FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: reviews Users can delete their own reviews.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own reviews." ON public.reviews FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: episodes Users can insert episodes for their own podcasts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert episodes for their own podcasts" ON public.episodes FOR INSERT TO authenticated WITH CHECK ((( SELECT podcasts.submitted_by
   FROM public.podcasts
  WHERE (podcasts.id = episodes.podcast_id)) = auth.uid()));


--
-- Name: location_requests Users can insert their own location requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own location requests" ON public.location_requests FOR INSERT WITH CHECK ((auth.uid() = submitted_by));


--
-- Name: podcasts Users can insert their own podcasts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own podcasts" ON public.podcasts FOR INSERT TO authenticated WITH CHECK ((auth.uid() = submitted_by));


--
-- Name: profiles Users can insert their own profile.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: reviews Users can update their own reviews.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own reviews." ON public.reviews FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: contribution_history Users can view their own contribution history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own contribution history" ON public.contribution_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: email_notifications Users can view their own email notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own email notifications" ON public.email_notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: location_requests Users can view their own location requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own location requests" ON public.location_requests FOR SELECT USING ((auth.uid() = submitted_by));


--
-- Name: notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: preview_updates Users can view their own preview updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own preview updates" ON public.preview_updates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: verification_requests Users can view their own requests.; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own requests." ON public.verification_requests FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ad_clicks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_configs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ad_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_impressions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

--
-- Name: ad_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ad_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_conversions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_conversions ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_custom_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_custom_events ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_keywords; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_keywords ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_page_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_page_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_seo_performance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_seo_performance ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_traffic_sources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_traffic_sources ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_user_demographics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.analytics_user_demographics ENABLE ROW LEVEL SECURITY;

--
-- Name: assigned_awards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assigned_awards ENABLE ROW LEVEL SECURITY;

--
-- Name: awards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: contribution_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contribution_history ENABLE ROW LEVEL SECURITY;

--
-- Name: contributions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_rankings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_rankings ENABLE ROW LEVEL SECURITY;

--
-- Name: edit_suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.edit_suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: email_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;

--
-- Name: email_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: episode_analytics_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.episode_analytics_summary ENABLE ROW LEVEL SECURITY;

--
-- Name: episode_discovery_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.episode_discovery_log ENABLE ROW LEVEL SECURITY;

--
-- Name: episode_people; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.episode_people ENABLE ROW LEVEL SECURITY;

--
-- Name: episode_sync_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.episode_sync_history ENABLE ROW LEVEL SECURITY;

--
-- Name: episodes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

--
-- Name: error_analytics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.error_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: error_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: error_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.error_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: explore_carousel; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.explore_carousel ENABLE ROW LEVEL SECURITY;

--
-- Name: fake_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fake_users ENABLE ROW LEVEL SECURITY;

--
-- Name: gemini_api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gemini_api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: help_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: nomination_categories insert_nomination_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_nomination_categories ON public.nomination_categories FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: location_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.location_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: news_articles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

--
-- Name: nominated_podcasts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nominated_podcasts ENABLE ROW LEVEL SECURITY;

--
-- Name: nomination_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nomination_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: nomination_polls; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nomination_polls ENABLE ROW LEVEL SECURITY;

--
-- Name: nominations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nominations ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: openrouter_api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.openrouter_api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: pages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

--
-- Name: people; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

--
-- Name: podcast_analytics_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.podcast_analytics_summary ENABLE ROW LEVEL SECURITY;

--
-- Name: podcast_people; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.podcast_people ENABLE ROW LEVEL SECURITY;

--
-- Name: podcasts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

--
-- Name: preview_updates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.preview_updates ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: scheduled_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scheduled_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: nomination_categories select_nomination_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY select_nomination_categories ON public.nomination_categories FOR SELECT TO authenticated USING (true);


--
-- Name: people select_people; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY select_people ON public.people FOR SELECT TO authenticated USING (true);


--
-- Name: seo_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seo_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

--
-- Name: sync_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;

--
-- Name: sync_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sync_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: verification_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

--
-- Name: youtube_api_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.youtube_api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Anyone can view episode thumbnails; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Anyone can view episode thumbnails" ON storage.objects FOR SELECT USING ((bucket_id = 'episode-thumbnails'::text));


--
-- Name: objects Anyone can view people photos; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Anyone can view people photos" ON storage.objects FOR SELECT USING ((bucket_id = 'people-photos'::text));


--
-- Name: objects Anyone can view podcast covers; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Anyone can view podcast covers" ON storage.objects FOR SELECT USING ((bucket_id = 'podcast-covers'::text));


--
-- Name: objects Authenticated users can upload episode thumbnails; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can upload episode thumbnails" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'episode-thumbnails'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Authenticated users can upload people photos; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can upload people photos" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'people-photos'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Authenticated users can upload podcast covers; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Authenticated users can upload podcast covers" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'podcast-covers'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Public read access for people-photos; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public read access for people-photos" ON storage.objects FOR SELECT USING ((bucket_id = 'people-photos'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--



