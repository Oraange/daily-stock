-- handle_new_user는 auth.users 트리거 전용 — PostgREST RPC로 노출될 필요 없음
-- (SECURITY DEFINER 함수가 anon/authenticated로 실행 가능하다는 보안 린트 해결)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
