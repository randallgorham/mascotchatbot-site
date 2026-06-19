"use client";

export default function OpenMascot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const el = document.querySelector("#amp-stage") as HTMLElement | null;
        el?.click();
        el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }}
    >
      {children}
    </button>
  );
}
