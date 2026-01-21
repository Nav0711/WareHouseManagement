import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            {columns.map((column, index) => (
              <TableHead
                key={String(column.key) + index}
                className={cn(
                  'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                  column.className
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={cn(
                  'transition-colors border-border',
                  onRowClick && 'cursor-pointer hover:bg-accent/50'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => (
                  <TableCell key={String(column.key) + colIndex} className={column.className}>
                    {column.render
                      ? column.render(row)
                      : (row[column.key as keyof T] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
