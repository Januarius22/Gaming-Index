import styles from "@/components/ui/AppLoader.module.css";

export default function AppLoader({
  label = "Loading Gaming Index",
  helper = "Preparing your marketplace workspace."
}: {
  label?: string;
  helper?: string;
}) {
  return (
    <div className={styles.shell} role="status" aria-live="polite">
      <div className={styles.panel}>
        {/* Source idea: pasted HTML used <div class="loader8"></div>. */}
        <div className={styles.loader} aria-hidden="true" />
        <p className={styles.text}>{label}</p>
        {helper ? <p className={styles.subtext}>{helper}</p> : null}
      </div>
    </div>
  );
}
