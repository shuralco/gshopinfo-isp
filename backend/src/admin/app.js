import EmojiPickerField from './components/EmojiPickerField';

export default {
  config: {
    locales: ['uk', 'en'],
  },
  bootstrap(app) {
    // Реєструємо кастомний компонент для поля icon_emoji
    app.addComponents([
      {
        name: 'EmojiPickerField',
        Component: EmojiPickerField,
      },
    ]);
    
    // Кастомізуємо поле icon_emoji в категоріях
    app.addFields([
      {
        name: 'icon_emoji',
        type: 'string',
        intlLabel: {
          id: 'form.label.icon_emoji',
          defaultMessage: 'Іконка (емодзі)',
        },
        Component: EmojiPickerField,
      },
    ]);
  },
};