"use client";

import { useEffect } from "react";

export default function CursorShade() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const moveShade = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        root.style.setProperty("--gi-cursor-x", `${event.clientX}px`);
        root.style.setProperty("--gi-cursor-y", `${event.clientY}px`);
        root.classList.add("gi-cursor-active");
      });
    };

    const hideShade = () => {
      root.classList.remove("gi-cursor-active");
    };

    window.addEventListener("pointermove", moveShade, { passive: true });
    window.addEventListener("pointerleave", hideShade);
    window.addEventListener("blur", hideShade);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", moveShade);
      window.removeEventListener("pointerleave", hideShade);
      window.removeEventListener("blur", hideShade);
      root.classList.remove("gi-cursor-active");
      root.style.removeProperty("--gi-cursor-x");
      root.style.removeProperty("--gi-cursor-y");
    };
  }, []);

  return <div aria-hidden="true" className="gi-cursor-shade" />;
}
