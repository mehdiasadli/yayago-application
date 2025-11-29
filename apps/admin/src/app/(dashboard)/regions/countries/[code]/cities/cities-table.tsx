import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { useCitiesTableCols } from './use-cities-table-cols';
import DataTable from '@/components/data-table';
import { parseAsInteger, parseAsStringLiteral, useQueryState } from 'nuqs';
import { PlaceStatusSchema } from '@yayago-app/db/enums';

interface CitiesTableProps {
  code: string;
}

export default function CitiesTable({ code }: CitiesTableProps) {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [take, setTake] = useQueryState('take', parseAsInteger.withDefault(10));
  const [status] = useQueryState('status', parseAsStringLiteral(PlaceStatusSchema.options));

  const { data: cities, isLoading } = useQuery(
    orpc.cities.list.queryOptions({
      input: { countryCode: code, status: status || undefined },
    })
  );

  const columns = useCitiesTableCols();

  return (
    <DataTable
      data={cities}
      columns={columns}
      isLoading={isLoading}
      page={page}
      onPageChange={setPage}
      pageSize={take}
      onPageSizeChange={setTake}
    />
  );
}
