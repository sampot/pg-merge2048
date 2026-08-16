/** Optional Playgrounds Infrastructure stub. */
export default {
  async fetch(request) {
    return Response.json({
      ok: true,
      name: "pg-merge2048",
      path: new URL(request.url).pathname,
    });
  },
};
