import { Box, Button, Dialog, Typography } from "@mui/material";
import { useIntl } from "react-intl";

interface CancelMassDialogProps {
    isOpen: boolean;
    handleClose: () => void;
    idSelected: number | undefined;
}

export default function CancelParishDialog({
    isOpen,
    handleClose,
    idSelected
}: CancelMassDialogProps) {
    const { formatMessage } = useIntl()
    const handleDeleteMass = () => {
        // TODO update data by deleting parish selected
        console.log(idSelected)
    }

    return (
        <Dialog
            open={isOpen}
            sx={{
                '& .MuiPaper-root': {
                    borderRadius: '15px',
                    maxWidth: 'fit-content',
                },
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.88)'
                },

            }}
        >
            <Box sx={{
                padding: '60px 100px',
                width: '634px',
                height: '254px',
                display: 'grid',
                rowGap: 1
            }}>
                <Typography
                    variant='h1'
                    textAlign='center'
                >
                    {formatMessage({ id: 'deleleParish' })}
                </Typography>
                <Typography
                    variant="body1"
                    textAlign='center'
                >
                    {formatMessage({ id: 'deleteParishMsg' })}

                </Typography>
                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: '1fr 1fr',
                    columnGap: '20px',
                    marginTop: '10px'
                }}>
                    <Button
                        variant='outlined'
                        onClick={handleClose}
                    >
                        {formatMessage({ id: 'cancel' })}
                    </Button>
                    <Button
                        variant='contained'
                        color="error"
                        onClick={handleDeleteMass}
                    >
                        {formatMessage({ id: 'delete' })}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
