import { Component, type ReactNode } from "react";
import Lottie from "lottie-react";
import errorIcon from "@/assets/icons/error.json";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen bg-[#f0f2f7] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <Lottie
              animationData={errorIcon}
              loop={false}
              autoplay={true}
              style={{ width: 160, height: 160 }}
            />
            <p className="text-2xl font-bold text-slate-800">
              Something went wrong
            </p>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              {this.state.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={this.handleReload}
              className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white shadow-md"
              style={{ background: "#1e3a5f" }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
