'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { parseAsInteger, useQueryState } from 'nuqs';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  total: number;
  isLoading?: boolean;
}

export function DataTablePagination<TData>({ table, total, isLoading }: DataTablePaginationProps<TData>) {
  const [currentPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState('take', parseAsInteger.withDefault(10));

  const pageCount = table.getPageCount();

  const getPageNumbers = () => {
    if (pageCount <= 0) return [];

    const last = pageCount;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= last; i++) {
      if (i == 1 || i == last || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 py-4'>
      <div className='flex items-center gap-6 text-sm text-muted-foreground'>
        <div className='whitespace-nowrap'>{isLoading && total === 0 ? 'Loading...' : `${total.toLocaleString()} results`}</div>

        <div className='flex items-center space-x-2'>
          <p className='hidden text-sm font-medium sm:block'>Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              setPageSize(Number(value));
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side='top'>
              {[5, 10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <Button variant='outline' className='h-8 w-8 p-0' onClick={() => table.previousPage()} disabled={currentPage <= 1}>
          <span className='sr-only'>Go to previous page</span>
          <ChevronLeft className='h-4 w-4' />
        </Button>

        <div className='flex items-center gap-1'>
          {getPageNumbers().map((page, idx) =>
            typeof page === 'string' ? (
              <span key={idx} className='px-2 text-muted-foreground'>
                ...
              </span>
            ) : (
              <Button
                key={idx}
                variant={page === currentPage ? 'default' : 'outline'}
                className='h-8 w-8 p-0'
                onClick={() => table.setPageIndex(page - 1)}
              >
                {page}
              </Button>
            )
          )}
        </div>

        <Button variant='outline' className='h-8 w-8 p-0' onClick={() => table.nextPage()} disabled={currentPage >= pageCount}>
          <span className='sr-only'>Go to next page</span>
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

