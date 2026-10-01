import { Slider as AntdSlider, SliderSingleProps } from 'antd';
import React from 'react';
import { Controller } from 'react-hook-form';

const Slider: React.FC<TPropsFormInput & SliderSingleProps> = ({ name, control, ...restProps }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <AntdSlider {...restProps} value={field.value} onChange={field.onChange} />
    )}
  />
);

export default Slider;
