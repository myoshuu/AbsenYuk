"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate visible page numbers with ellipsis
  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 1; // Pages to show on each side of current

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // First page
        i === totalPages || // Last page
        (i >= currentPage - delta && i <= currentPage + delta) // Near current
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis");
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between gap-4 mt-4">
      {/* Info text */}
      {totalItems !== undefined && (
        <p className="text-sm text-ink-muted">
          Menampilkan {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, totalItems)} dari {totalItems}
        </p>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, i) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-2 py-2 text-ink-muted">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? "bg-emerald text-white"
                  : "text-ink-muted hover:text-ink hover:bg-ink/5"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
