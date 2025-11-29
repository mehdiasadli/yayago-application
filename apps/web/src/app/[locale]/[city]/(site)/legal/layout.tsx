export default function LegalLayout({ children }: LayoutProps<'/[locale]/[city]/legal'>) {
  return <div className='container mx-auto mt-12 text-justify'>{children}</div>;
}
