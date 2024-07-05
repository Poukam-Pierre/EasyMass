import * as yup from 'yup'

export const LetOfferMassSchema = yup.object().shape({
    phone: yup.number('numberChecked'),
    dateTime: yup.string().required('dateTimeChecked'),
    intention: yup
        .string()
        .required('intensionChecked')
        .max(300, 'intentionNumberChecked')
})
