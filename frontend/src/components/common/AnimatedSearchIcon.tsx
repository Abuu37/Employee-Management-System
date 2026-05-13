import { useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import searchIcon from "@/assets/icons/search.json";

interface Props {
  className?: string;
}

export function AnimatedSearchIcon({
  className = "absolute left-3 top-1/2 -translate-y-1/2",
}: Props) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  return (
    <div
      className={className}
      onMouseEnter={() => lottieRef.current?.goToAndPlay(0, true)}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={searchIcon}
        loop={false}
        autoplay={false}
        style={{ width: 18, height: 18 }}
      />
    </div>
  );
}
