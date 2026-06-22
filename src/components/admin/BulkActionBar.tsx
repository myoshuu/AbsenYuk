"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BulkActionBarProps {
  selectedCount: number;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onBulkChangeRole?: () => void;
}

export default function BulkActionBar({
  selectedCount,
  onDeselectAll,
  onBulkDelete,
  onBulkChangeRole,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-ink text-white px-5 py-3 rounded-2xl shadow-xl"
        >
          <span className="text-sm font-medium whitespace-nowrap">{selectedCount} item dipilih</span>
          <div className="w-px h-5 bg-white/20" />
          <div className="flex items-center gap-2">
            {onBulkChangeRole && (
              <button
                onClick={onBulkChangeRole}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald hover:bg-emerald/80 transition-colors"
              >
                Ubah Role
              </button>
            )}
            <button
              onClick={onBulkDelete}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-error hover:bg-error/80 transition-colors"
            >
              Hapus
            </button>
            <button
              onClick={onDeselectAll}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              Deselect
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
