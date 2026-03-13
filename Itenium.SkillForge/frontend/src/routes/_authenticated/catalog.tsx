import { createFileRoute } from '@tanstack/react-router';
import { Catalog } from '@/pages/Catalog';

export const Route = createFileRoute('/_authenticated/catalog')({
  component: Catalog,
});
