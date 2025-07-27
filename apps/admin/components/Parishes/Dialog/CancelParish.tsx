import { apiMiddleware, errorHandling } from "@easy-messe/libs/utils";
import { Box, Button, CircularProgress, Dialog, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";

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
    const { push } = useRouter()
    const [isDeletePending, setIsDeletePending] = useState<boolean>(false)

    const handleDeleteMass = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            push('/login')
            return
        }

        setIsDeletePending(true)
        await apiMiddleware({
            url: `/parishes/${idSelected}`,
            method: 'DELETE',
            accessToken: token,
            onSuccess: (response: any) => {
                toast.success(formatMessage({ id: response.message }))
                console.log(response)
            },
            onFailure: (error) => {
                errorHandling({ error, formatMessage, redirect: push })
            },
            onFinally: () => {
                setIsDeletePending(false)
                handleClose()
            }
        })
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
                        disabled={isDeletePending}
                    >
                        {formatMessage({ id: 'cancel' })}
                    </Button>
                    <Button
                        variant='contained'
                        color="error"
                        onClick={handleDeleteMass}
                        disabled={isDeletePending}
                    >
                        {isDeletePending ? (
                            <CircularProgress size={20} />
                        ) :
                            formatMessage({ id: 'delete' })
                        }
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
