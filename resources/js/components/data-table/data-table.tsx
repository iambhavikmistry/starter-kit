import type {
    ColumnDef,
    ColumnFiltersState,
    PaginationState,
    RowData,
} from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    FileSpreadsheetIcon,
    FileTextIcon,
    SearchIcon,
    UploadIcon,
} from 'lucide-react';
import Papa from 'papaparse';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DataTableFilter } from './data-table-filter';
import {
    DataTableFilters,
    type ServerFilterConfig,
} from './data-table-filters';
import { DataTablePagination } from './data-table-pagination';

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: 'text' | 'range' | 'select';
    }
}

type PaginationMeta = {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
};

type DataTableProps<TData> = {
    columns: ColumnDef<TData>[];
    data: TData[];
    pagination?: PaginationMeta;
    onPageChange?: (page: number) => void;
    pageSize?: number;
    toolbar?: ReactNode;
    exportFileName?: string;
    enableExport?: boolean;
    enablePageSizeSelector?: boolean;

    /** Client-side search: column key to filter */
    searchColumn?: string;
    /** Client-side filters: column keys that have faceted filter UI */
    filterColumns?: string[];

    /** Server-side search */
    serverSearchValue?: string;
    onServerSearchChange?: (value: string) => void;
    serverSearchPlaceholder?: string;

    /** Server-side filters (Drawer/Sheet UI) */
    serverFilters?: ServerFilterConfig[];
    serverFilterValues?: Record<string, string>;
    onServerFilterApply?: (values: Record<string, string>) => void;
    onServerFilterClear?: () => void;

    /** Server-side per-page size change */
    onPerPageChange?: (perPage: number) => void;
    pageSizeOptions?: number[];
};

