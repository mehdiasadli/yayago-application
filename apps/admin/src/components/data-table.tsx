import { flexRender, getCoreRowModel } from '@tanstack/react-table';
import { ColumnDef, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Skeleton } from './ui/skeleton';
import { DataTablePagination } from './data-table-pagination';
import { useEffect } from 'react';
import { FrameFooter } from './ui/frame';

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    take: number;
    total: number;
    totalPages: number;
  };
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: PaginatedResponse<TData> | undefined;
  isLoading?: boolean;

  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const tableData = data?.items || [];
  const totalPages = data?.pagination.totalPages || 0;
  const totalRecords = data?.pagination.total || 0;

  const table = useReactTable({
    data: tableData,
    columns,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: Math.max(0, page - 1),
        pageSize: pageSize,
      },
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: (updater) => {
      const currentPagination = {
        pageIndex: Math.max(0, page - 1),
        pageSize,
      };

      const newPagination = typeof updater === 'function' ? updater(currentPagination) : updater;

      if (newPagination.pageIndex !== currentPagination.pageIndex) {
        onPageChange(newPagination.pageIndex + 1);
      }

      if (newPagination.pageSize !== currentPagination.pageSize) {
        onPageSizeChange(newPagination.pageSize);
      }
    },
  });

  useEffect(() => {
    const currentState = table.getState().pagination;
    const expectedPageIndex = Math.max(0, page - 1);

    if (currentState.pageIndex !== expectedPageIndex || currentState.pageSize !== pageSize) {
      table.setPagination({
        pageIndex: expectedPageIndex,
        pageSize: pageSize,
      });
    }
  }, [page, pageSize, table]);

  return (
    <div className='space-y-4'>
      <div className='rounded-md border bg-background'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton className='h-6 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} total={totalRecords} isLoading={isLoading} />
    </div>
  );
}
