import { Box, Button, Dialog, Tab, Tabs, TextField, Typography } from "@mui/material";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { useIntl } from "react-intl";

interface ModalPaymentProps {
    isOpen: boolean;
    onClose: () => void
}
type PaymentMethodField = Record<number, ReactNode>

interface PaymentMethods {
    image: {
        ref: string;
        height: number;
        width: number;
    }
    serviceName: string;
}

export default function ModalPayment({ isOpen, onClose }: ModalPaymentProps) {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
    const { formatMessage } = useIntl()
    const paymentMethod: PaymentMethods[] = [
        {
            serviceName: 'Orange Money',
            image: {
                ref: '/assets/om_logo.png',
                height: 24,
                width: 70
            }
        },
        {
            serviceName: 'MTN Mobile Money',
            image: {
                ref: '/assets/momo.png',
                height: 30,
                width: 60
            }
        },
        {
            serviceName: 'Visa',
            image: {
                ref: '/assets/visa.png',
                height: 20,
                width: 52
            }
        }
    ]
    const paymentMethodField: PaymentMethodField = {
        0: (
            <TextField
                placeholder="699 527 317"
                type='number'
                size='small'
                fullWidth
            />
        ),
        1: (
            <TextField
                placeholder="680 090 489"
                type='tel'
                size='small'
                fullWidth
            />
        ),
        2: (
            <Box sx={{
                display: 'grid',
                rowGap: 1,
            }}>
                <TextField
                    placeholder="6971 6491 0871"
                    type='number'
                    size='small'

                />
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto auto',
                    columnGap: 1
                }}>
                    <TextField
                        placeholder={formatMessage({ id: 'expiredDate' })}
                        type='number'
                        size='small'
                        sx={{
                            width: '200px'
                        }}
                    />
                    <TextField
                        placeholder="CVC"
                        type='number'
                        size='small'
                        sx={{
                            width: '75px'
                        }}
                    />
                </Box>

            </Box>
        ),
    }

    return (
        <Dialog
            onClose={onClose}
            open={isOpen}
            sx={{
                '& .MuiPaper-root': {
                    borderRadius: '15px',
                    maxWidth: 'fit-content',
                }
            }}

        >
            <Box sx={{
                padding: { laptop: '80px 40px', mobile: '40px 20px' },
                display: 'grid',
                rowGap: 2
            }}>
                <Typography
                    variant="h1"
                    textAlign='center'
                    sx={{
                        paddingBottom: 0,
                        display: { laptop: 'inherit', mobile: 'none' }
                    }}
                >
                    {formatMessage({ id: 'paymentMethod' })}
                </Typography>
                <Typography
                    variant="h2"
                    textAlign='center'
                    sx={{
                        paddingBottom: 0,
                        display: { laptop: 'none', mobile: 'inherit' }
                    }}
                >
                    {formatMessage({ id: 'paymentMethod' })}
                </Typography>
                <Box sx={{
                    display: 'grid',
                    rowGap: 2
                }}>
                    <Tabs
                        value={activeTabIndex}
                        onChange={(_, tabIndex) => setActiveTabIndex(tabIndex)}
                        indicatorColor='primary'
                        centered
                    >
                        {
                            paymentMethod.map(({ serviceName, image: { ref, height, width } }, index) => (
                                <Tab
                                    disableRipple
                                    key={index}
                                    icon={<Image src={ref} alt={serviceName} height={height} width={width} />}
                                />
                            ))
                        }
                    </Tabs>
                    {paymentMethodField[activeTabIndex]}
                </Box>
                <Button
                    variant="contained"
                >
                    {formatMessage({ id: 'confirmPayment' })}
                </Button>
            </Box>
        </Dialog>
    );
}
