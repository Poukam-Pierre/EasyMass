import { Box, Button, Dialog, Typography } from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import api, { apiErrorMessage } from "../../../lib/api";

interface CancelMassDialogProps {
    isOpen: boolean;
    handleClose: () => void;
    idSelected: string | undefined;
    onDeleted: () => void;
}

export default function CancelMassDialog({
    isOpen,
    handleClose,
    idSelected,
    onDeleted
}: CancelMassDialogProps) {
    const { formatMessage } = useIntl()
    const [isDeleting, setIsDeleting] = useState(false)
    const handleDeleteMass = async () => {
        if (!idSelected) return
        setIsDeleting(true)
        try {
            await api.delete(`/masses/${idSelected}`);
            toast.success(formatMessage({ id: 'saved' }));
            onDeleted();
            handleClose();
        } catch (error) {
            toast.error(apiErrorMessage(error, formatMessage({ id: 'genericErrorMsg' })));
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
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
                    {formatMessage({ id: 'deleteMass' })}
                </Typography>
                <Typography
                    variant="body1"
                    textAlign='center'
                >
                    {formatMessage({ id: 'deleteMassMsg' })}

                </Typography>
                <Typography
                    variant="body2"
                    textAlign='center'
                    sx={{
                        color: 'var(--error)'
                    }}
                >
                    {formatMessage({ id: 'deleteMassMsgWarning' })}

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
                        disabled={isDeleting}
                    >
                        {formatMessage({ id: isDeleting ? 'processing' : 'delete' })}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
