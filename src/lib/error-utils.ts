/**
 * Translates API error codes into user-friendly Chinese messages.
 */
export function getErrorMessage(errorCode: string): string {
  const errorMap: Record<string, string> = {
    'invalid_credentials': 'The email or password you entered is incorrect.',
    'invalid_mfa_code': 'The verification code is invalid or has expired.',
    'mfa_required': 'Two-factor authentication is required for this account.',
    'invalid_access_token': 'Your session has expired. Please log in again.',
    'invalid_refresh_token': 'Session renewal failed. Please log in again.',
    'service_unavailable': 'The server is currently busy. Please try again later.',
    'invalid_request': 'The request parameters are invalid.',
    'admin_not_found': 'Admin account not found.',
    'account_disabled': 'This account has been disabled. Please contact the administrator.'
  };

  return errorMap[errorCode] || 'An unexpected error occurred. Please try again.';
}
