import { TextField, MenuItem } from "@mui/material";
import { supportedLanguages, useLanguage } from "@easy-messe/libs/theme";

export default function LanguageSwapper() {
    const { activeLanguage, languageDispatch } = useLanguage()
    return (
        <TextField
            size="small"
            select
            value={activeLanguage}
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
