import * as yup from 'yup'

export const LetOfferMassSchema = yup.object().shape({
    phone: yup.number('Must be a number'),
    dateTime: yup.string().required('Date and Time must select.'),
    intention: yup
        .string()
        .required('Entrez votre intension de messe')
        .max(300, 'At most 300 words')
})
