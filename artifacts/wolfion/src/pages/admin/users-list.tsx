import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { AdminLayout } from "@/components/admin-layout";
import { PinGate } from "@/components/admin/pin-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldCheck, Search, Users as UsersIcon, EyeOff, Eye } from "lucide-react";

type UserListItem = {
  id: string;
  email: string | null;
  fullName: string | null;
  imageUrl: string | null;
  isAdmin: boolean;
  createdAt: number | null;
  lastSignInAt: number | null;
  lastActiveAt: number | null;
};

const ONLINE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const POLL_INTERVAL_MS = 30_000;

function formatRelative(ts: number | null, now: number): string {
  if (!ts) return "Never";
  const diff = now - ts;
  if (diff < 0) return "Just now";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} mo ago`;
  const y = Math.floor(mo / 12);
  return `${y} yr ago`;
}

function formatDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UsersListPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [filteredOutCount, setFilteredOutCount] = useState(0);

  const load = async (signal?: AbortSignal) => {
    if (!isLoaded || !isSignedIn) return;
    setError(null);
    try {
      const token = await getToken();
      const url = `${import.meta.env.BASE_URL}api/users${showAll ? "?all=1" : ""}`;
      const res = await fetch(url, {
        headers: token ? { authorization: `Bearer ${token}` } : {},
        signal,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Failed (${res.status})`);
      }
      const data = (await res.json()) as {
        users: UserListItem[];
        filteredOutCount?: number;
      };
      if (signal?.aborted) return;
      setUsers(data.users);
      setFilteredOutCount(data.filteredOutCount ?? 0);
      setLastUpdated(Date.now());
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    void load(ctrl.signal);
    const poll = setInterval(() => void load(ctrl.signal), POLL_INTERVAL_MS);
    const tick = setInterval(() => setNow(Date.now()), 15_000);
    return () => {
      ctrl.abort();
      clearInterval(poll);
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, showAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.fullName ?? "").toLowerCase().includes(q),
    );
  }, [users, query]);

  const onlineCount = useMemo(
    () =>
      users.filter(
        (u) => u.lastActiveAt && now - u.lastActiveAt < ONLINE_WINDOW_MS,
      ).length,
    [users, now],
  );

  return (
    <AdminLayout>
      <PinGate
        title="User List is locked"
        description="Enter your admin PIN to view people using this app."
      >
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <UsersIcon className="h-5 w-5 text-primary flex-shrink-0" />
            <h1 className="text-lg sm:text-2xl font-bold truncate">User List</h1>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
            data-testid="refresh-users"
          >
            <RefreshCw
              className={"h-3.5 w-3.5 mr-1.5 " + (loading ? "animate-spin" : "")}
            />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                Total
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5">
                {users.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                Online now
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                {onlineCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                Offline
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5 text-muted-foreground">
                {users.length - onlineCount}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search email or name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            data-testid="search-users"
          />
        </div>

        {error && (
          <Card className="mb-3 border-destructive/40">
            <CardContent className="p-3 text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {loading && users.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Loading users…
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              {query ? "No users match your search." : "No users found."}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {filtered.length} {filtered.length === 1 ? "user" : "users"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {filtered.map((u) => {
                const isOnline =
                  !!u.lastActiveAt && now - u.lastActiveAt < ONLINE_WINDOW_MS;
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-3 sm:p-4"
                    data-testid={`user-${u.id}`}
                  >
                    <div className="relative flex-shrink-0">
                      {u.imageUrl ? (
                        <img
                          src={u.imageUrl}
                          alt={u.email ?? ""}
                          className="h-10 w-10 rounded-full object-cover bg-muted"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                          {(u.fullName || u.email || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                      <span
                        className={
                          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background " +
                          (isOnline ? "bg-emerald-500" : "bg-muted-foreground/40")
                        }
                        title={isOnline ? "Online" : "Offline"}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium truncate">
                          {u.email ?? "(no email)"}
                        </p>
                        {u.isAdmin && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            <ShieldCheck className="h-2.5 w-2.5" /> Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.fullName ?? "—"} · Joined {formatDate(u.createdAt)}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p
                        className={
                          "text-xs font-medium " +
                          (isOnline
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground")
                        }
                      >
                        {isOnline ? "Online" : "Offline"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {isOnline
                          ? "Active now"
                          : `Seen ${formatRelative(u.lastActiveAt ?? u.lastSignInAt, now)}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col items-center gap-1 mt-4">
          {!showAll && filteredOutCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
              data-testid="show-all-users"
            >
              <Eye className="h-3 w-3" />
              Show {filteredOutCount} hidden account
              {filteredOutCount === 1 ? "" : "s"} (never signed in)
            </button>
          )}
          {showAll && (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
              data-testid="hide-ghost-users"
            >
              <EyeOff className="h-3 w-3" />
              Hide accounts that never signed in
            </button>
          )}
          <p className="text-[10px] text-muted-foreground text-center">
            Updates every 30s · "Online" = active in app within last 5 min
            {lastUpdated
              ? ` · Last refreshed ${formatRelative(lastUpdated, now)}`
              : ""}
          </p>
        </div>
      </div>
      </PinGate>
    </AdminLayout>
  );
}
