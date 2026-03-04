import * as XLSX from 'xlsx';

const sanitize = (rows) =>
    rows.map(row =>
        Object.fromEntries(
            Object.entries(row).map(([k, v]) => [
                k,
                typeof v === 'bigint' ? Number(v) : v instanceof Date ? v.toISOString() : v,
            ])
        )
    );

export const exportToExcel = (rows, filename = 'export') => {
    const ws = XLSX.utils.json_to_sheet(sanitize(rows));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}.xlsx`);
};
