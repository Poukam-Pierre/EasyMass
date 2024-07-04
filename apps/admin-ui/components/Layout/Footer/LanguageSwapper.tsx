import { TextField, MenuItem } from "@mui/material";
import { useLanguage } from "@easy-messe/libs/theme";

type CorrespondingShortLanguage = Record<string, string>;

export default function LanguageSwapper() {
    const correspondingShortLanguage: CorrespondingShortLanguage = {
        'fr': 'Français',
        'en': 'Anglais'
    }
    const supportedLanguages: string[] = ['Français', 'Anglais']
    const { activeLanguage, languageDispatch } = useLanguage()

    return (
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
                    color: '#2F3A45',
                    fontSize: 12,
                    fontWeight: 600,
                },
            }}
        >
            {supportedLanguages.map((language, index) => (
                <MenuItem key={index} value={language}>
                    {language}
                </MenuItem>
            ))}
        </TextField>
    );
}
