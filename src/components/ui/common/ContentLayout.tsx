import { cn } from "cn";
import type { ComponentProps } from "react";

//ComponentProps<"div"> accepts children
//classname is just in case i want custom styling then it passes it down to this content layout
const ContentLayout = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "p-12 flex flex-col items-center overflow-hidden",
        className,
      )}
      {...props}
    ></div>
  );
};

export default ContentLayout;
