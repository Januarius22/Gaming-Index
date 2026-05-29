import Link from "next/link";
import Button, { buttonClassName } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function buildPageHref(
  pathname: string,
  page: number,
  query?: Record<string, string | number | null | undefined>
) {
  const searchParams = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || key === "page") {
      return;
    }

    searchParams.set(key, String(value));
  });

  searchParams.set("page", String(page));
  return `${pathname}?${searchParams.toString()}`;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  pathname,
  query,
  className
}: {
  currentPage: number;
  totalPages: number;
  pathname: string;
  query?: Record<string, string | number | null | undefined>;
  className?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) =>
      Math.abs(pageNumber - currentPage) <= 2 ||
      pageNumber === 1 ||
      pageNumber === totalPages
  );
  const uniquePageNumbers = [...new Set(pageNumbers)];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {currentPage > 1 ? (
        <Link href={buildPageHref(pathname, currentPage - 1, query)}>
          <Button variant="secondary" size="sm">
            Previous
          </Button>
        </Link>
      ) : (
        <span
          className={cn(
            buttonClassName({ variant: "secondary", size: "sm" }),
            "pointer-events-none opacity-60"
          )}
        >
          Previous
        </span>
      )}

      {uniquePageNumbers.map((pageNumber, index) => {
        const previousPage = uniquePageNumbers[index - 1];
        const showGap = previousPage && pageNumber - previousPage > 1;

        return (
          <div key={pageNumber} className="flex items-center gap-2">
            {showGap ? <span className="px-1 text-sm text-muted-foreground">...</span> : null}
            <Link href={buildPageHref(pathname, pageNumber, query)}>
              <span
                className={buttonClassName({
                  variant: pageNumber === currentPage ? "primary" : "secondary",
                  size: "sm"
                })}
              >
                {pageNumber}
              </span>
            </Link>
          </div>
        );
      })}

      {currentPage < totalPages ? (
        <Link href={buildPageHref(pathname, currentPage + 1, query)}>
          <Button variant="secondary" size="sm">
            Next
          </Button>
        </Link>
      ) : (
        <span
          className={cn(
            buttonClassName({ variant: "secondary", size: "sm" }),
            "pointer-events-none opacity-60"
          )}
        >
          Next
        </span>
      )}
    </div>
  );
}
