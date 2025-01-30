'use client';

import * as React from 'react';
import { cn } from '@/lib/page';

interface TabsProps {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsContextType {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export function Tabs({ defaultValue, onValueChange, children, className }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue || '');

  React.useEffect(() => {
    if (onValueChange) {
      onValueChange(value);
    }
  }, [value, onValueChange]);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn('tabs', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return <div className={cn('tabs-list flex gap-2 border-b', className)}>{children}</div>;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }

  const { value: activeValue, setValue } = context;

  return (
    <button
      type="button"
      className={cn(
        'tabs-trigger px-4 py-2 text-sm font-medium border-b-2',
        activeValue === value
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-800',
        className
      )}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }

  const { value: activeValue } = context;

  if (activeValue !== value) {
    return null;
  }

  return <div className={cn('tabs-content', className)}>{children}</div>;
}