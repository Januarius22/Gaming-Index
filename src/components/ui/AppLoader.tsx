import styles from "@/components/ui/AppLoader.module.css";

export default function AppLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className={styles.shell} role="status" aria-label={label} aria-live="polite">
      <div className={styles.panel}>
        {/* Source idea: pasted HTML used <div class="loader8"></div>. */}
        <div className={styles.loader} aria-hidden="true" />
      </div>
    </div>
  );
}
