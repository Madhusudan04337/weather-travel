interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-heading-l font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="text-body text-text-secondary">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
