import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    singularName: 'release';
    pluralName: 'releases';
    displayName: 'Release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    timezone: Attribute.String;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    singularName: 'release-action';
    pluralName: 'release-actions';
    displayName: 'Release Action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    contentType: Attribute.String & Attribute.Required;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    isEntryValid: Attribute.Boolean;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          min: 1;
          max: 50;
        },
        number
      >;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBrandBrand extends Schema.CollectionType {
  collectionName: 'brands';
  info: {
    singularName: 'brand';
    pluralName: 'brands';
    displayName: 'Brand';
    description: 'Brand information';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String & Attribute.Required & Attribute.Unique;
    slug: Attribute.UID<'api::brand.brand', 'name'>;
    logo_url: Attribute.String;
    since_year: Attribute.Integer;
    badge_text: Attribute.String;
    description: Attribute.Text;
    gradient_colors: Attribute.JSON;
    catalog_link: Attribute.String;
    order: Attribute.Integer & Attribute.DefaultTo<0>;
    categories: Attribute.Relation<
      'api::brand.brand',
      'oneToMany',
      'api::category.category'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::brand.brand',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::brand.brand',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCategoryCategory extends Schema.CollectionType {
  collectionName: 'categories';
  info: {
    singularName: 'category';
    pluralName: 'categories';
    displayName: 'Category';
    description: '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u0457 \u0442\u043E\u0432\u0430\u0440\u0456\u0432 \u0434\u043B\u044F \u0431\u0440\u0435\u043D\u0434\u0456\u0432. \u0420\u0415\u041A\u041E\u041C\u0415\u041D\u0414\u0423\u0404\u041C\u041E: \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u0443\u0439\u0442\u0435 \u0435\u043C\u043E\u0434\u0437\u0456 \u0437\u0430\u043C\u0456\u0441\u0442\u044C SVG \u0434\u043B\u044F \u043F\u0440\u043E\u0441\u0442\u043E\u0442\u0438! \uD83C\uDF31\uD83D\uDCA7\uD83D\uDD27\uD83E\uDE93\u2702\uFE0F\u26A1\uD83C\uDF3F\uD83E\uDD16\uD83C\uDF33\uD83D\uDE9C';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    icon_emoji: Attribute.Enumeration<
      [
        'sprout\uD83C\uDF31',
        'droplet\uD83D\uDCA7',
        'wrench\uD83D\uDD27',
        'axe\uD83D\uDD2A',
        'scissors\u2702\uFE0F',
        'bolt\u26A1',
        'herb\uD83C\uDF3F',
        'robot\uD83E\uDD16',
        'tree\uD83C\uDF33',
        'tractor\uD83D\uDE9C',
        'house\uD83C\uDFE0',
        'rose\uD83C\uDF39',
        'leaf\uD83C\uDF43',
        'hibiscus\uD83C\uDF3A',
        'sunflower\uD83C\uDF3B',
        'ear_of_rice\uD83C\uDF3E',
        'clover\uD83C\uDF40',
        'hammer\uD83D\uDD28',
        'saw\u2694\uFE0F',
        'toolbox\uD83E\uDDF0',
        'gear\u2699\uFE0F',
        'nut_and_bolt\uD83D\uDD29',
        'ruler\uD83D\uDCCF'
      ]
    > &
      Attribute.Required;
    url: Attribute.String & Attribute.Required;
    brand: Attribute.Relation<
      'api::category.category',
      'manyToOne',
      'api::brand.brand'
    > &
      Attribute.Required;
    order: Attribute.Integer & Attribute.DefaultTo<0>;
    is_external: Attribute.Boolean & Attribute.DefaultTo<true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiContactMessageContactMessage extends Schema.CollectionType {
  collectionName: 'contact_messages';
  info: {
    singularName: 'contact-message';
    pluralName: 'contact-messages';
    displayName: 'Contact Messages';
    description: '\u041F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F \u0437 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043D\u043E\u0457 \u0444\u043E\u0440\u043C\u0438';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: true;
    };
    'content-type-builder': {
      visible: true;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    phone: Attribute.String & Attribute.Required;
    email: Attribute.Email & Attribute.Required;
    subject: Attribute.String;
    message: Attribute.Text;
    status: Attribute.Enumeration<['new', 'processed', 'archived']> &
      Attribute.DefaultTo<'new'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::contact-message.contact-message',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::contact-message.contact-message',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFeatureFeature extends Schema.CollectionType {
  collectionName: 'features';
  info: {
    singularName: 'feature';
    pluralName: 'features';
    displayName: 'Feature';
    description: 'Company features and benefits';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.Text;
    icon_name: Attribute.String;
    order: Attribute.Integer & Attribute.DefaultTo<0>;
    published: Attribute.Boolean & Attribute.DefaultTo<true>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::feature.feature',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::feature.feature',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiHeroSectionHeroSection extends Schema.SingleType {
  collectionName: 'hero_sections';
  info: {
    singularName: 'hero-section';
    pluralName: 'hero-sections';
    displayName: 'Hero Section';
    description: 'Landing page hero section';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    badge_text: Attribute.String;
    main_title: Attribute.String & Attribute.Required;
    subtitle: Attribute.String;
    description: Attribute.RichText;
    cta_primary_text: Attribute.String;
    cta_primary_link: Attribute.String;
    cta_secondary_text: Attribute.String;
    cta_secondary_link: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::hero-section.hero-section',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::hero-section.hero-section',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProductProduct extends Schema.CollectionType {
  collectionName: 'products';
  info: {
    singularName: 'product';
    pluralName: 'products';
    displayName: 'Product';
    description: 'Product catalog';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    slug: Attribute.UID<'api::product.product', 'title'>;
    description: Attribute.Text;
    category: Attribute.String;
    price: Attribute.Decimal & Attribute.Required;
    old_price: Attribute.Decimal;
    rating: Attribute.Decimal &
      Attribute.SetMinMax<
        {
          min: 0;
          max: 5;
        },
        number
      >;
    image_url: Attribute.String;
    images: Attribute.Media<'images', true>;
    badges: Attribute.JSON;
    availability: Attribute.Boolean & Attribute.DefaultTo<true>;
    featured: Attribute.Boolean & Attribute.DefaultTo<false>;
    order: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSiteSettingSiteSetting extends Schema.SingleType {
  collectionName: 'site_settings';
  info: {
    singularName: 'site-setting';
    pluralName: 'site-settings';
    displayName: 'Site Settings';
    description: '\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F \u0441\u0430\u0439\u0442\u0443';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    site_name: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'G-Shop'>;
    site_tagline: Attribute.String &
      Attribute.DefaultTo<'\u041E\u0444\u0456\u0446\u0456\u0439\u043D\u0438\u0439 \u0434\u0438\u043B\u0435\u0440 \u043F\u0440\u043E\u0432\u0456\u0434\u043D\u0438\u0445 \u0431\u0440\u0435\u043D\u0434\u0456\u0432'>;
    meta_title: Attribute.String &
      Attribute.DefaultTo<'G-Shop - Gardena, Fiskars, Husqvarna | \u041E\u0444\u0456\u0446\u0456\u0439\u043D\u0438\u0439 \u0434\u0438\u043B\u0435\u0440 \u0432 \u0423\u043A\u0440\u0430\u0457\u043D\u0456'>;
    meta_description: Attribute.Text &
      Attribute.DefaultTo<'Garden Tech - \u041E\u0444\u0456\u0446\u0456\u0439\u043D\u0438\u0439 \u0456\u043C\u043F\u043E\u0440\u0442\u0435\u0440 Gardena, Fiskars \u0442\u0430 Husqvarna \u0432 \u0423\u043A\u0440\u0430\u0457\u043D\u0456. \u041F\u0440\u043E\u0444\u0435\u0441\u0456\u0439\u043D\u0456 \u0440\u0456\u0448\u0435\u043D\u043D\u044F \u0434\u043B\u044F \u0441\u0430\u0434\u0443 \u0442\u0430 \u0433\u043E\u0440\u043E\u0434\u0443.'>;
    logo_url: Attribute.String &
      Attribute.DefaultTo<'https://g-shop.com.ua/image/catalog/g-shop_new_logo.png'>;
    nav_home: Attribute.String &
      Attribute.DefaultTo<'\u0413\u043E\u043B\u043E\u0432\u043D\u0430'>;
    nav_products: Attribute.String &
      Attribute.DefaultTo<'\u0422\u043E\u0432\u0430\u0440\u0438'>;
    nav_brands: Attribute.String &
      Attribute.DefaultTo<'\u0411\u0440\u0435\u043D\u0434\u0438'>;
    nav_about: Attribute.String &
      Attribute.DefaultTo<'\u041F\u0440\u043E \u043D\u0430\u0441'>;
    nav_contacts: Attribute.String &
      Attribute.DefaultTo<'\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u0438'>;
    footer_copyright: Attribute.Text &
      Attribute.DefaultTo<'\u00A9 2024 Garden Tech. \u0412\u0441\u0456 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0445\u0438\u0449\u0435\u043D\u0456.'>;
    footer_description: Attribute.Text &
      Attribute.DefaultTo<'\u041E\u0444\u0456\u0446\u0456\u0439\u043D\u0438\u0439 \u0434\u0438\u043B\u0435\u0440 \u043F\u0440\u043E\u0432\u0456\u0434\u043D\u0438\u0445 \u0441\u0432\u0456\u0442\u043E\u0432\u0438\u0445 \u0431\u0440\u0435\u043D\u0434\u0456\u0432 \u0441\u0430\u0434\u043E\u0432\u043E\u0457 \u0442\u0435\u0445\u043D\u0456\u043A\u0438. \u041F\u0440\u043E\u0444\u0435\u0441\u0456\u0439\u043D\u0456 \u0440\u0456\u0448\u0435\u043D\u043D\u044F \u0434\u043B\u044F \u0432\u0430\u0448\u043E\u0433\u043E \u0441\u0430\u0434\u0443.'>;
    phone: Attribute.String & Attribute.DefaultTo<'+38 (050) 300-04-04'>;
    email: Attribute.String & Attribute.DefaultTo<'info@gardentech.com.ua'>;
    address: Attribute.String &
      Attribute.DefaultTo<'\u043C. \u041A\u0438\u0457\u0432, \u0432\u0443\u043B. \u0425\u0440\u0435\u0449\u0430\u0442\u0438\u043A, 1'>;
    working_hours: Attribute.String &
      Attribute.DefaultTo<'\u041F\u043D-\u041F\u0442: 9:00 - 18:00'>;
    popular_products_title: Attribute.String &
      Attribute.DefaultTo<'\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u0456 \u0442\u043E\u0432\u0430\u0440\u0438'>;
    testimonials_badge: Attribute.String &
      Attribute.DefaultTo<'\u0412\u0456\u0434\u0433\u0443\u043A\u0438 \u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432'>;
    testimonials_title: Attribute.String &
      Attribute.DefaultTo<'\u0412\u0456\u0434\u0433\u0443\u043A\u0438 \u043D\u0430\u0448\u0438\u0445 \u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432'>;
    testimonials_subtitle: Attribute.String &
      Attribute.DefaultTo<'\u041F\u043E\u043D\u0430\u0434 10 000 \u0437\u0430\u0434\u043E\u0432\u043E\u043B\u0435\u043D\u0438\u0445 \u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432 \u043F\u043E \u0432\u0441\u0456\u0439 \u0423\u043A\u0440\u0430\u0457\u043D\u0456 \u0434\u043E\u0432\u0456\u0440\u044F\u044E\u0442\u044C \u043D\u0430\u043C \u0442\u0443\u0440\u0431\u043E\u0442\u0443 \u043F\u0440\u043E \u0441\u0432\u043E\u0457 \u0441\u0430\u0434\u0438'>;
    years_experience: Attribute.Integer & Attribute.DefaultTo<15>;
    happy_customers: Attribute.Integer & Attribute.DefaultTo<10000>;
    official_dealer_title: Attribute.String &
      Attribute.DefaultTo<'\u041E\u0444\u0456\u0446\u0456\u0439\u043D\u0438\u0439 \u0434\u0438\u043B\u0435\u0440'>;
    get_discount_button: Attribute.String &
      Attribute.DefaultTo<'\u041E\u0442\u0440\u0438\u043C\u0430\u0442\u0438 \u0437\u043D\u0438\u0436\u043A\u0443'>;
    features_badge: Attribute.String &
      Attribute.DefaultTo<'\u041D\u0430\u0448\u0456 \u043F\u0435\u0440\u0435\u0432\u0430\u0433\u0438'>;
    features_title: Attribute.String &
      Attribute.DefaultTo<'\u0427\u043E\u043C\u0443 \u043E\u0431\u0438\u0440\u0430\u044E\u0442\u044C \u043D\u0430\u0441'>;
    features_subtitle: Attribute.String &
      Attribute.DefaultTo<'\u0414\u043E\u0432\u0456\u0440\u0430 \u0442\u0438\u0441\u044F\u0447 \u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432 \u0456 \u0440\u043E\u043A\u0438 \u0434\u043E\u0441\u0432\u0456\u0434\u0443 \u0440\u043E\u0431\u043E\u0442\u0438 \u0437 \u043D\u0430\u0439\u043A\u0440\u0430\u0449\u0438\u043C\u0438 \u0441\u0432\u0456\u0442\u043E\u0432\u0438\u043C\u0438 \u0431\u0440\u0435\u043D\u0434\u0430\u043C\u0438 \u0441\u0430\u0434\u043E\u0432\u043E\u0457 \u0442\u0435\u0445\u043D\u0456\u043A\u0438'>;
    contact_title: Attribute.String &
      Attribute.DefaultTo<"\u0417\u0432'\u044F\u0436\u0456\u0442\u044C\u0441\u044F \u0437 \u043D\u0430\u043C\u0438">;
    contact_subtitle: Attribute.Text &
      Attribute.DefaultTo<'\u041C\u0430\u0454\u0442\u0435 \u043F\u0438\u0442\u0430\u043D\u043D\u044F \u0430\u0431\u043E \u043F\u043E\u0442\u0440\u0435\u0431\u0443\u0454\u0442\u0435 \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0456\u0457? \u041C\u0438 \u0437\u0430\u0432\u0436\u0434\u0438 \u0440\u0430\u0434\u0456 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0442\u0438 \u0432\u0430\u043C \u043E\u0431\u0440\u0430\u0442\u0438 \u043D\u0430\u0439\u043A\u0440\u0430\u0449\u0435 \u0440\u0456\u0448\u0435\u043D\u043D\u044F \u0434\u043B\u044F \u0432\u0430\u0448\u043E\u0433\u043E \u0441\u0430\u0434\u0443'>;
    form_title: Attribute.String &
      Attribute.DefaultTo<'\u0417\u0430\u043B\u0438\u0448\u0438\u0442\u0438 \u0437\u0430\u044F\u0432\u043A\u0443'>;
    form_name_label: Attribute.String &
      Attribute.DefaultTo<"\u0412\u0430\u0448\u0435 \u0456\u043C'\u044F *">;
    form_phone_label: Attribute.String &
      Attribute.DefaultTo<'\u0422\u0435\u043B\u0435\u0444\u043E\u043D *'>;
    form_email_label: Attribute.String & Attribute.DefaultTo<'Email *'>;
    form_subject_label: Attribute.String &
      Attribute.DefaultTo<'\u0422\u0435\u043C\u0430 \u0437\u0432\u0435\u0440\u043D\u0435\u043D\u043D\u044F'>;
    form_message_label: Attribute.String &
      Attribute.DefaultTo<'\u041F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F'>;
    form_submit_button: Attribute.String &
      Attribute.DefaultTo<'\u0412\u0456\u0434\u043F\u0440\u0430\u0432\u0438\u0442\u0438 \u0437\u0430\u044F\u0432\u043A\u0443'>;
    form_name_placeholder: Attribute.String &
      Attribute.DefaultTo<'\u0406\u0432\u0430\u043D'>;
    form_phone_placeholder: Attribute.String &
      Attribute.DefaultTo<'+38 (0__) ___-__-__'>;
    form_email_placeholder: Attribute.String &
      Attribute.DefaultTo<'ivan@example.com'>;
    form_message_placeholder: Attribute.String &
      Attribute.DefaultTo<'\u0420\u043E\u0437\u043A\u0430\u0436\u0456\u0442\u044C \u043F\u0440\u043E \u0432\u0430\u0448\u0435 \u043F\u0438\u0442\u0430\u043D\u043D\u044F...'>;
    form_option_1: Attribute.String &
      Attribute.DefaultTo<'\u041A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0456\u044F \u0449\u043E\u0434\u043E \u0442\u043E\u0432\u0430\u0440\u0443'>;
    form_option_2: Attribute.String &
      Attribute.DefaultTo<'\u041F\u0438\u0442\u0430\u043D\u043D\u044F \u043F\u0440\u043E \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0443'>;
    form_option_3: Attribute.String &
      Attribute.DefaultTo<'\u0413\u0430\u0440\u0430\u043D\u0442\u0456\u0439\u043D\u0435 \u043E\u0431\u0441\u043B\u0443\u0433\u043E\u0432\u0443\u0432\u0430\u043D\u043D\u044F'>;
    form_option_4: Attribute.String &
      Attribute.DefaultTo<'\u0421\u043F\u0456\u0432\u043F\u0440\u0430\u0446\u044F'>;
    form_option_5: Attribute.String &
      Attribute.DefaultTo<'\u0406\u043D\u0448\u0435'>;
    gardena_description: Attribute.Text &
      Attribute.DefaultTo<'\u041D\u0456\u043C\u0435\u0446\u044C\u043A\u0430 \u044F\u043A\u0456\u0441\u0442\u044C \u0442\u0430 \u0456\u043D\u043D\u043E\u0432\u0430\u0446\u0456\u0457 \u0432 \u0441\u0430\u0434\u043E\u0432\u0456\u0439 \u0442\u0435\u0445\u043D\u0456\u0446\u0456. Gardena - \u0441\u0432\u0456\u0442\u043E\u0432\u0438\u0439 \u043B\u0456\u0434\u0435\u0440 \u0443 \u0432\u0438\u0440\u043E\u0431\u043D\u0438\u0446\u0442\u0432\u0456 \u0441\u0438\u0441\u0442\u0435\u043C \u043F\u043E\u043B\u0438\u0432\u0443 \u0442\u0430 \u0441\u0430\u0434\u043E\u0432\u043E\u0433\u043E \u0456\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0443 \u0434\u043B\u044F \u043F\u0440\u043E\u0444\u0435\u0441\u0456\u043E\u043D\u0430\u043B\u0456\u0432 \u0442\u0430 \u0430\u043C\u0430\u0442\u043E\u0440\u0456\u0432.'>;
    fiskars_description: Attribute.Text &
      Attribute.DefaultTo<'\u0424\u0456\u043D\u0441\u044C\u043A\u0430 \u043D\u0430\u0434\u0456\u0439\u043D\u0456\u0441\u0442\u044C \u0442\u0430 \u0435\u0440\u0433\u043E\u043D\u043E\u043C\u0456\u043A\u0430 \u0432 \u043A\u043E\u0436\u043D\u043E\u043C\u0443 \u0456\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0456. Fiskars - \u0446\u0435 \u043F\u043E\u043D\u0430\u0434 370 \u0440\u043E\u043A\u0456\u0432 \u0442\u0440\u0430\u0434\u0438\u0446\u0456\u0439 \u0432\u0438\u0440\u043E\u0431\u043D\u0438\u0446\u0442\u0432\u0430 \u043D\u0430\u0439\u043A\u0440\u0430\u0449\u0438\u0445 \u0441\u0430\u0434\u043E\u0432\u0438\u0445 \u0456\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0456\u0432 \u0442\u0430 \u043F\u0440\u0438\u043B\u0430\u0434\u0434\u044F.'>;
    husqvarna_description: Attribute.Text &
      Attribute.DefaultTo<'\u0428\u0432\u0435\u0434\u0441\u044C\u043A\u0430 \u043F\u043E\u0442\u0443\u0436\u043D\u0456\u0441\u0442\u044C \u0442\u0430 \u0456\u043D\u043D\u043E\u0432\u0430\u0446\u0456\u0457 \u0432 \u043F\u0440\u043E\u0444\u0435\u0441\u0456\u0439\u043D\u0456\u0439 \u0441\u0430\u0434\u043E\u0432\u0456\u0439 \u0442\u0435\u0445\u043D\u0456\u0446\u0456. Husqvarna - \u0431\u0456\u043B\u044C\u0448\u0435 330 \u0440\u043E\u043A\u0456\u0432 \u0434\u043E\u0441\u0432\u0456\u0434\u0443 \u0441\u0442\u0432\u043E\u0440\u0435\u043D\u043D\u044F \u043D\u0430\u0439\u043D\u0430\u0434\u0456\u0439\u043D\u0456\u0448\u043E\u0457 \u0442\u0435\u0445\u043D\u0456\u043A\u0438 \u0434\u043B\u044F \u043B\u0456\u0441\u043E\u0432\u043E\u0433\u043E \u0442\u0430 \u0441\u0430\u0434\u043E\u0432\u043E\u0433\u043E \u0433\u043E\u0441\u043F\u043E\u0434\u0430\u0440\u0441\u0442\u0432\u0430.'>;
    happy_customers_label: Attribute.String &
      Attribute.DefaultTo<'\u0417\u0430\u0434\u043E\u0432\u043E\u043B\u0435\u043D\u0438\u0445 \u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432'>;
    support_label: Attribute.String &
      Attribute.DefaultTo<'\u041F\u0456\u0434\u0442\u0440\u0438\u043C\u043A\u0430 \u043A\u043B\u0456\u0454\u043D\u0442\u0456\u0432'>;
    years_experience_label: Attribute.String &
      Attribute.DefaultTo<'\u0420\u043E\u043A\u0456\u0432 \u0434\u043E\u0441\u0432\u0456\u0434\u0443'>;
    contact_address_full: Attribute.String &
      Attribute.DefaultTo<'\u043C. \u041A\u0438\u0457\u0432, \u0432\u0443\u043B. \u041C\u0438\u043A\u0456\u043B\u044C\u0441\u044C\u043A\u043E-\u0421\u043B\u043E\u0431\u0456\u0434\u0441\u044C\u043A\u0430, 4\u0414'>;
    footer_sites_title: Attribute.String &
      Attribute.DefaultTo<'\u041E\u0444\u0456\u0446\u0456\u0439\u043D\u0456 \u0441\u0430\u0439\u0442\u0438'>;
    footer_brands_title: Attribute.String &
      Attribute.DefaultTo<'\u041D\u0430\u0448\u0456 \u0431\u0440\u0435\u043D\u0434\u0438'>;
    footer_delivery_link: Attribute.String &
      Attribute.DefaultTo<'\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0442\u0430 \u043E\u043F\u043B\u0430\u0442\u0430'>;
    footer_warranty_link: Attribute.String &
      Attribute.DefaultTo<'\u0413\u0430\u0440\u0430\u043D\u0442\u0456\u044F \u0442\u0430 \u0441\u0435\u0440\u0432\u0456\u0441'>;
    footer_brand_gardena: Attribute.String & Attribute.DefaultTo<'Gardena'>;
    footer_brand_fiskars: Attribute.String & Attribute.DefaultTo<'Fiskars'>;
    footer_brand_husqvarna: Attribute.String & Attribute.DefaultTo<'Husqvarna'>;
    footer_brand_stihl: Attribute.String & Attribute.DefaultTo<'Stihl'>;
    footer_contact_title: Attribute.String &
      Attribute.DefaultTo<'\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u0438'>;
    footer_social_facebook: Attribute.String &
      Attribute.DefaultTo<'https://www.facebook.com/GShopUkraine'>;
    footer_social_instagram: Attribute.String &
      Attribute.DefaultTo<'https://www.instagram.com/g.shop.ua/'>;
    footer_social_telegram: Attribute.String &
      Attribute.DefaultTo<'https://t.me/Gardena_shop'>;
    footer_social_viber: Attribute.String &
      Attribute.DefaultTo<'viber://chat?number=+380986594242'>;
    footer_site_gardena: Attribute.String &
      Attribute.DefaultTo<'G-Shop Gardena'>;
    footer_site_fiskars: Attribute.String &
      Attribute.DefaultTo<'Fiskars Garden'>;
    footer_site_husqvarna: Attribute.String &
      Attribute.DefaultTo<'G-Shop Husqvarna'>;
    footer_site_gardena_url: Attribute.String &
      Attribute.DefaultTo<'https://g-shop.com.ua/'>;
    footer_site_fiskars_url: Attribute.String &
      Attribute.DefaultTo<'https://fiskars-garden.com.ua/'>;
    footer_site_husqvarna_url: Attribute.String &
      Attribute.DefaultTo<'https://g-shop.ua/'>;
    catalog_gardena_url: Attribute.String &
      Attribute.DefaultTo<'https://gardena.com.ua/catalog'>;
    catalog_fiskars_url: Attribute.String &
      Attribute.DefaultTo<'https://fiskars-garden.com.ua/catalog'>;
    catalog_husqvarna_url: Attribute.String &
      Attribute.DefaultTo<'https://g-shop.ua/catalog'>;
    catalog_gardena_button_text: Attribute.String &
      Attribute.DefaultTo<'\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 Gardena'>;
    catalog_fiskars_button_text: Attribute.String &
      Attribute.DefaultTo<'\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 Fiskars'>;
    catalog_husqvarna_button_text: Attribute.String &
      Attribute.DefaultTo<'\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 Husqvarna'>;
    catalog_links_target: Attribute.Enumeration<['_self', '_blank']> &
      Attribute.DefaultTo<'_blank'>;
    category_links_target: Attribute.Enumeration<['_self', '_blank']> &
      Attribute.DefaultTo<'_blank'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::site-setting.site-setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::site-setting.site-setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiTestimonialTestimonial extends Schema.CollectionType {
  collectionName: 'testimonials';
  info: {
    singularName: 'testimonial';
    pluralName: 'testimonials';
    displayName: 'Testimonial';
    description: 'Customer testimonials';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    customer_name: Attribute.String & Attribute.Required;
    avatar_color: Attribute.String;
    rating: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 1;
          max: 5;
        },
        number
      >;
    review_text: Attribute.Text & Attribute.Required;
    product_purchased: Attribute.String;
    date: Attribute.Date;
    published: Attribute.Boolean & Attribute.DefaultTo<false>;
    order: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::testimonial.testimonial',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::testimonial.testimonial',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'plugin::i18n.locale': PluginI18NLocale;
      'api::brand.brand': ApiBrandBrand;
      'api::category.category': ApiCategoryCategory;
      'api::contact-message.contact-message': ApiContactMessageContactMessage;
      'api::feature.feature': ApiFeatureFeature;
      'api::hero-section.hero-section': ApiHeroSectionHeroSection;
      'api::product.product': ApiProductProduct;
      'api::site-setting.site-setting': ApiSiteSettingSiteSetting;
      'api::testimonial.testimonial': ApiTestimonialTestimonial;
    }
  }
}
