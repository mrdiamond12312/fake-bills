import { Switch as AntdSwitch, SwitchProps } from 'antd';
import React from 'react';
import { Controller } from 'react-hook-form';

const Switch: React.FC<TPropsFormInput & SwitchProps> = ({ name, control, ...restProps }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <AntdSwitch {...restProps} checked={!!field.value} onChange={field.onChange} />
    )}
  />
);

export default Switch;
