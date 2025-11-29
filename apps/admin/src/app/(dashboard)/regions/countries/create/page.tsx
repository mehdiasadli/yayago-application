import PageHeader from '@/components/page-header';
import CreateCountryForm from './create-country-form';

export default function CountriesCreatePage() {
  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Create Country' description='Create a new country' />
      <CreateCountryForm />
    </div>
  );
}
