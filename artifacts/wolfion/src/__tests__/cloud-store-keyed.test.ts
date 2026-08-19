import { describe, expect, it } from "vitest";
import {
  decodeKeyedChildren,
  diffKeyedUpdates,
  isRecordArray,
  mergeByIdPreferPending,
  sanitizeKey,
  stableStringify,
  toKeyedObject,
  isStringArray,
  isPlainObject,
  toKeyedStringsObject,
  decodeKeyedStrings,
  diffKeyedStringUpdates,
  diffFieldUpdates,
  fieldsMapOf,
  mergePendingWithCloud,
} from "@/lib/cloud-store";

const A = { id: "a", name: "Alpha" };
const B = { id: "b", name: "Beta" };
const C = { id: "c", name: "Gamma" };

describe("isRecordArray", () => {
  it("accepts arrays of id-bearing objects (and empty arrays)", () => {
    expect(isRecordArray([A, B])).toBe(true);
    expect(isRecordArray([])).toBe(true);
  });
  it("rejects string arrays, scalars, objects and arrays with holes", () => {
    expect(isRecordArray(["Spandex", "Cotton"])).toBe(false);
    expect(isRecordArray(42)).toBe(false);
    expect(isRecordArray({ packaging: 5 })).toBe(false);
    expect(isRecordArray([A, null])).toBe(false);
    expect(isRecordArray([{ name: "no id" }])).toBe(false);
  });
});

describe("toKeyedObject / decodeKeyedChildren round-trip", () => {
  it("preserves records and order", () => {
    const obj = toKeyedObject([B, A, C]);
    expect(Object.keys(obj).sort()).toEqual(["a", "b", "c"]);
    const decoded = decodeKeyedChildren(obj);
    expect(decoded).not.toBeNull();
    expect(decoded!.list).toEqual([B, A, C]); // _ord restores insertion order
  });
  it("strips undefined fields (RTDB rejects undefined)", () => {
    const obj = toKeyedObject([{ id: "w", nextPaymentDate: undefined }]);
    expect(obj.w).toEqual({ id: "w", _ord: 0 });
  });
  it("sanitizes forbidden RTDB key chars but keeps the record id", () => {
    const obj = toKeyedObject([{ id: "a.b/c#1" }]);
    expect(Object.keys(obj)).toEqual(["a_b_c_1"]);
    expect((obj["a_b_c_1"] as { id: string }).id).toBe("a.b/c#1");
    expect(sanitizeKey("a.b/c#1")).toBe("a_b_c_1");
  });
});

describe("decodeKeyedChildren format detection", () => {
  it("returns null for legacy arrays (RTDB numeric-key nodes)", () => {
    expect(decodeKeyedChildren([A, B])).toBeNull();
  });
  it("returns null for plain object stores (cost inputs, yarnPerDozen)", () => {
    expect(decodeKeyedChildren({ packaging: 5, iron: 10 })).toBeNull();
    expect(decodeKeyedChildren({ "spandex-1": 13, nylon: 10 })).toBeNull();
  });
  it("returns null when a child id does not match its key", () => {
    expect(decodeKeyedChildren({ x: { id: "y" } })).toBeNull();
  });
  it("sorts by _ord with key tiebreak and records missing _ord last", () => {
    const decoded = decodeKeyedChildren({
      a: { ...A, _ord: 2 },
      b: { ...B, _ord: 0 },
      c: { ...C }, // no _ord -> last
    });
    expect(decoded!.list).toEqual([B, A, C]);
  });
});

