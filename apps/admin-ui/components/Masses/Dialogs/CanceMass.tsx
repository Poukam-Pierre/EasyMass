import { Box, Button, Dialog, Typography } from "@mui/material";


export default function CancelMassDialog({
    isOpen,
    handleClose
}: {
    isOpen: boolean,
    handleClose: () => void
}) {
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
                    Supprimer une messe
                </Typography>
                <Typography
                    variant="body1"
                    textAlign='center'
                >
                    Etes vous sûre de vouloir supprimer cette messe ?
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
                    >Annuler</Button>
                    <Button
                        variant='contained'
                        color="error"
                    >
                        Supprimer
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
