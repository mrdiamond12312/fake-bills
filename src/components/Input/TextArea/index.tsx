import { Input } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import React, { Fragment } from 'react';
import { Controller } from 'react-hook-form';

import ValidateError from '@/components/Input/ValidateError';

const TextArea: React.FC<TPropsFormInput & TextAreaProps> = ({
  name,
  control,
  placeholder,
  className,
  disabled,
  ...restProps
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <Fragment>
        <Input.TextArea
          {...field}
          value={field.value ?? ''}
          {...restProps}
          disabled={disabled}
          placeholder={placeholder}
          status={error ? 'error' : ''}
          className={className}
        />
        <ValidateError error={error} />
      </Fragment>
    )}
  />
);

export default TextArea;
