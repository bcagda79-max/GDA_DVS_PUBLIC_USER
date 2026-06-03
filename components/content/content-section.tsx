import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContentSectionProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function ContentSection({
  title,
  description,
  eyebrow,
  children,
  className,
  id,
}: ContentSectionProps) {
  return (
    <section id={id} className={cn("content-section", className)}>
      {eyebrow ? <p className="content-section__eyebrow">{eyebrow}</p> : null}
      <h2 className="content-section__title">{title}</h2>
      {description ? <p className="content-section__lead">{description}</p> : null}
      {children}
    </section>
  );
}
