import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...rest}
    />
  );
}
