import { registerEnumType } from "@nestjs/graphql";

export enum Message {
  SOMETHING_WENT_WRONG = 'Something went wrong',
  NO_DATA_FOUND = 'No data found',
  CREATE_FAILED = 'Create failed',
  UPDATED_FAILED = 'Updated failed',
  REMOVE_FAILED = 'Remove failed',
  UPLOAD_FAILED = 'Upload failed',
  BAD_REQUEST = 'Bad request',

  NO_MEMBER_NICK = 'No member nick found',
  USED_MEMBER_NICK_OR_PHONE = 'Member nick or phone is already used',
  BLOCKED_USER = 'You have been blocked',
  WRONG_PASSWORD = 'Wrong password, Try again',
  NOT_AUTHENTICATED = ' You Are Not authenticated, please login first',
  TOKEN_NOT_EXISTED = 'Bearer Token is not provided',
  ONLY_SPECIFIC_ROLES_ALLOWED = 'Allowed only for members with specific roles',
  NOT_ALLOWED_REQUEST = 'Not allowed request',
  PROVIDE_ALLOWED_FORMAT = 'Please provide jpg, jpeg or png images',
  SELF_SUBSCRIPTION_DENIED = 'Self subscription denied',
  MEMBER_BLOCKED = "MEMBER_BLOCKED",
}


export enum Direction {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(Direction, {
  name: 'Direction',
});
