import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Mock @clerk/react so <App /> can render without a real publishable key and
// so all auth-gated routes treat the test user as signed-in (and not admin).
// ---------------------------------------------------------------------------

const stableUser = {
  id: "test_user_1",
  primaryEmailAddress: { emailAddress: "shopper@test.local" },
  emailAddresses: [{ emailAddress: "shopper@test.local" }],
};

// Hoist the hook return values to module scope so every render observes
// REFERENTIALLY-STABLE objects. If we returned fresh objects from each hook
// call, effects that depend on (e.g.) `useClerk().addListener` would re-run
// every render — exactly the kind of subtle re-mount churn this test is meant
// to guard against.
const stableAddListener = () => () => {};
const stableSignOut = () => Promise.resolve();
const stableGetToken = async () => null;

const stableUseUserResult = {
  isLoaded: true,
  isSignedIn: true,
  user: stableUser,
} as const;

const stableUseClerkResult = {
  addListener: stableAddListener,
  signOut: stableSignOut,
  session: null,
  user: stableUser,
} as const;

const stableUseAuthResult = {
  isLoaded: true,
  isSignedIn: true,
  userId: stableUser.id,
  sessionId: "test_session_1",
  getToken: stableGetToken,
} as const;

vi.mock("@clerk/react", () => {
  return {
    ClerkProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    SignIn: () => <div data-testid="clerk-sign-in" />,
    SignUp: () => <div data-testid="clerk-sign-up" />,
    SignedIn: ({ children }: { children: ReactNode }) => <>{children}</>,
    SignedOut: () => null,
    UserButton: () => <div data-testid="clerk-user-button" />,
    useUser: () => stableUseUserResult,
    useClerk: () => stableUseClerkResult,
    useAuth: () => stableUseAuthResult,
  };
});

// ---------------------------------------------------------------------------
// Mock the API client so the listing/detail pages get a deterministic catalog
// instead of hitting the real /api/products endpoint (the DB is empty by
// default after the localStorage→server migration).
// ---------------------------------------------------------------------------

const TEST_PRODUCTS = [
  {
    id: "p_1",
    name: "Onyx Crew",
    color: "Onyx Black",
    price: 14,
    category: "ankle" as const,
    sizes: ["S", "M", "L"],
    description: "Test product 1",
    inventory: 1000,
    image: "",
    sortOrder: 1,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    id: "p_2",
    name: "Arctic Crew",
    color: "Arctic White",
    price: 14,
    category: "ankle" as const,
    sizes: ["M", "L"],
    description: "Test product 2",
    inventory: 800,
    image: "",
    sortOrder: 2,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    id: "p_3",
    name: "Performance Ankle",
    color: "Wolf Orange",
    price: 12,
    category: "ankle" as const,
    sizes: ["S", "M"],
    description: "Test product 3",
    inventory: 400,
    image: "",
    sortOrder: 3,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    id: "p_4",
    name: "Merino Lounge",
    color: "Heather Grey",
    price: 22,
    category: "others" as const,
    sizes: ["M", "L"],
    description: "Test product 4",
    inventory: 100,
    image: "",
    sortOrder: 4,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    id: "p_5",
    name: "Invisible Liner",
    color: "Pure White",
    price: 10,
    category: "short" as const,
    sizes: ["S", "M"],
    description: "Test product 5",
    inventory: 700,
    image: "",
    sortOrder: 5,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    id: "p_6",
    name: "Sport No-Show",
    color: "Charcoal",
    price: 11,
    category: "short" as const,
    sizes: ["M", "L"],
    description: "Test product 6",
    inventory: 500,
    image: "",
    sortOrder: 6,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    id: "p_7",
    name: "Mini Wolf Crew",
    color: "Cloud Blue",
    price: 9,
    category: "kids" as const,
    sizes: ["XS", "S"],
    description: "Test product 7",
    inventory: 300,
    image: "",
    sortOrder: 7,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    id: "p_8",
    name: "Mini Wolf Crew",
    color: "Sunset Pink",
    price: 9,
    category: "kids" as const,
    sizes: ["XS", "S"],
    description: "Test product 8",
    inventory: 250,
    image: "",
    sortOrder: 8,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
  {
    id: "p_9",
    name: "Wool Hiker",
    color: "Forest",
    price: 24,
    category: "others" as const,
    sizes: ["M", "L"],
    description: "Test product 9",
    inventory: 90,
    image: "",
    sortOrder: 9,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  },
];

const stableListProductsResult = {
  data: TEST_PRODUCTS,
  isLoading: false,
  isError: false,
  isSuccess: true,
  error: null,
  refetch: () => Promise.resolve({ data: TEST_PRODUCTS } as never),
} as const;

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@workspace/api-client-react")>();
  return {
    ...actual,
    useListProducts: () => stableListProductsResult,
  };
});

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Push a path into history and dispatch the events wouter listens to. */
function navigateTo(path: string) {
  window.history.pushState({}, "", path);
  // wouter's browser-location hook listens to popstate; dispatch one so that
  // any router currently mounted observes the change.
  window.dispatchEvent(new PopStateEvent("popstate"));
}