describe("diffKeyedUpdates", () => {
  const cloud = (recs: Array<Record<string, unknown>>) => {
    const m = new Map<string, string>();
    recs.forEach((r, i) =>
      m.set(String(r.id), stableStringify({ ...r, _ord: i })),
    );
    return m;
  };

  it("writes only added/changed records", () => {
    const updates = diffKeyedUpdates(
      [A, { id: "b", name: "Beta2" }, C],
      cloud([A, B]),
      true,
    );
    expect(Object.keys(updates).sort()).toEqual(["b", "c"]);
    expect(updates.b).toEqual({ id: "b", name: "Beta2", _ord: 1 });
    expect(updates.c).toEqual({ ...C, _ord: 2 });
  });

  it("issues no writes when nothing changed", () => {
    expect(diffKeyedUpdates([A, B], cloud([A, B]), true)).toEqual({});
  });

  it("deletes ONLY ids present in the seen cloud snapshot", () => {
    const updates = diffKeyedUpdates([A], cloud([A, B]), true);
    expect(updates).toEqual({ b: null });
  });

  it("never deletes when allowDeletes=false (pre-sync queue flush)", () => {
    const updates = diffKeyedUpdates([A], cloud([A, B]), false);
    expect(updates).toEqual({});
  });

  it("cannot erase records the device never saw", () => {
    // Stale device knows only [A]; cloud meanwhile has A,B,C. After the
    // device syncs (cloud map has all three), deleting requires the id to
    // be in the seen map — but a device that never saw B/C has no map
    // entry for them, so its diff against its own seen map touches nothing.
    const seenByStaleDevice = cloud([A]);
    const updates = diffKeyedUpdates([A], seenByStaleDevice, true);
    expect(updates).toEqual({}); // B and C untouched
  });

  it("is order-insensitive to object key order (stableStringify)", () => {
    const m = new Map([["a", stableStringify({ name: "Alpha", id: "a", _ord: 0 })]]);
    expect(diffKeyedUpdates([A], m, true)).toEqual({});
  });
});

describe("mergeByIdPreferPending", () => {
  it("pending wins per id, unseen cloud records preserved", () => {
    const merged = mergeByIdPreferPending(
      [{ id: "a", name: "Alpha-edited" }],
      [A, B, C],
    );
    expect(merged).toEqual([{ id: "a", name: "Alpha-edited" }, B, C]);
  });
  it("passes through non-record values", () => {
    expect(mergeByIdPreferPending(["x"], ["y"])).toEqual(["x"]);
    expect(mergeByIdPreferPending({ k: 1 }, { k: 2 })).toEqual({ k: 1 });
  });
});

// ---------------------------------------------------------------------------
// Non-record settings protection (string lists + plain object stores)
// ---------------------------------------------------------------------------

describe("isStringArray / isPlainObject", () => {
  it("classifies shapes", () => {
    expect(isStringArray(["Spandex", "Cotton"])).toBe(true);
    expect(isStringArray([])).toBe(false); // empty handled by record path
    expect(isStringArray(["ok", ""])).toBe(false);
    expect(isStringArray([A])).toBe(false);
    expect(isPlainObject({ packaging: 5 })).toBe(true);
    expect(isPlainObject([1])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(42)).toBe(false);
  });
});

