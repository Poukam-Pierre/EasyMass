import { theme } from "@easy-messe/libs/theme";
import LeftIcon from '@iconify-icons/fluent/chevron-left-20-regular';
import RightIcon from '@iconify-icons/fluent/chevron-right-20-regular';
import { Icon } from "@iconify/react";
import { Box, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";

interface QuoteMass {
    quote: string;
    owner: string;
}

function QuoteMasses() {
    const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number>(0)
    const { formatMessage } = useIntl()

    const quoteNotes: QuoteMass[] = [
        {
            quote: formatMessage({ id: 'quoteOne' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteTwo' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteTree' }),
            owner: "Sainte Thérèse de Lisieux",
        },
        {
            quote: formatMessage({ id: 'quoteFour' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteFive' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteSix' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteSeven' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteEight' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteNine' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteTen' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteEleven' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteTwelve' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteThirteen' }),
            owner: "Anonymous",
        },
        {
            quote: formatMessage({ id: 'quoteFourteen' }),
            owner: "Anonymous",
        }
    ]

    const handleOnNext = () => {
        if (selectedQuoteIndex >= quoteNotes.length - 1) {
            setSelectedQuoteIndex(0)
        } else {
            setSelectedQuoteIndex(selectedQuoteIndex + 1)
        }
    }
    const handleOnPrevious = () => {
        if (selectedQuoteIndex <= 0) {
            setSelectedQuoteIndex(quoteNotes.length - 1)
        } else {
            setSelectedQuoteIndex(selectedQuoteIndex - 1)
        }
    }
    return (
        <Box sx={{
            display: 'grid',
            rowGap: 2
        }}>
            <Box sx={{
                width: 'fit-content',
                textAlign: { laptop: 'inherit', mobile: 'center' }
            }}>
                <Typography
                    variant='h3'
                    color={theme.palette.primary.contrastText}
                    sx={{
                        paddingBottom: '5px',
                        maxWidth: '600px',
                        lineHeight: '30px'
                    }}
                >
                    {`" ${quoteNotes[selectedQuoteIndex].quote} "`}
                </Typography>
                <Typography
                    variant="body1"
                    color={theme.palette.primary.contrastText}
                    sx={{
                        justifySelf: 'end'
                    }}
                >
                    {`- ${quoteNotes[selectedQuoteIndex].owner} -`}
                </Typography>
            </Box>
            <Box sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                columnGap: 2,
                width: 'fit-content',
                justifySelf: { laptop: 'inherit', mobile: 'center' }
            }}>
                <IconButton
                    size="small"
                    disableRipple
                    sx={{
                        bgcolor: theme.palette.primary.contrastText
                    }}
                    onClick={handleOnPrevious}
                >
                    <Icon
                        icon={LeftIcon}
                        fontSize={20}
                    />
                </IconButton>
                <IconButton
                    size="small"
                    disableRipple
                    onClick={handleOnNext}
                    sx={{
                        bgcolor: theme.palette.primary.contrastText
                    }}
                >
                    <Icon
                        icon={RightIcon}
                        fontSize={20}
                    />
                </IconButton>
            </Box>
        </Box>

    );
}

export default QuoteMasses;