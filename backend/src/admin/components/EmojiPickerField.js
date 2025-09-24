import React, { useState } from 'react';
import { Field, FieldLabel, FieldInput, FieldError } from '@strapi/design-system/Field';
import { TextInput } from '@strapi/design-system/TextInput';
import { Button } from '@strapi/design-system/Button';
import { Popover } from '@strapi/design-system/Popover';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { Typography } from '@strapi/design-system/Typography';
import { Box } from '@strapi/design-system/Box';

const EmojiPickerField = ({ 
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // Рекомендовані емодзі для садової техніки
  const gardenEmojis = [
    // Основні категорії
    '🌱', '💧', '🔧', '🪓', '✂️', '⚡', '🌿',
    // Спеціальна техніка  
    '🤖', '🌳', '🚜', '🏠',
    // Рослини та природа
    '🌹', '🍃', '🌺', '🌻', '🌾', '🍀',
    // Додаткові інструменти
    '🔨', '🪚', '🧰', '⚙️', '🔩', '📏'
  ];

  const handleEmojiSelect = (emoji) => {
    onChange({ target: { name, value: emoji } });
    setIsPopoverOpen(false);
  };

  const handleInputChange = (e) => {
    onChange({ target: { name, value: e.target.value } });
  };

  return (
    <Field name={name} required={required} error={error}>
      <FieldLabel>
        Іконка (емодзі)
      </FieldLabel>
      
      {/* Поточна вибрана іконка */}
      <Box marginBottom={2}>
        <Typography variant="pi" textColor="neutral600">
          {value ? `Поточна іконка: ${value}` : 'Іконка не обрана'}
        </Typography>
      </Box>
      
      {/* Інпут та кнопка вибору */}
      <Box display="flex" alignItems="center" gap={2}>
        <Box flex="1">
          <TextInput
            placeholder="Оберіть емодзі або введіть вручну"
            name={name}
            onChange={handleInputChange}
            value={value || ''}
            disabled={disabled}
            error={error}
          />
        </Box>
        
        <Popover 
          source={
            <Button 
              variant="secondary" 
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              disabled={disabled}
            >
              {value || '🎨'} Вибрати
            </Button>
          }
          spacing={8}
          onDismiss={() => setIsPopoverOpen(false)}
          padding={3}
        >
          {isPopoverOpen && (
            <Box minWidth="300px">
              <Typography variant="sigma" marginBottom={2}>
                Рекомендовані емодзі для садової техніки:
              </Typography>
              
              <Grid gap={2} gridCols={8}>
                {gardenEmojis.map((emoji, index) => (
                  <GridItem key={index}>
                    <Button
                      variant={value === emoji ? "primary" : "tertiary"}
                      onClick={() => handleEmojiSelect(emoji)}
                      size="S"
                      style={{ 
                        fontSize: '20px',
                        minHeight: '40px',
                        minWidth: '40px',
                        padding: '8px'
                      }}
                    >
                      {emoji}
                    </Button>
                  </GridItem>
                ))}
              </Grid>
              
              <Box marginTop={3} paddingTop={2} borderTop="1px solid #f0f0f0">
                <Typography variant="pi" textColor="neutral600">
                  💡 Підказка: Ви також можете ввести будь-який емодзі вручну в поле вище
                </Typography>
              </Box>
            </Box>
          )}
        </Popover>
      </Box>
      
      <FieldError />
      
      {description && (
        <Typography variant="pi" textColor="neutral600" marginTop={1}>
          {description}
        </Typography>
      )}
    </Field>
  );
};

export default EmojiPickerField;