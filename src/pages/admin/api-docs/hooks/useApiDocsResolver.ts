import { yupResolver } from '@hookform/resolvers/yup';
import { useIntl } from '@umijs/max';
import * as yup from 'yup';

import { API_FORM_KEY, TApiFormFields } from '@/pages/admin/api-docs/helpers/apiFormKeys';

export const useApiDocsResolver = () => {
  const { formatMessage } = useIntl();

  const numberError = formatMessage({
    id: 'bills.form.validation.number',
    defaultMessage: 'Please enter a number!',
  });

  const ApiSchema = yup.object().shape({
    [API_FORM_KEY.template]: yup.string().required(),
    [API_FORM_KEY.language]: yup.string().oneOf(['vi', 'en']).required(),
    [API_FORM_KEY.seed]: yup.string().trim(),
    [API_FORM_KEY.vat]: yup
      .number()
      .typeError(numberError)
      .min(0, formatMessage({ id: 'apiDocs.validation.vat', defaultMessage: 'VAT must be 0–100' }))
      .max(
        100,
        formatMessage({ id: 'apiDocs.validation.vat', defaultMessage: 'VAT must be 0–100' }),
      )
      .required(),
    [API_FORM_KEY.name]: yup.string(),
    [API_FORM_KEY.format]: yup.string().oneOf(['png', 'svg']).required(),
    [API_FORM_KEY.scale]: yup.number().min(1).max(4).required(),
  });

  return {
    FormSchema: yupResolver(ApiSchema) as any as ReturnType<typeof yupResolver<TApiFormFields>>,
  };
};
