'use client';

import { parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs';
import { useQueryState } from 'nuqs';
import { PlaceStatusSchema } from '@yayago-app/db/enums';
import DataTable from '@/components/data-table';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { useRegionsTableCols } from './use-regions-table-cols';

export default function RegionsTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [take, setTake] = useQueryState('take', parseAsInteger.withDefault(10));
  const [status] = useQueryState('status', parseAsStringLiteral(PlaceStatusSchema.options));
  const [q] = useQueryState('q', parseAsString.withDefault(''));

  const { data, isLoading } = useQuery(
    orpc.countries.list.queryOptions({
      input: {
        page,
        take,
        q,
        status: status || undefined,
      },
    })
  );

  const columns = useRegionsTableCols();

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
