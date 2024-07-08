import { theme } from "@easy-messe/libs/theme";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

interface TableData {
    id: number;
    name: string;
    registrationDate: string;
    massType: string;
    startDate: string;
    endDate: string;
    status: string
}
export default function MassOfferTable() {
    const titles = ['No', 'name', "DATE D'ENREGISTREMENT", 'TYPE DE MESSE', 'DATE DEBUT', 'DATE DE FIN', 'STATUS']

    const tableDate: TableData[] = [
        {
            id: 1,
            name: 'Meulak Kouam',
            registrationDate: '2015-01-01',
            massType: 'single',
            startDate: '2015-01-01',
            endDate: '2015-01-01',
            status: '1/1'
        },
        {
            id: 2,
            name: 'Ngamaleu Pierre',
            registrationDate: '2015-01-01',
            massType: 'Tridum',
            startDate: '2015-01-01',
            endDate: '2015-01-01',
            status: '1/2'
        },
        {
            id: 3,
            name: 'Poukam irénée',
            registrationDate: '2015-01-01',
            massType: 'Neuvaine',
            startDate: '2015-01-01',
            endDate: '2015-01-01',
            status: '1/9'
        }
    ]
    return (
        <Table>
            <TableHead>
                <TableRow>
                    {titles.map((title, index) => (
                        <TableCell
                            key={index}
                            sx={{
                                bgcolor: theme.palette.secondary.main
                            }}
                        >
                            {title.toUpperCase()}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {tableDate.map(({
                    id, name, registrationDate,
                    massType, startDate, endDate,
                    status
                }, index) => (
                    <TableRow
                        key={`${index} + ${id} + ${name}`}
                        sx={{
                            color: 'var(--label)'
                        }}
                    >
                        <TableCell>{id}</TableCell>
                        <TableCell sx={{
                            fontWeight: 600,
                            color: 'var(--label)'
                        }}>
                            {name}
                        </TableCell>
                        <TableCell>{registrationDate}</TableCell>
                        <TableCell>{massType}</TableCell>
                        <TableCell>{startDate}</TableCell>
                        <TableCell>{endDate}</TableCell>
                        <TableCell>{status}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
