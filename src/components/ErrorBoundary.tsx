// @ts-nocheck
import React, { ReactNode } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-100 p-4 font-sans text-neutral-900">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200">
            <div className="p-8 space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50/50">
                <AlertOctagon className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">System Error</h1>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  The application encountered an unexpected failure condition. This might be due to a lost connection, Firebase authentication restriction, or missing data.
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 overflow-auto max-h-40">
                <p className="text-xs font-mono text-neutral-600 break-words">
                  {this.state.error?.message || "Unknown unexpected error occurred"}
                </p>
              </div>
              <div className="pt-2">
                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full h-12 bg-black hover:bg-neutral-800 text-white rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
