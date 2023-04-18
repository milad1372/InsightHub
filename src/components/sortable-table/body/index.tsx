export interface TableColumn {
  label: string;
  accessor: string;
  sortable: boolean;
  formatter?: (i: number, data: any, decimalPlaces?: number) => any;
  style?: (data: any) => React.CSSProperties;
  decimalPlaces?: number;
}

const roundNumberFormatter = (i: number, data: any, decimalPlaces = 0) => {
  console.log(data); // log the data to the console
  if (typeof data !== 'number') {
    return data;
  }
  return data.toFixed(decimalPlaces);
};

interface TableBodyProps {
  tableData: any[];
  columns: TableColumn[];
}

const TableBody = ({ tableData, columns }: TableBodyProps) => {
  return (
    <tbody>
      {tableData.map((data, index: number) => {
        return (
          <tr key={data.language_name}>
            {columns.map(({ accessor, formatter, style, decimalPlaces }) => {
              // console.log(data[accessor]); // log the data to the console
              const tData = formatter
                ? formatter(index, data[accessor])
                : data[accessor]
                ? data[accessor]
                : '——';
              return (
                <td key={accessor} style={style ? style(data[accessor]) : undefined}>
                  {tData}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
};

const columns: TableColumn[] = [
  {
    label: 'Language Name',
    accessor: 'language_name',
    sortable: true
  },
  {
    label: 'Year',
    accessor: 'year',
    sortable: true
  },
  {
    label: 'Count',
    accessor: 'count',
    sortable: true
  },
  {
    label: 'Lag Count',
    accessor: 'lag_count',
    sortable: true
  },
  {
    label: 'YoY Change',
    accessor: 'yoy_change',
    sortable: true,
    formatter: (i, data, decimalPlaces = 2) => roundNumberFormatter(i, data, decimalPlaces),
    decimalPlaces: 2 // specify 2 decimal places for the yoy_change column
  }
];

export default TableBody;
