/** PostgREST: 테이블이 없을 때 나오는 메시지에 배포 절차 안내를 붙입니다. */
export function appendSupabaseSchemaHint(message: string): string {
  if (message.includes("Could not find the table") && message.includes("schema cache")) {
    return (
      `${message}\n\n` +
      "[조치] Supabase 대시보드 → SQL → New query 에서 저장소의 supabase/schema.sql 전체를 붙여 Run 하세요. " +
      "그다음 Table Editor 에서 public.profiles 등이 보이는지 확인하세요. " +
      "Vercel의 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 가 이 프로젝트와 같은지도 확인하세요."
    );
  }
  return message;
}
