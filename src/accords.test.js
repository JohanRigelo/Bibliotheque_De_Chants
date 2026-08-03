import { describe, it, expect } from "vitest";
import { transposeAccord } from "./accords";

describe("transposeAccord", () => {
  it("transpose un accord simple vers le haut", () => {
    expect(transposeAccord("C", 2)).toBe("E");
  });

  it("boucle sur la gamme après B", () => {
    expect(transposeAccord("B", 1)).toBe("C");
  });

  it("gère une transposition négative", () => {
    expect(transposeAccord("C", -1)).toBe("B");
  });
});
