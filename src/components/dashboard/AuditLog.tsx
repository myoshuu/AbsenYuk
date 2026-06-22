"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Skeleton from "@/components/ui/Skeleton";

interface Entry {
  actor: string;
  action: string;
  detail: string | null;
  time: string;
  status: string;
}

export default function AuditLog() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/audit-log");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setEntries(data.entries || []);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Audit</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-ink-muted">Belum ada log audit</p>
        ) : (
          <div className="space-y-3">
            {entries.map((e, i) => (
              <div key={i} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">{e.actor}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    e.status === "success" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  }`}>
                    {e.status}
                  </span>
                </div>
                <p className="text-ink-muted text-xs mt-0.5">{e.action}</p>
                <p className="text-ink-muted text-xs">{e.time}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
