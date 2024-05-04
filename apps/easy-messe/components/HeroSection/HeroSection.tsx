import { Box, Button, Typography } from "@mui/material";
import HeroImage from "./HeroImage";
import { theme } from "@easy-messe/libs/theme";
import { useIntl } from "react-intl";

export default function HeroSection() {
    const { formatMessage } = useIntl()
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            padding: '0px 90px'

        }}>
            <Box sx={{
                display: 'grid',
                alignItems: 'end',
                paddingTop: '130px',
                rowGap: '35px'
            }}>
                <Typography sx={{
                    fontSize: '56px',
                    lineHeight: '60px',
                    paragraphSpacing: '20px',
                    fontWeight: 700,
                    color: theme.common.titleActive,
                    width: '900px'
                }}>
                    {formatMessage({ id: 'heroMessage' })}
                </Typography>
                <Typography variant="h4" sx={{
                    lineHeight: '28px',
                    letterSpacing: 0,
                    paddingBottom: 0,
                    fontWeight: 700,
                    width: '750px'
                }}>
                    {formatMessage({ id: 'subtitleHeroMessage' })}
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        width: 'fit-content',
                        height: 'fit-content'
                    }}
                >
                    {formatMessage({ id: 'orderMass' })}

                </Button>
            </Box>
            <HeroImage />
        </Box>
    );
}
