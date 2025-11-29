'use client';

import DataTable from '@/components/data-table';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useVehicleBrandsTableCols } from './use-vehicle-brands-table-cols';

export default function VehiclesTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [take, setTake] = useQueryState('take', parseAsInteger.withDefault(10));
  const [q] = useQueryState('q', parseAsString.withDefault(''));

  const { data, isLoading } = useQuery(
    orpc.vehicleBrands.list.queryOptions({
      input: {
        page,
        take,
        q: q || undefined,
      },
    })
  );

  const columns = useVehicleBrandsTableCols();

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      page={page}
      onPageChange={setPage}
      pageSize={take}
      onPageSizeChange={setTake}
    />
  );
}
