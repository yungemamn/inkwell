// server/src/events/listeners/count-published-posts.listener.js
//
// Workshop 9, Exercise 1: a second listener on the same event. It keeps a
// running count of posts published. PostService.publish() did not change to
// make this work, which is the point of the Observer pattern.
//
// The count lives in memory, so it starts at 0 every time the server starts.
// It is "posts published since the server started", not "posts in the database".

import { EventBus } from "../event-bus.js";

let postsPublished = 0;

EventBus.on("post.published", () => {
  postsPublished += 1;
});

export function getPostsPublishedCount() {
  return postsPublished;
}
