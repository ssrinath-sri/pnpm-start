import { describe, it, expect } from "bun:test";
import { greet, add } from "./index";

describe("utils", () => {
  it("should greet", () => {
    expect(greet("World")).toBe("Hello, World!");
  });

  it("should add numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
});