describe("toKeyedStringsObject / decodeKeyedStrings round-trip", () => {
  it("preserves entries and order", () => {
    const obj = toKeyedStringsObject(["Black yarn", "Spandex", "Cotton"]);
    const decoded = decodeKeyedStrings(obj);
    expect(decoded).not.toBeNull();
    expect(decoded!.list).toEqual(["Black yarn", "Spandex", "Cotton"]);
  });
  it("sanitizes RTDB-hostile characters in keys but keeps the name", () => {
    const obj = toKeyedStringsObject(["No. 5 [soft]"]);
    const key = Object.keys(obj)[0];
    expect(key).not.toMatch(/[.#$/[\]]/);
    expect(decodeKeyedStrings(obj)!.list).toEqual(["No. 5 [soft]"]);
  });
  it("collapses duplicates", () => {
    expect(decodeKeyedStrings(toKeyedStringsObject(["A", "A", "B"]))!.list)
      .toEqual(["A", "B"]);
  });
  it("does not decode record-keyed nodes, object stores, or arrays", () => {
    expect(decodeKeyedStrings(toKeyedObject([A]))).toBeNull();
    expect(decodeKeyedStrings({ packaging: 5, rent: 100 })).toBeNull();
    expect(decodeKeyedStrings(["Spandex"])).toBeNull();
    expect(decodeKeyedStrings(null)).toBeNull();
  });
  it("record decoder rejects keyed string nodes", () => {
    expect(decodeKeyedChildren(toKeyedStringsObject(["Spandex"]))).toBeNull();
  });
});

describe("diffKeyedStringUpdates", () => {
  const cloudOf = (items: string[]) => {
    const m = new Map<string, string>();
    items.forEach((s, i) =>
      m.set(sanitizeKey(s), stableStringify({ n: s, _ord: i })),
    );
    return m;
  };

  it("writes only added entries and skips unchanged ones", () => {
    const updates = diffKeyedStringUpdates(
      ["Spandex", "Cotton", "Wool"],
      cloudOf(["Spandex", "Cotton"]),
      true,
    );
    expect(updates).toEqual({ Wool: { n: "Wool", _ord: 2 } });
  });
  it("deletes ONLY names present in the seen cloud snapshot", () => {
    expect(diffKeyedStringUpdates(["Spandex"], cloudOf(["Spandex", "Cotton"]), true))
      .toEqual({ Cotton: null });
  });
  it("a stale device cannot erase names it never saw", () => {
    // Device only ever saw ["Spandex"]; cloud meanwhile has more names,
    // but they are absent from this device's seen map — untouched.
    expect(diffKeyedStringUpdates(["Spandex"], cloudOf(["Spandex"]), true))
      .toEqual({});
  });
  it("never deletes when allowDeletes=false (pre-sync flush)", () => {
    expect(diffKeyedStringUpdates(["Spandex"], cloudOf(["Spandex", "Cotton"]), false))
      .toEqual({});
  });
});

describe("diffFieldUpdates (cost inputs / yarnPerDozen)", () => {
  it("writes only changed/added fields", () => {
    const cloudFields = fieldsMapOf({ packaging: 5, rent: 100 });
    const updates = diffFieldUpdates(
      { packaging: 5, rent: 120, electricity: 30 },
      cloudFields,
      true,
    );
    expect(updates).toEqual({ rent: 120, electricity: 30 });
  });
  it("deletes ONLY fields present in the seen cloud snapshot", () => {
    expect(diffFieldUpdates({ rent: 100 }, fieldsMapOf({ rent: 100, old: 1 }), true))
      .toEqual({ old: null });
  });
  it("a stale device cannot erase fields it never saw", () => {
    // Device saw only {rent}; another device added {electricity} since.
    expect(diffFieldUpdates({ rent: 100 }, fieldsMapOf({ rent: 100 }), true))
      .toEqual({});
  });
  it("never deletes when allowDeletes=false and skips undefined", () => {
    expect(
      diffFieldUpdates(
        { rent: 100, gone: undefined },
        fieldsMapOf({ rent: 100, old: 1 }),
        false,
      ),
    ).toEqual({});
  });
});

describe("mergePendingWithCloud", () => {
  it("record arrays: pending wins per id, cloud extras kept", () => {
    expect(mergePendingWithCloud([{ id: "a", name: "X" }], [A, B]))
      .toEqual([{ id: "a", name: "X" }, B]);
  });
  it("string arrays: union, pending order first, no deletions", () => {
    expect(mergePendingWithCloud(["Wool", "Spandex"], ["Spandex", "Cotton"]))
      .toEqual(["Wool", "Spandex", "Cotton"]);
  });
  it("objects: field-wise, pending fields win, cloud-only fields kept", () => {
    expect(mergePendingWithCloud({ rent: 120 }, { rent: 100, electricity: 30 }))
      .toEqual({ rent: 120, electricity: 30 });
  });
  it("scalars and null cloud pass pending through", () => {
    expect(mergePendingWithCloud(42, 7)).toBe(42);
    expect(mergePendingWithCloud({ rent: 1 }, null)).toEqual({ rent: 1 });
    expect(mergePendingWithCloud(["Wool"], null)).toEqual(["Wool"]);
  });
});

describe("empty string-list edge cases (delete-all ambiguity)", () => {
  const cloudOf = (items: string[]) => {
    const m = new Map<string, string>();
    items.forEach((s, i) =>
      m.set(sanitizeKey(s), stableStringify({ n: s, _ord: i })),
    );
    return m;
  };

  it("pre-sync empty pending never erases a cloud string list", () => {
    expect(mergePendingWithCloud([], ["Spandex", "Cotton"]))
      .toEqual(["Spandex", "Cotton"]);
  });
  it("pre-sync flush of an empty list issues no deletions", () => {
    expect(diffKeyedStringUpdates([], cloudOf(["Spandex", "Cotton"]), false))
      .toEqual({});
  });
  it("post-sync delete-all removes ONLY entries this device has seen", () => {
    // Device saw only Spandex; cloud meanwhile also has Cotton — a
    // delete-all from this device touches only its seen entry.
    expect(diffKeyedStringUpdates([], cloudOf(["Spandex"]), true))
      .toEqual({ Spandex: null });
  });
});
