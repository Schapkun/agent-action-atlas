export function middleware() {
  return new Response("SSR forced", {
    status: 200,
  });
}
