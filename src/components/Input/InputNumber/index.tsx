import { InputNumber as AntdInputNumber, InputNumberProps } from 'antd';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { Controller } from 'react-hook-form';

import ValidateError from '@/components/Input/ValidateError';

/** VND-friendly number input: "1,234,500" while typing, number in the form. */
const InputNumber: React.FC<TPropsFormInput & InputNumberProps<number>> = ({
  name,
  control,
  className,
  disabled,
  placeholder,
  ...restProps
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <Fragment>
        <AntdInputNumber<number>
          {...field}
          value={field.value ?? null}
          formatter={(value) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(`${value ?? ''}`.replace(/,/g, '')) as number}
          {...restProps}
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

export default InputNumber;
