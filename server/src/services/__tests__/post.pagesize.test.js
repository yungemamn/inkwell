// server/src/services/__tests__/post.pagesize.test.js
//
// Lecture 15, Exercise 1. The integration test checks what the response
// says; this checks what the database is actually asked for, which is
// the part that costs the server something. Only the repository is
// mocked, so the real clamp in PostService runs.

import { jest } from "@jest/globals";

const mockPostRepository = { findPublished: jest.fn(), searchPublished: jest.fn() };

jest.unstable_mockModule("../../repositories/post.repository.js", () => ({
  PostRepository: mockPostRepository,
}));

const { PostService, MAX_PAGE_SIZE } = await import("../post.service.js");

beforeEach(() => {
  jest.resetAllMocks();
  mockPostRepository.findPublished.mockResolvedValue({ posts: [], hasMore: false });
  mockPostRepository.searchPublished.mockResolvedValue({ posts: [], hasMore: false });
});

describe("PostService page size limit", () => {
  test.each([
    ["an oversized request", 100000, MAX_PAGE_SIZE],
    ["exactly the maximum", MAX_PAGE_SIZE, MAX_PAGE_SIZE],
    ["one over the maximum", MAX_PAGE_SIZE + 1, MAX_PAGE_SIZE],
    ["a normal request", 25, 25],
    ["a string of digits from a query parameter", "30", 30],
    ["junk", "abc", 10],
    ["zero", 0, 10],
    ["a negative number", -5, 10],
    ["nothing at all", undefined, 10],
  ])("%s (pageSize=%s) reaches the database as %s rows", async (_label, requested, expected) => {
    const result = await PostService.listPublished({ page: 1, pageSize: requested });

    expect(mockPostRepository.findPublished).toHaveBeenCalledWith({ page: 1, pageSize: expected });
    expect(result.pageSize).toBe(expected);
  });

  test("search is capped the same way, not just the feed", async () => {
    const result = await PostService.search({ query: "design", page: 1, pageSize: 100000 });

    expect(mockPostRepository.searchPublished).toHaveBeenCalledWith({
      query: "design",
      page: 1,
      pageSize: MAX_PAGE_SIZE,
    });
    expect(result.pageSize).toBe(MAX_PAGE_SIZE);
  });
});
