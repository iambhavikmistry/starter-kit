import type { Column } from '@tanstack/react-table';
import { SearchIcon } from 'lucide-react';
import { useId, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type FilterProps<TData> = {
    column: Column<TData, unknown>;
};

export function DataTableFilter<TData>({ column }: FilterProps<TData>) {
    const id = useId();
    const columnFilterValue = column.getFilterValue();
    const { filterVariant } = column.columnDef.meta ?? {};
    const columnHeader =
        typeof column.columnDef.header === 'string'
            ? column.columnDef.header
            : '';

    const sortedUniqueValues = useMemo(() => {
        if (filterVariant === 'range') {
            return [];
        }

        const values = Array.from(column.getFacetedUniqueValues().keys());

        const flattenedValues = values.reduce<string[]>((acc, curr) => {
            if (Array.isArray(curr)) {
                return [...acc, ...curr];
            }

            return [...acc, curr];
        }, []);

        return Array.from(new Set(flattenedValues)).sort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [column.getFacetedUniqueValues(), filterVariant]);

    if (filterVariant === 'select') {
        return (
            <div className="w-full space-y-2">
                <Label htmlFor={`${id}-select`}>
                    Select {columnHeader}
                </Label>
                <Select
                    value={columnFilterValue?.toString() ?? 'all'}
                    onValueChange={(value) => {
                        column.setFilterValue(
                            value === 'all' ? undefined : value,
                        );
                    }}
                >
                    <SelectTrigger
                        id={`${id}-select`}
                        className="w-full capitalize"
                    >
                        <SelectValue
                            placeholder={`Select ${columnHeader}`}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {sortedUniqueValues.map((value) => (
                            <SelectItem
                                key={String(value)}
                                value={String(value)}
                                className="capitalize"
                            >
                                {String(value)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xs">
            <Label htmlFor={`${id}-input`} className="sr-only">
                {columnHeader}
            </Label>
            <div className="relative">
                <Input
                    id={`${id}-input`}
                    className="peer pl-9"
                    value={(columnFilterValue ?? '') as string}
                    onChange={(e) => column.setFilterValue(e.target.value)}
                    placeholder={`Search ${columnHeader.toLowerCase()}...`}
                    type="text"
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                    <SearchIcon size={16} />
                </div>
            </div>
        </div>
    );
}
