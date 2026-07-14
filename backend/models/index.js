const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  displayName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  pendingInviteLink: { type: String, default: null },
  pendingInviteEmail: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  status: { type: String, enum: ['active', 'pending'], default: 'active' },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  avatar: { type: String, default: '👤' },
  permissions: {
    events: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    team: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    repertoire: {
      view: { type: Boolean, default: true },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    }
  },
  inviteToken: { type: String },
  invitedEmail: { type: String, lowercase: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const groupSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { strict: false }); // strict: false allows arbitrary fields as before

const eventSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  title: { type: String, required: true },
  date: { type: Date },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const songSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const invitationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const memberSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String },
  role: { type: String },
  avatar: { type: String, default: '👤' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const groupAssociationSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // could be Member id
  type: { type: String, enum: ['member', 'participant'] },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const setlistSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  title: { type: String, required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Organization = mongoose.model('Organization', organizationSchema);
const Membership = mongoose.model('Membership', membershipSchema);
const Member = mongoose.model('Member', memberSchema);
const Group = mongoose.model('Group', groupSchema);
const GroupAssociation = mongoose.model('GroupAssociation', groupAssociationSchema);
const Event = mongoose.model('Event', eventSchema);
const Song = mongoose.model('Song', songSchema);
const Setlist = mongoose.model('Setlist', setlistSchema);
const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = {
  User,
  Organization,
  Membership,
  Member,
  Group,
  GroupAssociation,
  Event,
  Song,
  Setlist,
  Invitation
};
