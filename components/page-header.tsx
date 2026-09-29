interface PageHeaderProps {
  title: string
  description: string
}

export const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-2 px-6 pt-6 pb-2">
      <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