export function DataTable<TData>({
    columns,
    data,
    pagination,
    onPageChange,
    pageSize = 10,
    toolbar,
    exportFileName = 'export',
    enableExport = false,
    enablePageSizeSelector = true,

    searchColumn,
    filterColumns = [],

    serverSearchValue,
    onServerSearchChange,
    serverSearchPlaceholder = 'Search...',

    serverFilters,
    serverFilterValues,
    onServerFilterApply,
    onServerFilterClear,

    onPerPageChange,
    pageSizeOptions = [5, 10, 25, 50],
}: DataTableProps<TData>) {
    const isServerSearch = serverSearchValue !== undefined && !!onServerSearchChange;
    const isServerFiltered = !!serverFilters && !!onServerFilterApply;

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: pageSize,
    });
    const [localSearch, setLocalSearch] = useState(serverSearchValue ?? '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isServerPaginated = !!pagination && !!onPageChange;

    useEffect(() => {
        if (isServerSearch) {
            setLocalSearch(serverSearchValue);
        }
    }, [serverSearchValue, isServerSearch]);

    const handleSearchChange = (value: string) => {
        setLocalSearch(value);

        if (isServerSearch) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                onServerSearchChange(value);
            }, 400);
        }
    };

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            ...(!isServerPaginated ? { pagination: paginationState } : {}),
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        enableSortingRemoval: false,
        ...(!isServerPaginated
            ? {
                  getPaginationRowModel: getPaginationRowModel(),
                  onPaginationChange: setPaginationState,
              }
            : {}),
    });

    const clientActiveFilterCount = columnFilters.filter(
        (f) =>
            f.value !== undefined &&
            f.value !== '' &&
            filterColumns.includes(f.id),
    ).length;

    const clearClientFilters = () => {
        filterColumns.forEach((colId) => {
            table.getColumn(colId)?.setFilterValue(undefined);
        });
    };

    const exportData = (format: 'csv' | 'excel' | 'json') => {
        const selectedRows = table.getSelectedRowModel().rows;
        const dataToExport =
            selectedRows.length > 0
                ? selectedRows.map((row) => row.original)
                : table.getFilteredRowModel().rows.map((row) => row.original);

        const dateStr = new Date().toISOString().split('T')[0];

        if (format === 'csv') {
            const csv = Papa.unparse(
                dataToExport as Record<string, unknown>[],
                { header: true },
            );
            downloadFile(
                csv,
                `${exportFileName}-${dateStr}.csv`,
                'text/csv;charset=utf-8;',
            );
        } else if (format === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(
                dataToExport as Record<string, unknown>[],
            );
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
            XLSX.writeFile(workbook, `${exportFileName}-${dateStr}.xlsx`);
        } else {
            const json = JSON.stringify(dataToExport, null, 2);
            downloadFile(
                json,
                `${exportFileName}-${dateStr}.json`,
                'application/json',
            );
        }
    };

    const clientPaginationMeta = !isServerPaginated
        ? {
              currentPage: paginationState.pageIndex + 1,
              lastPage: table.getPageCount(),
              perPage: paginationState.pageSize,
              total: table.getRowCount(),
              from: paginationState.pageIndex * paginationState.pageSize + 1,
              to: Math.min(
                  (paginationState.pageIndex + 1) * paginationState.pageSize,
                  table.getRowCount(),
              ),
          }
        : null;

    const hasClientFilters = !isServerFiltered && filterColumns.length > 0;

    return (
        <div className="w-full">
            <div className="border-b">
                <div className="flex gap-4 p-6 max-sm:flex-col sm:items-center sm:justify-between">
                    {/* Search: server-side or client-side */}
                    {isServerSearch ? (
                        <div className="w-full max-w-xs">
                            <Label htmlFor="server-search" className="sr-only">
                                Search
                            </Label>
                            <div className="relative">
                                <Input
                                    id="server-search"
                                    className="peer pl-9"
                                    value={localSearch}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    placeholder={serverSearchPlaceholder}
                                    type="text"
                                />
                                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                                    <SearchIcon size={16} />
                                </div>
                            </div>
                        </div>
                    ) : searchColumn && table.getColumn(searchColumn) ? (
                        <DataTableFilter
                            column={table.getColumn(searchColumn)!}
                        />
                    ) : (
                        <div />
                    )}

                    <div className="flex flex-wrap items-center gap-3 sm:justify-between">
                        {/* Filters: server-side or client-side */}
                        {isServerFiltered && serverFilterValues && (
                            <DataTableFilters
                                mode="server"
                                filters={serverFilters}
                                values={serverFilterValues}
                                onApply={onServerFilterApply}
                                onClear={onServerFilterClear ?? (() => {})}
                            />
                        )}

                        {hasClientFilters && (
                            <DataTableFilters
                                activeFilterCount={clientActiveFilterCount}
                                onClearFilters={clearClientFilters}
                            >
                                {filterColumns.map((colId) => {
                                    const column = table.getColumn(colId);
                                    if (!column) {
                                        return null;
                                    }
                                    return (
                                        <DataTableFilter
                                            key={colId}
                                            column={column}
                                        />
                                    );
                                })}
                            </DataTableFilters>
                        )}

                        {enablePageSizeSelector && (
                            <div className="flex items-center gap-2">
                                <Label htmlFor="rowSelect" className="sr-only">
                                    Show
                                </Label>
                                <Select
                                    value={
                                        isServerPaginated
                                            ? pagination.perPage.toString()
                                            : paginationState.pageSize.toString()
                                    }
                                    onValueChange={(value) => {
                                        const size = Number(value);
                                        if (
                                            isServerPaginated &&
                                            onPerPageChange
                                        ) {
                                            onPerPageChange(size);
                                        } else {
                                            table.setPageSize(size);
                                        }
                                    }}
                                >
                                    <SelectTrigger
                                        id="rowSelect"
                                        className="w-fit whitespace-nowrap"
                                    >
                                        <SelectValue placeholder="Rows" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pageSizeOptions.map((size) => (
                                            <SelectItem
                                                key={size}
                                                value={size.toString()}
                                            >
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {enableExport && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <UploadIcon />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => exportData('csv')}
                                    >
                                        <FileTextIcon className="mr-2 size-4" />
                                        Export as CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => exportData('excel')}
                                    >
                                        <FileSpreadsheetIcon className="mr-2 size-4" />
                                        Export as Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => exportData('json')}
                                    >
                                        <FileTextIcon className="mr-2 size-4" />
                                        Export as JSON
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {toolbar}
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="h-14 border-t"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{
                                            width: `${header.getSize()}px`,
                                        }}
                                        className="text-muted-foreground first:pl-4 last:px-4"
                                    >
                                        {header.isPlaceholder ? null : header
                                              .column.getCanSort() ? (
                                            <div
                                                className={cn(
                                                    'flex h-full cursor-pointer items-center justify-between gap-2 select-none',
                                                )}
                                                onClick={header.column.getToggleSortingHandler()}
                                                onKeyDown={(e) => {
                                                    if (
                                                        header.column.getCanSort() &&
                                                        (e.key === 'Enter' ||
                                                            e.key === ' ')
                                                    ) {
                                                        e.preventDefault();
                                                        header.column.getToggleSortingHandler()?.(
                                                            e,
                                                        );
                                                    }
                                                }}
                                                tabIndex={
                                                    header.column.getCanSort()
                                                        ? 0
                                                        : undefined
                                                }
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                                {{
                                                    asc: (
                                                        <ChevronUpIcon
                                                            className="shrink-0 opacity-60"
                                                            size={16}
                                                            aria-hidden="true"
                                                        />
                                                    ),
                                                    desc: (
                                                        <ChevronDownIcon
                                                            className="shrink-0 opacity-60"
                                                            size={16}
                                                            aria-hidden="true"
                                                        />
                                                    ),
                                                }[
                                                    header.column.getIsSorted() as string
                                                ] ?? null}
                                            </div>
                                        ) : (
                                            flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                    className="hover:bg-muted/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="h-14 first:pl-4 last:px-4"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {isServerPaginated ? (
                <DataTablePagination
                    pagination={pagination}
                    onPageChange={onPageChange}
                />
            ) : (
                clientPaginationMeta &&
                clientPaginationMeta.lastPage > 1 && (
                    <DataTablePagination
                        pagination={clientPaginationMeta}
                        onPageChange={(page) =>
                            table.setPageIndex(page - 1)
                        }
                    />
                )
            )}
        </div>
    );
}

function downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
