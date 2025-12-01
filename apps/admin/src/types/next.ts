// Type helper for Next.js App Router page components
// This creates a type for pages with dynamic route params

type ExtractParams<T extends string> = T extends `${string}[${infer Param}]${infer Rest}`
  ? { [K in Param]: string } & ExtractParams<Rest>
  : {};

export type PageProps<T extends string = string> = {
  params: Promise<ExtractParams<T>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

