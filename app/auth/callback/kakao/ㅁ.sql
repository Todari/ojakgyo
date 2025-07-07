create or replace function public.upsert_user(
   p_kakao_id bigint,
   p_name text,
   p_profile_url text,
   p_thumbnail_url text,
   p_last_login_at timestamptz
 )
 returns "user"
 language plpgsql
 security definer set search_path = public
 as $$
 declare
   result_user "user";
 begin
   insert into public.user (
     kakao_id,
     name,
     profile_url,
     thumbnail_url,
     last_login_at,
     lat,
     lng
   )
   values (
     p_kakao_id,
     p_name,
     p_profile_url,
     p_thumbnail_url,
     p_last_login_at,
     0, -- 기본 위도 값
     0  -- 기본 경도 값
   )
   on conflict (kakao_id) do update
     set
       name = excluded.name,
       profile_url = excluded.profile_url,
       thumbnail_url = excluded.thumbnail_url,
       last_login_at = excluded.last_login_at,
       updated_at = now()
   returning * into result_user;

   return result_user;
 end;
 $$;