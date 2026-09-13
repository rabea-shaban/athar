import React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  as?: React.ElementType;
  noPadding?: boolean;
}

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  "2xl": "max-w-[1400px]",
  full: "max-w-full",
};

export default function Container({
  children,
  className,
  size = "xl",
  as: Component = "div",
  noPadding = false,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "w-full mx-auto",
        !noPadding && "px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
