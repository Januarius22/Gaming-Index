"use client";

import type { CSSProperties } from "react";
import styles from "@/components/account/PurchaseCelebration.module.css";

const ribbons = [
  { left: "4%", color: "#0057ff", duration: "5.8s", delay: "0s", drift: "38px", rotation: "8deg" },
  { left: "11%", color: "#0f9f6e", duration: "6.6s", delay: "0.8s", drift: "-28px", rotation: "33deg" },
  { left: "19%", color: "#f59e0b", duration: "5.9s", delay: "1.4s", drift: "34px", rotation: "-18deg" },
  { left: "27%", color: "#0057ff", duration: "7.1s", delay: "0.2s", drift: "-42px", rotation: "52deg" },
  { left: "36%", color: "#9cc2ff", duration: "6.1s", delay: "1.1s", drift: "30px", rotation: "-44deg" },
  { left: "45%", color: "#0f9f6e", duration: "6.9s", delay: "0.4s", drift: "-24px", rotation: "16deg" },
  { left: "53%", color: "#f43f5e", duration: "5.7s", delay: "1.7s", drift: "44px", rotation: "70deg" },
  { left: "61%", color: "#0057ff", duration: "7.3s", delay: "0.9s", drift: "-36px", rotation: "-30deg" },
  { left: "70%", color: "#f59e0b", duration: "6.4s", delay: "0.1s", drift: "26px", rotation: "28deg" },
  { left: "78%", color: "#9cc2ff", duration: "5.6s", delay: "1.3s", drift: "-32px", rotation: "-62deg" },
  { left: "87%", color: "#0f9f6e", duration: "6.8s", delay: "0.6s", drift: "36px", rotation: "40deg" },
  { left: "95%", color: "#0057ff", duration: "6.2s", delay: "1.9s", drift: "-26px", rotation: "-10deg" }
];

export default function PurchaseCelebration() {
  return (
    <div className={styles.stage} aria-hidden="true">
      {ribbons.map((ribbon, index) => (
        <span
          key={`${ribbon.left}-${index}`}
          className={styles.ribbon}
          style={
            {
              left: ribbon.left,
              background: ribbon.color,
              "--duration": ribbon.duration,
              "--delay": ribbon.delay,
              "--drift": ribbon.drift,
              "--rotation": ribbon.rotation
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
