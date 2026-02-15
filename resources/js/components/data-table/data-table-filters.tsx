import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

export type ServerFilterOption = {
    value: string;
    label: string;
};

export type ServerFilterConfig = {
    key: string;
    label: string;
    type: 'select' | 'text';
    options?: ServerFilterOption[];
    placeholder?: string;
};

type ClientFilterProps = {
    mode?: 'client';
    children: ReactNode;
    activeFilterCount: number;
    onClearFilters: () => void;
};

type ServerFilterProps = {
    mode: 'server';
    children?: never;
    filters: ServerFilterConfig[];
    values: Record<string, string>;
    onApply: (values: Record<string, string>) => void;
    onClear: () => void;
};

type DataTableFiltersProps = ClientFilterProps | ServerFilterProps;

function ServerFilterFields({
    filters,
    values,
    onChange,
}: {
    filters: ServerFilterConfig[];
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
}) {
    return (
        <div className="flex flex-col gap-6 p-1">
            {filters.map((filter) => {
                if (filter.type === 'select' && filter.options) {
                    return (
                        <div key={filter.key} className="w-full space-y-2">
                            <Label htmlFor={`filter-${filter.key}`}>
                                {filter.label}
                            </Label>
                            <Select
                                value={values[filter.key] || 'all'}
                                onValueChange={(val) =>
                                    onChange(
                                        filter.key,
                                        val === 'all' ? '' : val,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id={`filter-${filter.key}`}
                                    className="w-full capitalize"
                                >
                                    <SelectValue
                                        placeholder={
                                            filter.placeholder ??
                                            `Select ${filter.label}`
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {filter.options.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                            className="capitalize"
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    );
                }

                return (
                    <div key={filter.key} className="w-full space-y-2">
                        <Label htmlFor={`filter-${filter.key}`}>
                            {filter.label}
                        </Label>
                        <div className="relative">
                            <Input
                                id={`filter-${filter.key}`}
                                className="peer pl-9"
                                value={values[filter.key] || ''}
                                onChange={(e) =>
                                    onChange(filter.key, e.target.value)
                                }
                                placeholder={
                                    filter.placeholder ??
                                    `Filter by ${filter.label.toLowerCase()}...`
                                }
                                type="text"
                            />
                            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                                <SearchIcon size={16} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function DataTableFilters(props: DataTableFiltersProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

    const isServer = props.mode === 'server';

    const [draft, setDraft] = useState<Record<string, string>>(
        isServer ? { ...props.values } : {},
    );

    const handleOpen = (nextOpen: boolean) => {
        if (nextOpen && isServer) {
            setDraft({ ...props.values });
        }
        setOpen(nextOpen);
    };

    const handleDraftChange = (key: string, value: string) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const activeCount = isServer
        ? Object.values(props.values).filter((v) => v !== '' && v != null)
              .length
        : props.activeFilterCount;

    const handleApply = () => {
        if (isServer) {
            props.onApply(draft);
        }
        setOpen(false);
    };

    const handleClear = () => {
        if (isServer) {
            const cleared: Record<string, string> = {};
            props.filters.forEach((f) => {
                cleared[f.key] = '';
            });
            setDraft(cleared);
            props.onClear();
        } else {
            props.onClearFilters();
        }
        setOpen(false);
    };

    const triggerButton = (
        <Button variant="outline" className="relative">
            <FilterIcon className="size-4" />
            Filters
            {activeCount > 0 && (
                <Badge className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full p-0 text-[10px]">
                    {activeCount}
                </Badge>
            )}
        </Button>
    );

    const content = isServer ? (
        <ServerFilterFields
            filters={props.filters}
            values={draft}
            onChange={handleDraftChange}
        />
    ) : (
        <div className="flex flex-col gap-6 p-1">{props.children}</div>
    );

    const footer = (
        <div className="flex items-center gap-2">
            {activeCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClear}>
                    <XIcon className="mr-1 size-3.5" />
                    Clear all
                </Button>
            )}
            <Button size="sm" className="ml-auto" onClick={handleApply}>
                Apply
            </Button>
        </div>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={handleOpen}>
                <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Filters</DrawerTitle>
                        <DrawerDescription>
                            Narrow down results using the filters below.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="overflow-y-auto px-4">{content}</div>
                    <DrawerFooter>{footer}</DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Sheet open={open} onOpenChange={handleOpen}>
            <SheetTrigger asChild>{triggerButton}</SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                        Narrow down results using the filters below.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-4">{content}</div>
                <SheetFooter>{footer}</SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
