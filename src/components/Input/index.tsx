import type { InputProps } from 'antd';
import { Input } from 'antd';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { Controller } from 'react-hook-form';

import ValidateError from '@/components/Input/ValidateError';

const InputText: React.FC<TPropsFormInput & InputProps> = ({
  name,
  control,
  type,
  placeholder,
  className,
  disabled,
  ...restProps
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        return (
          <Fragment>
            <Input
              {...field}
              value={field.value ?? ''}
              {...restProps}
              disabled={disabled}
              type={type}
              placeholder={placeholder}
              status={error ? 'error' : ''}
              className={classNames(error ? `error` : `focus hover`, className)}
            />
            <ValidateError error={error} />
          </Fragment>
        );
      }}
    />
  );
};

export default InputText;
