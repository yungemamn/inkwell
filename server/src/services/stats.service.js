// server/src/services/stats.service.js
//
// The route asks this service, not the listener, for the numbers, so the
// route stays thin (ADR-001) and a later version could read from the
// database instead without the route changing.

import { getPostsPublishedCount } from "../events/listeners/count-published-posts.listener.js";

export const StatsService = {
  getStats() {
    return { postsPublished: getPostsPublishedCount() };
  },
};
