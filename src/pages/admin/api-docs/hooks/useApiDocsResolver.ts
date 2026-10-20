import { yupResolver } from '@hookform/resolvers/yup';
import { useIntl } from '@umijs/max';
import * as yup from 'yup';

import {
  API_FORM_KEY,
  API_MAX_ITEMS,
  TApiFormFields,
  parseBody,
} from '@/pages/admin/api-docs/helpers/apiFormKeys';

export const useApiDocsResolver = () => {
  const { formatMessage } = useIntl();

  const ApiSchema = yup.object().shape({
    [API_FORM_KEY.method]: yup.string().oneOf(['GET', 'POST']).required(),
    [API_FORM_KEY.format]: yup.string().oneOf(['png', 'svg']).required(),
    [API_FORM_KEY.scale]: yup.number().min(1).max(4).required(),
    [API_FORM_KEY.body]: yup
      .string()
      .test(
        'json',
        formatMessage({
          id: 'apiDocs.validation.json',
          defaultMessage: 'The body must be a JSON object, e.g. \'{ "templateId": "winmart" }\'',
        }),
        (value) => parseBody(value) !== undefined,
      )
      .test(
        'items',
        formatMessage(
          { id: 'apiDocs.validation.items', defaultMessage: 'At most {max} items per bill' },
          { max: API_MAX_ITEMS },
        ),
        (value) => {
          const items = parseBody(value)?.items;
          return !Array.isArray(items) || items.length <= API_MAX_ITEMS;
        },
      ),
  });

  return {
    FormSchema: yupResolver(ApiSchema) as any as ReturnType<typeof yupResolver<TApiFormFields>>,
  };
};
