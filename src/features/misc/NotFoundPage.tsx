import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconHome } from '@/components/ui/icons';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        title="Страница не найдена"
        description="Возможно, ссылка устарела. Вернитесь на главную кабинета."
        icon={<IconHome width={22} height={22} />}
        action={
          <Link
            to="/"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong"
          >
            На главную
          </Link>
        }
      />
    </div>
  );
}
