import { ChevronLeft, ChevronRight } from "lucide-preact";

export type Meta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

interface PaginationProps {
	meta: Meta;
	page: number;
	onChange: (page: number) => void;
}

export function Pagination({ meta, page, onChange }: PaginationProps) {
	return (
		<div className="flex items-center justify-between mt-4 text-sm text-muted">
			<span>
				{meta.total} resultado{meta.total !== 1 ? "s" : ""}
			</span>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => onChange(page - 1)}
					disabled={page <= 1}
					className="p-1.5 rounded-[var(--radius-input)] border border-rule hover:bg-paper-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
					aria-label="Página anterior"
				>
					<ChevronLeft class="w-4 h-4" aria-hidden="true" />
				</button>
				<span className="font-medium text-ink min-w-[4rem] text-center">
					{page} / {meta.totalPages}
				</span>
				<button
					type="button"
					onClick={() => onChange(page + 1)}
					disabled={page >= meta.totalPages}
					className="p-1.5 rounded-[var(--radius-input)] border border-rule hover:bg-paper-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
					aria-label="Próxima página"
				>
					<ChevronRight class="w-4 h-4" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}
