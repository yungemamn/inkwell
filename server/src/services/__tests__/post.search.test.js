// server/src/services/__tests__/post.search.test.js
//
// Workshop 12, Exercise 1: test cases for PostService.search() (Lecture 9).
// The table with all six rows is in docs/quality/test-cases/post-search.md.
//
// Only PostRepository is replaced. PostService.search() and the real
// SubstringSearchStrategy run as they are, so no database is touched
// (Mistake 3). search() just hands the query and paging down to the
// strategy, so what reaches searchPublished() is part of what it does,
// not an internal detail. That's why rows 3 and 5 check those arguments.

import { jest } from "@jest/globals";

const mockPostRepository = { searchPublished: jest.fn() };

jest.unstable_mockModule("../../repositories/post.repository.js", () => ({
  PostRepository: mockPostRepository,
}));

const { PostService } = await import("../post.service.js");
const { ValidationError } = await import("../../utils/validation.js");

const designPost = { id: "p1", title: "Design notes", body: "..." };
const otherPost = { id: "p2", title: "On design", body: "..." };

beforeEach(() => {
  // reset, not clear: a value one test set up shouldn't answer for the next one
  jest.resetAllMocks();
});

describe("PostService.search", () => {
  test("returns the matching posts for a normal keyword (row 1)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({ posts: [designPost, otherPost], hasMore: false });

    const result = await PostService.search({ query: "Design", page: 1 });

    expect(result).toEqual({ posts: [designPost, otherPost], page: 1, hasMore: false });
    // the query goes down as typed. Ignoring case is the repository's job
    expect(mockPostRepository.searchPublished).toHaveBeenCalledWith(
      expect.objectContaining({ query: "Design" })
    );
  });

  test("returns an empty list, not an error, when nothing matches (row 2)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({ posts: [], hasMore: false });

    const result = await PostService.search({ query: "zzzz", page: 1 });

    expect(result).toEqual({ posts: [], page: 1, hasMore: false });
  });

  test("asks for the page it was given and says which page it is (row 3, boundary)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({ posts: [otherPost], hasMore: true });

    const result = await PostService.search({ query: "design", page: 2 });

    expect(mockPostRepository.searchPublished).toHaveBeenCalledWith({ query: "design", page: 2, pageSize: 10 });
    expect(result.page).toBe(2);
    expect(result.hasMore).toBe(true);
  });

  test.each([
    ["an empty string", ""],
    ["only spaces", "   "],
    ["no query at all", undefined],
  ])("rejects %s as the query (row 4)", async (_label, query) => {
    await expect(PostService.search({ query, page: 1 })).rejects.toBeInstanceOf(ValidationError);
    expect(mockPostRepository.searchPublished).not.toHaveBeenCalled();
  });

  test("uses page 1 and pageSize 10 when they are left out (row 5, white-box branch)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({ posts: [], hasMore: false });

    const result = await PostService.search({ query: "design" });

    expect(mockPostRepository.searchPublished).toHaveBeenCalledWith({ query: "design", page: 1, pageSize: 10 });
    expect(result.page).toBe(1);
  });

  test("passes a repository failure up instead of hiding it (row 6, white-box error path)", async () => {
    mockPostRepository.searchPublished.mockRejectedValue(new Error("connection lost"));

    await expect(PostService.search({ query: "design" })).rejects.toThrow("connection lost");
  });
});
