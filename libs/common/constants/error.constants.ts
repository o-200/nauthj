export const ERROR_MESSAGES = {
  AUTHORIZATION_HEADER_MISSING: 'Authorization header is missing',
  INVALID_AUTHORIZATION_HEADER: 'Invalid authorization header',
  NO_AUTHORIZATION_HEADER: 'No authorization header',
  USER_NOT_FOUND_IN_REQUEST: 'User not found in request',
  EMAIL_ALREADY_EXISTS: 'email already exists',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_FOUND_AFTER_UPDATE: 'User not found after update',
  USER_NOT_FOUND_AFTER_REFRESH_TOKEN_UPDATE:
    'User not found after refresh token update',
  CANNOT_SEND_PAYMENT_TO_YOURSELF: 'Cannot send payment to yourself',
  AMOUNT_MUST_BE_GREATER_THAN_ZERO: 'Amount must be greater than 0',
  SENDER_NOT_FOUND: 'Sender not found',
  RECIPIENT_NOT_FOUND: 'Recipient not found',
  INSUFFICIENT_BALANCE:
    'Your balance is not sufficient to complete the transaction.',
  USER_MAX_AVATARS: 'User can only have maximum 5 avatars',
  AVATAR_NOT_FOUND: 'Avatar not found',
  AVATAR_NOT_CREATED_BY_CURRENT_USER:
    'That avatar isnt created by current user',
  FILE_REQUIRED: 'File is required',
  FILE_TOO_LARGE_MAX_5MB: 'File is too large. Max size is 5MB',
  UNKNOWN_ERROR: 'Unknown error',
  SOMETHING_WENT_WRONG: 'Something went wrong',
} as const;
