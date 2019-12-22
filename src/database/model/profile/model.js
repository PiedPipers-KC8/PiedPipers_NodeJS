import { model as Model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { ProfileSchema } from '../../schema';
import { Error } from '../../../dto';

const querySelect =
  'cuid dateAdded name location contactMe instruments photo videos description followers invitations friendlyLocation -_id';

ProfileSchema.index({ location: '2dsphere' });
ProfileSchema.plugin(mongoosePaginate);

const ProfileModel = Model('Profile', ProfileSchema);

ProfileModel.create = async cuid => {
  const model = ProfileModel({ cuid });
  try {
    return await model.save();
  } catch (err) {
    if (err.code === 11000) {
      throw Error.DUPLICATED;
    }
    throw Error.DATABASE(err.message);
  }
};

ProfileModel.getByCUID = async cuid => {
  try {
    const query = { cuid };
    return await ProfileModel.findOne(query).select(querySelect);
  } catch (err) {
    throw Error.DATABASE(err.message);
  }
};

ProfileModel.updateData = async (cuid, model) => {
  try {
    const query = { cuid };
    return await ProfileModel.updateOne(query, model);
  } catch (err) {
    throw Error.DATABASE(err.message);
  }
};

ProfileModel.search = async (filter, limit, skip) => {
  try {
    const options = {
      select: querySelect,
      limit,
      offset: skip,
      lean: false
    };
    return await ProfileModel.paginate(filter, options);
  } catch (err) {
    throw Error.DATABASE(err.message);
  }
};

ProfileModel.clean = async cuid => {
  try {
    await ProfileModel.deleteOne({ cuid });
  } catch (err) {
    throw Error.DATABASE(err.message);
  }
};

ProfileModel.getMultipleIds = async cuids => {
  const conditions = cuids.map(item => ({ cuid: item }));
  try {
    return await ProfileModel.find({ $or: conditions });
  } catch (err) {
    throw Error.DATABASE(err.message);
  }
};

export default ProfileModel;
