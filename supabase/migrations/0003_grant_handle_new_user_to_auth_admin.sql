-- 0002에서 public 롤 EXECUTE 회수 시 supabase_auth_admin 권한도 함께 사라져
-- auth.users insert 시 가입 트리거가 permission denied로 실패 → 카카오 로그인 불가.
-- auth 서버 롤에만 실행 권한 복구 (PostgREST 노출 롤 anon/authenticated는 그대로 차단)
grant execute on function public.handle_new_user() to supabase_auth_admin;
