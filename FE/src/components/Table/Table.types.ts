interface IColumn<T> {
    key: string;
    title: string;
    render?: (item: T) => React.ReactNode;
    width?: string;
}

interface ICustomTableProps<T> {
    columns: IColumn<T>[];
    data: T[];
    total?: number;
    pageSize?: number;
    current?: number;
    onPageChange?: (page: number, pageSize: number) => void;
    noData: React.ReactElement | null;
}

export type { IColumn, ICustomTableProps as CustomTableProps };