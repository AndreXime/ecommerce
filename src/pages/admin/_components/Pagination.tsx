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
		<div className="flex items-center justify-between mt-4 text-sm text-gray-600">
			<span>
				{meta.total} resultado{meta.total !== 1 ? "s" : ""}
			</span>
			<div className="flex items-center gap-2">
				<button
					onClick={() => onChange(page - 1)}
					disabled={page <= 1}
					className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
				>
					<ChevronLeft class="w-4 h-4" />
				</button>
				<span className="font-medium">
					{page} / {meta.totalPages}
				</span>
				<button
					onClick={() => onChange(page + 1)}
					disabled={page >= meta.totalPages}
					className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
				>
					<ChevronRight class="w-4 h-4" />
				</button>
			</div>
		</div>
	);
}

