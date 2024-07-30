import { TextField, MenuItem, Box } from "@mui/material";
import { useLanguage } from "@easy-messe/libs/theme";
import languageIcon from '@iconify-icons/material-symbols/language'
import { Icon } from "@iconify/react";

type CorrespondingShortLanguage = Record<string, string>;

export default function LanguageSwapper() {
    const correspondingShortLanguage: CorrespondingShortLanguage = {
        'fr': 'Français',
        'en': 'English'
    }
    enum supportedLanguages {
        english = 'English',
        french = 'Français',
    }
    const { activeLanguage, languageDispatch } = useLanguage()
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            width: 'fit-content',
            alignItems: 'center'
        }}>
            <Icon icon={languageIcon} fontSize={20} />
            <TextField
                size="small"
                select
                value={correspondingShortLanguage[activeLanguage]}
                onChange={() =>
                    languageDispatch({
                        type: activeLanguage === 'fr' ? 'USE_ENGLISH' : 'USE_FRENCH'
                    })
                }
                sx={{
                    '&.MuiFormControl-root': {
                        background: 'transparent',
                    },
                    '& .MuiInputBase-root': {
                        background: 'transparent',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none !important'
                    },
                    '& .MuiSelect-select': {
                        paddingLeft: 0.7,
                        color: '#2F3A45',
                        fontSize: 12,
                        fontWeight: 600,
                    },
                }}
            >
                {Object.values(supportedLanguages).map((language, index) => (
                    <MenuItem key={index} value={language}>
                        {language}
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    );
}
