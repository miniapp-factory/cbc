"use client";

import { useMiniAppContext } from "./context/miniapp-provider";
import { Button } from "./ui/button";

export function Share({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { sdk, isInMiniApp } = useMiniAppContext();

  if (!isInMiniApp) {
    return <></>;
  }

  return (
    <Button
      className={className}
      onClick={() => {
        sdk.actions.composeCast({
          text,
        });
      }}
    >
      Share
    </Button>
  );
}

export default Share;
