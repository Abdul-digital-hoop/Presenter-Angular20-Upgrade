const SuccessMessages = require('./SuccessMessages.json');
export function getMessage(section: string, code: string): string {
  if (SuccessMessages && SuccessMessages[section] && SuccessMessages[section][code]) {
    return SuccessMessages[section][code];
  } else {
    return 'Message not found';
  }
}
const ErrorMessages = require('./ErrorMessages.json');
export function getErrorMessage(section: string, code: string): string {
  if (ErrorMessages && ErrorMessages[section] && ErrorMessages[section][code]) {
    return ErrorMessages[section][code];
  } else {
    return 'Message not found';
  }
}