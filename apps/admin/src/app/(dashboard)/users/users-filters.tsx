'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { Search, Filter, X } from 'lucide-react';
import { UserRoleSchema } from '@yayago-app/db/enums';
import { Button } from '@/components/ui/button';
import { formatEnumValue } from '@/lib/utils';

export default function UsersFilters() {
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [role, setRole] = useQueryState('role', parseAsString.withDefault(''));
  const [banned, setBanned] = useQueryState('banned', parseAsString.withDefault(''));

  const hasFilters = search || role || banned;

  const clearFilters = () => {
    setSearch('');
    setRole('');
    setBanned('');
  };

  return (
    <div className='flex flex-col gap-4 p-4 rounded-lg border bg-card'>
      <div className='flex items-center gap-2'>
        <Filter className='size-4 text-muted-foreground' />
        <span className='text-sm font-medium'>Filters</span>
        {hasFilters && (
          <Button variant='ghost' size='sm' onClick={clearFilters} className='ml-auto h-7 text-xs'>
            <X className='size-3' />
            Clear all
          </Button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {/* Search */}
        <div className='relative md:col-span-2'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            placeholder='Search by name, email, or username...'
            value={search}
            onChange={(e) => setSearch(e.target.value || '')}
            className='pl-9'
          />
        </div>

        {/* Role Filter */}
        <Select value={role} onValueChange={(value) => setRole(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder='All roles' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All roles</SelectItem>
            {UserRoleSchema.options.map((roleOption) => (
              <SelectItem key={roleOption} value={roleOption}>
                {formatEnumValue(roleOption)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={banned} onValueChange={(value) => setBanned(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='banned'>Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

