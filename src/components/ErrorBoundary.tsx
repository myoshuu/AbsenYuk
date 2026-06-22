"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <Card className="m-4">
          <CardHeader>
            <CardTitle>Terjadi kesalahan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
            <Button onClick={() => window.location.reload()}>Muat ulang</Button>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}
