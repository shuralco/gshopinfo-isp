import React from 'react';
import { Field, FieldLabel, FieldInput, FieldError } from '@strapi/design-system/Field';
import { TextInput } from '@strapi/design-system/TextInput';
import { Textarea } from '@strapi/design-system/Textarea';
import { Typography } from '@strapi/design-system/Typography';
import { Box } from '@strapi/design-system/Box';

const IconPathField = ({ 
  description,
  disabled,
  error,
  intlLabel,
  name,
  onChange,
  placeholder,
  required,
  value,
}) => {
  const handleChange = (e) => {
    onChange({ target: { name, value: e.target.value } });
  };

  const truncatedValue = value && value.length > 50 
    ? `${value.substring(0, 50)}...` 
    : value;

  return (
    <Field name={name} required={required} error={error}>
      <FieldLabel>
        Icon Path (SVG)
      </FieldLabel>
      
      {/* Показуємо скорочену версію для перегляду */}
      <Box marginBottom={2}>
        <Typography variant="pi" textColor="neutral600">
          {truncatedValue ? `Поточний path: ${truncatedValue}` : 'SVG path не встановлено'}
        </Typography>
      </Box>
      
      {/* Текстове поле для редагування */}
      <Textarea
        placeholder="Введіть SVG path дані (наприклад: M12 2l3.09 6.26L22 9.27...)"
        name={name}
        onChange={handleChange}
        value={value || ''}
        disabled={disabled}
        error={error}
        rows={3}
      />
      
      <FieldError />
      
      {description && (
        <Typography variant="pi" textColor="neutral600" marginTop={1}>
          {description}
        </Typography>
      )}
    </Field>
  );
};

export default IconPathField;