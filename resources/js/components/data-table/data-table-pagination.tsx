import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';

type PaginationMeta = {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
};

export function DataTablePagination({ pagination, onPageChange }: Props) {
    const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
        currentPage: pagination.currentPage,
        totalPages: pagination.lastPage,
        paginationItemsToDisplay: 3,
    });

    if (pagination.lastPage <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col">
            <p
                className="text-muted-foreground text-sm whitespace-nowrap"
                aria-live="polite"
            >
                Showing{' '}
                <span className="font-medium">
                    {pagination.from ?? 0} to {pagination.to ?? 0}
                </span>{' '}
                of{' '}
                <span className="font-medium">
                    {pagination.total} entries
                </span>
            </p>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <Button
                            className="disabled:pointer-events-none disabled:opacity-50"
                            variant="ghost"
                            onClick={() =>
                                onPageChange(pagination.currentPage - 1)
                            }
                            disabled={pagination.currentPage <= 1}
                            aria-label="Go to previous page"
                        >
                            <ChevronLeftIcon aria-hidden="true" />
                            <span className="max-sm:hidden">Previous</span>
                        </Button>
                    </PaginationItem>

                    {showLeftEllipsis && (
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                    )}

                    {pages.map((page) => {
                        const isActive = page === pagination.currentPage;

                        return (
                            <PaginationItem key={page}>
                                <Button
                                    size="icon"
                                    variant={isActive ? 'default' : 'ghost'}
                                    onClick={() => onPageChange(page)}
                                    aria-current={
                                        isActive ? 'page' : undefined
                                    }
                                >
                                    {page}
                                </Button>
                            </PaginationItem>
                        );
                    })}

                    {showRightEllipsis && (
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                    )}

                    <PaginationItem>
                        <Button
                            className="disabled:pointer-events-none disabled:opacity-50"
                            variant="ghost"
                            onClick={() =>
                                onPageChange(pagination.currentPage + 1)
                            }
                            disabled={
                                pagination.currentPage >= pagination.lastPage
                            }
                            aria-label="Go to next page"
                        >
                            <span className="max-sm:hidden">Next</span>
                            <ChevronRightIcon aria-hidden="true" />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
