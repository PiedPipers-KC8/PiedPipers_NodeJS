import Cuid from 'cuid';
import _ from 'lodash';
import { Model } from '../../database';
import { Error as ErrorDTO, User } from '../../dto';
import { ValidateEquality, GenerateSalt, HashItem } from '../../utils';

const controller = {};

controller.login = async (mail, pwd) => {
  const trimmedEmail = mail.trim();
  const user = await Model.User.getByEmail(trimmedEmail);
  if (_.isNull(user)) {
    throw ErrorDTO.DTO(
      ErrorDTO.CODE_LOGIC_ERROR,
      ErrorDTO.ECODE_ITEM_NOT_FOUND,
      ErrorDTO.MSG_ITEM_NOT_FOUND
    );
  }
  if (ValidateEquality(user.salt, pwd, user.password)) {
    return User.DTO(user.email, user.cuid, user.dateAdded);
  }
  throw ErrorDTO.DTO(
    ErrorDTO.CODE_AUTHORIZATION_ERROR,
    ErrorDTO.ECODE_INVALID_PASSWORD,
    ErrorDTO.MSG_INVALID_PASSWORD
  );
};

controller.create = async (mail, pwd) => {
  const salt = GenerateSalt();
  const hashedPwd = HashItem(pwd.trim(), salt);
  const model = Model.User({
    email: mail,
    password: hashedPwd,
    cuid: Cuid(),
    salt
  });
  const { email, cuid, dateAdded } = await Model.User.createUser(model);
  await Model.Profile.create(cuid);
  return User.DTO(email, cuid, dateAdded);
};

controller.updatePassword = async (cuid, password) => {
  const { email, salt, dateAdded } = await Model.User.getByCuid(cuid);
  if (_.isNull(salt)) {
    throw ErrorDTO.DTO(
      ErrorDTO.CODE_LOGIC_ERROR,
      ErrorDTO.ECODE_ITEM_NOT_FOUND,
      ErrorDTO.MSG_ITEM_NOT_FOUND
    );
  }
  const hashedPwd = HashItem(password, salt);
  await Model.User.updatePassword(cuid, hashedPwd);
  return User.DTO(email, cuid, dateAdded);
};

controller.remove = async cuid => {
  await Model.User.clean(cuid);
};

export default controller;
