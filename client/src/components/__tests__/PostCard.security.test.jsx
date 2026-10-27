// client/src/components/__tests__/PostCard.security.test.jsx
//
// The stored-XSS row of the threat model, verified as a regression test:
// a post body containing a script tag must render as inert text, never
// as executable markup.

import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import { PostCard } from "../PostCard";

test("renders post body as text, never as executable HTML", () => {
  const maliciousPost = {
    id: "1",
    title: "Test",
    body: "<script>window.__xss = true;</script>",
    author: { displayName: "Attacker" },
  };

  render(<PostCard post={maliciousPost} />);

  expect(screen.getByText(/<script>/)).toBeInTheDocument(); // rendered as literal text
  expect(window.__xss).toBeUndefined(); // never executed
  // getByText would also pass if React had injected a real <script> tag and
  // the text merely happened to be on the page, so check the DOM directly:
  // no script element reached the document at all.
  expect(document.querySelectorAll("script")).toHaveLength(0);
});
