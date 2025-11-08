import React from "react";
import { Pagination } from "antd";
import type { CustomTableProps } from "./Table.types";

export function CustomTable<T extends { key: React.Key }>({
	columns,
	data,
	total = 0,
	pageSize = 10,
	current = 1,
	onPageChange,
	noData = null,
}: CustomTableProps<T>) {
	return (
		<div className="custom-table-container">
			<div className="custom-table-header">
				<div className="custom-table-row custom-table-header-row">
					{columns.map((col) => {
						const style = col.width ? { width: col.width } : { flex: 1 };
						return (
							<div key={col.key} className="custom-table-cell" style={style}>
								{col.title}
							</div>
						)
					})}
				</div>
			</div>

			<div className="custom-table-body">
				{data.length === 0 ? (
					<div className="custom-table-empty">{noData}</div>
				) : (
					data.map((item) => (
						<div key={item.key} className="custom-table-row custom-table-body-row">
							{columns.map((col) => {
								const style = col.width ? { width: col.width } : { flex: 1 };
								return (
									<div key={col.key} className="custom-table-cell" style={style}>
										{col.render ? col.render(item) : (item as any)[col.key]}
									</div>
								)
							})}
						</div>
					))
				)}
			</div>

			<div className="custom-table-pagination">
				<Pagination
					total={total}
					pageSize={pageSize}
					current={current}
					onChange={onPageChange}
					showSizeChanger={false}
				/>
			</div>
		</div>
	);
}