async function renderApp(initialPath = "/products") {
  navigateTo(initialPath);
  // Import App lazily AFTER the mocks above are in place.
  const { default: App } = await import("@/App");
  return render(<App />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("product navigation", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("renders the products listing with all 9 product cards", async () => {
    await renderApp("/products");

    // The lazy Products page resolves; wait for the first product link.
    for (const product of TEST_PRODUCTS) {
      await screen.findByTestId(`product-${product.id}`, undefined, {
        timeout: 5000,
      });
    }

    // Sanity: nine product cards in total.
    const cards = screen.getAllByTestId(/^product-p_\d+$/);
    expect(cards).toHaveLength(TEST_PRODUCTS.length);
    expect(TEST_PRODUCTS).toHaveLength(9);
  });

  it("navigates to every product detail page from the listing without breaking", async () => {
    const user = userEvent.setup();
    await renderApp("/products");

    // Wait for the listing to be hydrated before we start clicking.
    await screen.findByTestId(`product-${TEST_PRODUCTS[0]!.id}`, undefined, {
      timeout: 5000,
    });

    for (const product of TEST_PRODUCTS) {
      // Get back to the listing for the next iteration.
      navigateTo("/products");
      const card = await screen.findByTestId(`product-${product.id}`, undefined, {
        timeout: 5000,
      });

      await user.click(card);

      // URL must have changed to the detail route.
      await waitFor(
        () => {
          expect(window.location.pathname).toBe(`/product/${product.id}`);
        },
        { timeout: 5000 },
      );

      // Detail page must have rendered: the "Add to Bag" CTA is the canonical
      // signal that ProductDetail mounted with a resolved product.
      const addToBag = await screen.findByTestId("add-to-cart", undefined, {
        timeout: 5000,
      });
      expect(addToBag).toBeInTheDocument();
      expect(addToBag.textContent ?? "").toMatch(/Add to Bag/i);

      // The product's color label is unique per product in the data, so it's a
      // strong signal that the RIGHT detail page rendered (not a stale one).
      expect(
        await screen.findByText(new RegExp(`Wolfion · ${product.color}`, "i")),
      ).toBeInTheDocument();
    }
  }, 60_000);

  it("navigates between related products via the 'You may also like' rail", async () => {
    const user = userEvent.setup();
    await renderApp("/product/p_1");

    // Wait for the first detail page to render.
    await screen.findByTestId("add-to-cart", undefined, { timeout: 5000 });

    // The rail's heading anchors the section so we can scope to it.
    const railHeading = await screen.findByText(/You may also like/i, undefined, {
      timeout: 5000,
    });
    const rail = railHeading.parentElement;
    expect(rail).not.toBeNull();

    // Find every related product link inside the rail.
    const relatedLinks = within(rail!).getAllByRole("link");
    expect(relatedLinks.length).toBeGreaterThan(0);

    // Resolve the target product id from the link's href, then click it.
    const firstLink = relatedLinks[0]!;
    const href = firstLink.getAttribute("href") ?? "";
    const match = href.match(/\/product\/(p_\d+)/);
    expect(match, `expected related link href to point to a product, got ${href}`).not.toBeNull();
    const targetId = match![1]!;
    expect(targetId).not.toBe("p_1");

    await user.click(firstLink);

    await waitFor(
      () => {
        expect(window.location.pathname).toBe(`/product/${targetId}`);
      },
      { timeout: 5000 },
    );

    // The new detail page must render its own Add to Bag button.
    const addToBag = await screen.findByTestId("add-to-cart", undefined, {
      timeout: 5000,
    });
    expect(addToBag).toBeInTheDocument();

    // And the heading should reflect the related product, not p_1.
    const target = TEST_PRODUCTS.find((p) => p.id === targetId)!;
    expect(
      await screen.findByText(new RegExp(`Wolfion · ${target.color}`, "i")),
    ).toBeInTheDocument();
  }, 30_000);
});
