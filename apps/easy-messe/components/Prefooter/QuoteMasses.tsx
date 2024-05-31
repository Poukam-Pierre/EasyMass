import { theme } from "@easy-messe/libs/theme";
import LeftIcon from '@iconify-icons/fluent/chevron-left-20-regular';
import RightIcon from '@iconify-icons/fluent/chevron-right-20-regular';
import { Icon } from "@iconify/react";
import { Box, IconButton, Typography } from "@mui/material";
import { useState } from "react";

interface QuoteMass {
    quote: string;
    owner: string;
}

function QuoteMasses() {
    const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number>(0)


    const quoteNotes: QuoteMass[] = [
        {
            quote: "La prière est l'élévation de l'âme vers Dieu.",
            owner: "Anonymous",
        },
        {
            quote: "La messe est la plus grande prière qui soit. Vous pouvez ne rien comprendre à la liturgie, mais vous savez que vous êtes avec Dieu.",
            owner: "Anonymous",
        },
        {
            quote: "Demander une messe, c'est reconnaître que le sacrifice du Christ est présent et efficace pour nous aujourd'hui.",
            owner: "Sainte Thérèse de Lisieux",
        },
        {
            quote: "La messe est le sommet de toute prière et de toute activité chrétienne. C'est le moment où l'âme s'unit le plus étroitement à Dieu.",
            owner: "Anonymous",
        },
        {
            quote: "Demander une messe, c'est exprimer notre confiance en la puissance salvatrice du Christ et en l'intercession de la Vierge Marie et des saints.",
            owner: "Anonymous",
        },
        {
            quote: "La messe est le plus grand trésor de l'Église, car elle contient tout ce dont nous avons besoin : Jésus-Christ.",
            owner: "Anonymous",
        },
        {
            quote: "Demander une messe, c'est offrir à Dieu le meilleur de ce que nous avons, notre temps, notre prière, notre amour.",
            owner: "Anonymous",
        },
        {
            quote: "Demander une messe, c’est confier à Dieu une intention particulière, c’est lui confier ceux que l’on aime, ceux pour qui l’on prie.",
            owner: "Anonymous",
        },
        {
            quote: "La messe est la plus grande prière que nous puissions offrir pour les vivants et les défunts. Demander une messe, c’est offrir un trésor de grâce à ceux pour qui nous prions.",
            owner: "Anonymous",
        },
        {
            quote: "Demander une messe, c'est manifester sa foi en l'efficacité de la prière communautaire. Dans l'unité de la célébration, nos intentions individuelles s'unissent pour former une puissante supplication devant Dieu.",
            owner: "Anonymous",
        },
        {
            quote: "Dans la demande de messe réside la foi en l’intercession divine. C’est croire que nos prières sont entendues et que Dieu agit selon sa volonté pour le bien de tous.",
            owner: "Anonymous",
        },
        {
            quote: "Demander une messe, c’est s’associer à l’offrande de Jésus sur l’autel. C’est participer mystiquement au sacrifice rédempteur du Christ pour le salut du monde.",
            owner: "Anonymous",
        },
        {
            quote: "Demander une messe, c’est reconnaître notre besoin constant de la grâce divine. C’est humblement placer nos intentions entre les mains de Dieu et lui faire confiance pour répondre selon sa sagesse.",
            owner: "Anonymous",
        },
        {
            quote: "La demande de messe est une expression de la communion des saints, où les vivants et les défunts sont unis dans la prière et le sacrifice pour le bien de l'Église et du monde.",
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
                width: 'fit-content'
            }}>
                <Typography
                    variant='h4'
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
                    variant="body2"
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
                width: 'fit-content'
            }}>
                <IconButton
                    size="small"
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