'use client';

import { parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs';
import { useQueryState } from 'nuqs';
import DataTable from '@/components/data-table';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { usePlansTableCols } from './use-plans-table-cols';

const activeOptions = ['all', 'active', 'inactive'] as const;

export default function PlansTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [take, setTake] = useQueryState('take', parseAsInteger.withDefault(10));
  const [isActive] = useQueryState('isActive', parseAsStringLiteral(activeOptions).withDefault('all'));
  const [q] = useQueryState('q', parseAsString.withDefault(''));

  const { data, isLoading } = useQuery(
    orpc.subscriptionPlans.list.queryOptions({
      input: {
        page,
        take,
        q: q || undefined,
        isActive: isActive === 'all' ? undefined : isActive === 'active',
      },
    })
  );

  const columns = usePlansTableCols();

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

