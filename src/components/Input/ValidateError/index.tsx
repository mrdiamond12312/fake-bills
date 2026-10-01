import React from 'react';
import type { FieldError } from 'react-hook-form';

type TValidateError = {
  error: FieldError | undefined;
};

const ValidateError: React.FC<TValidateError> = ({ error }) => {
  if (!error?.message) return null;
  return <p className="px-3 pt-1 m-0 text-body-3-regular text-error-5">{error.message}</p>;
};

export default ValidateError;
