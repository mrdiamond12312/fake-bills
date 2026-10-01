import { DatePicker as AntdDatePicker, DatePickerProps } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { Fragment } from 'react';
import { Controller } from 'react-hook-form';

import ValidateError from '@/components/Input/ValidateError';

/** Stores an ISO string in the form, shows a dayjs picker. */
const DatePicker: React.FC<TPropsFormInput & DatePickerProps> = ({
  name,
  control,
  className,
  placeholder,
  ...restProps
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <Fragment>
        <AntdDatePicker
          {...restProps}
          value={field.value ? dayjs(field.value) : null}
          onChange={(value) => field.onChange(value ? value.toISOString() : undefined)}
          placeholder={placeholder}
          status={error ? 'error' : ''}
          className={classNames('w-full', className)}
        />
        <ValidateError error={error} />
      </Fragment>
    )}
  />
);

export default DatePicker;
