'use client';

import { parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs';
import { useQueryState } from 'nuqs';
import DataTable from '@/components/data-table';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { useAddonsTableCols } from './use-addons-table-cols';

const activeOptions = ['all', 'active', 'inactive'] as const;
const featuredOptions = ['all', 'featured', 'not-featured'] as const;
const categoryOptions = [
  'all',
  'INSURANCE',
  'PROTECTION',
  'CHILD_SAFETY',
  'NAVIGATION',
  'CONNECTIVITY',
  'COMFORT',
  'WINTER',
  'OUTDOOR',
  'MOBILITY',
  'DRIVER',
  'DELIVERY',
  'FUEL',
  'CLEANING',
  'TOLL',
  'BORDER',
  'PARKING',
  'OTHER',
] as const;

export default function AddonsTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [take, setTake] = useQueryState('take', parseAsInteger.withDefault(10));
  const [isActive] = useQueryState('isActive', parseAsStringLiteral(activeOptions).withDefault('all'));
  const [isFeatured] = useQueryState('isFeatured', parseAsStringLiteral(featuredOptions).withDefault('all'));
  const [category] = useQueryState('category', parseAsStringLiteral(categoryOptions).withDefault('all'));
  const [q] = useQueryState('q', parseAsString.withDefault(''));

  const { data, isLoading } = useQuery(
    orpc.addons.list.queryOptions({
      input: {
        page,
        take,
        q: q || undefined,
        isActive: isActive === 'all' ? undefined : isActive === 'active',
        isFeatured: isFeatured === 'all' ? undefined : isFeatured === 'featured',
        category: category === 'all' ? undefined : (category as any),
      },
    })
  );

  const columns = useAddonsTableCols();

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

