import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { Emblem } from './Emblem';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DAR - E - ARQAM UI Boundary Caught Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#10113D] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#171852] border-2 border-[#F5D900] neon-border-gold rounded-2xl p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <div className="flex justify-center">
              <Emblem size="lg" neonGlow className="!w-16 !h-16" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono bg-red-950/60 text-red-300 border border-red-500/40 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Portal Recovered</span>
              </div>
              <h1 className="font-editorial text-xl sm:text-2xl font-bold text-white">
                DAR - E - ARQAM
              </h1>
              <p className="text-xs text-[#EEF0FF]/80 font-prose-serif">
                The session has encountered an unexpected interruption. Please resume using the quick actions below.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 bg-[#FFF000] hover:bg-[#F5D900] text-[#171852] text-xs font-extrabold rounded-xl inline-flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 neon-glow-gold border border-[#F5D900]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#171852]" />
                <span>Reload</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#20216B] hover:bg-[#2A2C8A] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 border border-[#FFF000]/60 shadow-md cursor-pointer transition-all active:scale-95 hover:border-[#FFF000]"
              >
                <Home className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
