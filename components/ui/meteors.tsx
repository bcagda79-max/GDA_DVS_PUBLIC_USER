import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const [meteors, setMeteors] = useState<Array<{id: number, left: string, delay: string, duration: string}>>([]);

  useEffect(() => {
    // Generate meteor data client-side only
    const newMeteors = new Array(number || 40).fill(null).map((_, idx) => ({
      id: idx,
      left: Math.floor(Math.random() * 1600 - 800) + "px",
      delay: (Math.random() * 2).toFixed(3) + "s",
      duration: Math.floor(Math.random() * 6 + 3) + "s",
    }));
    setMeteors(newMeteors);
  }, [number]);

  return (
    <>
      {meteors.map((meteor) => (
        <span
          key={"meteor" + meteor.id}
          className={cn(
            "animate-meteor-effect absolute h-2 w-2 rounded-full rotate-[215deg] opacity-90",
            // Light theme: blue-400, dark theme: blue-300
            "bg-blue-400 dark:bg-blue-300",
            "shadow-[0_0_12px_4px_rgba(96,165,250,0.8)] dark:shadow-[0_0_12px_4px_rgba(147,197,253,0.9)]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-1/2 before:w-24 before:h-2",
            // Meteor trail gradient
            "before:bg-gradient-to-r before:from-blue-500 dark:before:from-blue-400 before:to-transparent",
            className
          )}
          style={{
            top: "-100px",
            left: meteor.left,
            animationDelay: meteor.delay,
            animationDuration: meteor.duration,
          }}
        ></span>
      ))}
    </>
  );
};
