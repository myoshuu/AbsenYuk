"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Skeleton from "@/components/ui/Skeleton";

interface Activity {
  type: string;
  label: string;
  time: string;
  icon: string;
  color: string;
}

export default function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/live-activity");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setActivities(data.activities || []);
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
          <CardTitle>Aktivitas Terkini</CardTitle>
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
        <CardTitle>Aktivitas Terkini</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-ink-muted">Belum ada aktivitas</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-${a.color}/10 text-${a.color}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={a.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink truncate">{a.label}</p>
                  <p className="text-xs text-ink-muted">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
