import { AutoComplete as AntdAutoComplete, AutoCompleteProps } from 'antd';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { Controller } from 'react-hook-form';

import ValidateError from '@/components/Input/ValidateError';

/**
 * Select-with-search that also accepts free text (a value that isn't in the options).
 * `onPick` fires only when an option is chosen, so linked fields can auto-fill.
 */
const AutoComplete: React.FC<
  TPropsFormInput &
    Omit<AutoCompleteProps, 'onSelect'> & {
      onPick?: (value: string, option: any) => void;
    }
> = ({ name, control, className, disabled, placeholder, onPick, ...restProps }) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <Fragment>
        <AntdAutoComplete
          {...field}
          value={field.value ?? ''}
          allowClear
          {...restProps}
          onSelect={(value, option) => {
            field.onChange(value);
            onPick?.(String(value), option);
          }}
          disabled={disabled}
          placeholder={placeholder}
          status={error ? 'error' : ''}
          className={classNames('w-full', className)}
        />
        <ValidateError error={error} />
      </Fragment>
    )}
  />
);

export default AutoComplete;
