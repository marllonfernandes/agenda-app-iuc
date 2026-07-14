require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendInviteEmail = async (to, acceptLink) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: 'Convite para participar da organização',
    text: `Você foi convidado para participar da nossa organização.\n\nPor favor, clique no link abaixo para aceitar o convite:\n${acceptLink}`
  };
  return transporter.sendMail(mailOptions);
};


const {
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
} = require("./models");

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/app-unida";
const isProduction = process.env.NODE_ENV === 'production' || process.env.K_SERVICE; // K_SERVICE is present in Cloud Run

const mongooseOptions = {};

if (MONGODB_URI.includes('MONGODB-OIDC')) {
  if (isProduction) {
    mongooseOptions.authMechanismProperties = {
      ENVIRONMENT: "gcp",
      TOKEN_RESOURCE: "FIRESTORE"
    };
  } else {
    // Local development fallback using gcloud CLI
    const { execSync } = require('child_process');
    mongooseOptions.authMechanismProperties = {
      OIDC_CALLBACK: async () => {
        try {
          const token = execSync("gcloud auth print-access-token").toString().trim();
          return { accessToken: token };
        } catch (e) {
          console.error("GCP Auth Error: please run 'gcloud auth application-default login' or 'gcloud auth login'");
          throw e;
        }
      },
      TOKEN_RESOURCE: "FIRESTORE",
      ALLOWED_HOSTS: ["acf5c230-8f8f-4877-9ff6-125b6a07fa2b.nam5.firestore.goog"]
    };
  }
}

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => console.log("Connected to MongoDB:", MONGODB_URI.split('?')[0]))
  .catch(err => console.error("MongoDB connection error:", err));

// --- Admin Bootstrapping ---
const DEFAULT_ADMIN_EMAIL = process.env.SUPERUSER_EMAIL || "admin@exemplo.com";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

const ensureAdminUser = async () => {
  try {
    let adminUser = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, salt);
      adminUser = await User.create({
        email: DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        displayName: "Global Admin",
      });
      console.log(`Admin user ${DEFAULT_ADMIN_EMAIL} created with default password.`);
    } else {
      console.log(`Admin user ${DEFAULT_ADMIN_EMAIL} already exists.`);
    }
  } catch (error) {
    console.error("Error bootstrapping admin user:", error.message);
  }
};

mongoose.connection.once('open', ensureAdminUser);

const app = express();
app.use(cors());
app.use(express.json());

// --- Swagger Configuration ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Agenda App API",
      version: "1.0.0",
      description: "API de agenda multi-tenant e serverless",
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./index.js"], // Arquivos que contêm anotações JSDoc
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Middlewares ---

// Verify JWT Token
const authContext = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { uid, email, ... }
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

const SUPERUSER_EMAIL = process.env.SUPERUSER_EMAIL || "admin@exemplo.com";

const tenantContext = async (req, res, next) => {
  const orgId = req.headers["x-org-id"];

  // Global Admin Access Restricted to SUPERUSER_EMAIL
  if (req.path.startsWith("/admin/organizations")) {
    if (req.user && req.user.email === SUPERUSER_EMAIL) {
      return next();
    }
    return res.status(403).json({ error: "Forbidden: Superuser access only" });
  }

  // Invitation creation restricted to SUPERUSER_EMAIL
  if (req.path === "/admin/invite" && !orgId) {
    if (req.user && req.user.email === SUPERUSER_EMAIL) {
      return next();
    }
    return res.status(403).json({ error: "Forbidden: Superuser access only" });
  }

  if (!orgId) {
    return res.status(400).json({ error: "Missing x-org-id header" });
  }

  try {
    const membership = await Membership.findOne({ userId: req.user.uid, orgId });

    if (!membership) {
      if (req.user && req.user.email === SUPERUSER_EMAIL) {
        req.orgId = orgId;
        return next();
      }
      return res.status(403).json({ error: "Forbidden: Membership not found" });
    }

    if (membership.status && membership.status !== "active") {
      return res.status(403).json({ error: "Forbidden: Membership is pending activation" });
    }

    req.orgId = orgId;
    req.membership = membership;
    next();
  } catch (error) {
    res.status(500).json({ error: "Membership verification failed" });
  }
};

const checkPermission = (moduleName, action) => {
  return (req, res, next) => {
    if (req.user && req.user.email === SUPERUSER_EMAIL) return next();
    if (req.membership && req.membership.role === "admin") return next();
    
    if (
      req.membership &&
      req.membership.permissions &&
      req.membership.permissions[moduleName] &&
      req.membership.permissions[moduleName][action]
    ) {
      return next();
    }
    
    return res.status(403).json({ error: `Forbidden: Requires ${action} permission on ${moduleName}` });
  };
};

// --- Helper map id ---
const mapId = (doc) => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

// --- API ROUTES ---
const apiRouter = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Faz login local e retorna um JWT
 *     tags: [Auth]
 */
apiRouter.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { uid: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: mapId(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "E-mail e senha (mín. 6 caracteres) são obrigatórios" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "Este e-mail já está em uso" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    const token = jwt.sign(
      { uid: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: mapId(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. AUTHENTICATED ROUTES (General)
apiRouter.use(authContext);

apiRouter.get("/user/organizations", async (req, res) => {
  try {
    const memberships = await Membership.find({ userId: req.user.uid }).populate('orgId');
    const orgs = memberships.map(m => m.orgId).filter(org => org && org.isActive);
    res.json(orgs.map(mapId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/organizations/list", async (req, res) => {
  try {
    const orgs = await Organization.find({ isActive: true });
    res.json(orgs.map(mapId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/auth/join", async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const invite = await Invitation.findOne({ 
      code: inviteCode.toUpperCase(), 
      used: false 
    });

    if (!invite) {
      return res.status(404).json({ error: "Código de convite inválido ou expirado" });
    }

    // Create membership association
    await Membership.create({
      userId: req.user.uid,
      orgId: invite.orgId,
      status: "active",
      role: "member",
    });

    // Mark invite as used
    invite.used = true;
    await invite.save();

    res.json({ success: true, orgId: invite.orgId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/admin/organizations", async (req, res) => {
  try {
    const { name, slug, adminEmail } = req.body;
    const org = await Organization.create({ name, slug, isActive: true });
    
    let acceptLink = null;
    if (adminEmail) {
      const inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await Membership.create({
        orgId: org._id,
        invitedEmail: adminEmail.toLowerCase(),
        status: "pending",
        inviteToken,
        role: "admin",
        invitedBy: req.user.uid,
      });
      acceptLink = `${req.protocol}://${req.get("host")}/join?token=${inviteToken}`;
      // Persist link so it can be retrieved later
      await Organization.findByIdAndUpdate(org._id, {
        pendingInviteLink: acceptLink,
        pendingInviteEmail: adminEmail.toLowerCase()
      });
      await sendInviteEmail(adminEmail, acceptLink);
    }
    
    res.status(201).json({ id: org._id.toString(), acceptLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put("/admin/organizations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, isActive, adminEmail, reinvite } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (Object.keys(updateData).length > 0) {
      await Organization.findByIdAndUpdate(id, updateData);
    }

    let acceptLink = null;
    
    // Process admin email update or reinvite
    if (adminEmail || reinvite) {
      let adminMembership = await Membership.findOne({ orgId: id, role: "admin" });
      const inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const emailToUse = adminEmail || (adminMembership && adminMembership.invitedEmail);
      
      if (!emailToUse) {
        return res.status(400).json({ error: "Email do admin é necessário para convidar" });
      }

      if (adminMembership) {
        if (adminEmail && adminEmail.toLowerCase() !== adminMembership.invitedEmail) {
          adminMembership.userId = undefined;
        }
        adminMembership.invitedEmail = emailToUse.toLowerCase();
        adminMembership.status = "pending";
        adminMembership.inviteToken = inviteToken;
        await adminMembership.save();
      } else {
        await Membership.create({
          orgId: id,
          invitedEmail: emailToUse.toLowerCase(),
          status: "pending",
          inviteToken,
          role: "admin",
          invitedBy: req.user.uid,
        });
      }
      acceptLink = `${req.protocol}://${req.get("host")}/join?token=${inviteToken}`;
      // Persist link so it survives page reloads
      await Organization.findByIdAndUpdate(id, {
        pendingInviteLink: acceptLink,
        pendingInviteEmail: emailToUse.toLowerCase()
      });
      await sendInviteEmail(emailToUse, acceptLink);
    }
    
    res.json({ success: true, acceptLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete("/admin/organizations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Organization.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



apiRouter.post("/auth/accept-invite", async (req, res) => {
  try {
    const { token } = req.body;
    const membership = await Membership.findOne({ 
      inviteToken: token, 
      status: "pending" 
    });

    if (!membership) {
      return res.status(404).json({ error: "Invalid or expired invitation token" });
    }

    if (req.user.email !== membership.invitedEmail) {
      return res.status(403).json({ error: "Email mismatch: Please login with the invited email address" });
    }

    membership.userId = req.user.uid;
    membership.status = "active";
    membership.inviteToken = undefined;
    membership.joinedAt = new Date();
    await membership.save();

    if (membership.role === "admin") {
      await Organization.findByIdAndUpdate(membership.orgId, {
        $unset: { pendingInviteLink: 1, pendingInviteEmail: 1 }
      });
    }

    res.json({ success: true, orgId: membership.orgId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ORGANIZATION SPECIFIC ROUTES (Requires Membership)
apiRouter.use(tenantContext);

apiRouter.post("/admin/invite", checkPermission('team', 'create'), async (req, res) => {
  try {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await Invitation.create({
      code: inviteCode,
      orgId: req.orgId,
      createdBy: req.user.uid,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      used: false,
    });
    
    res.json({ inviteCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/invites", checkPermission('team', 'view'), async (req, res) => {
  try {
    const invites = await Invitation.find({
      orgId: req.orgId,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    res.json(invites.map(mapId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


apiRouter.delete("/invites/:id", checkPermission('team', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    await Invitation.findOneAndDelete({ _id: id, orgId: req.orgId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/admin/invite-email", checkPermission('team', 'create'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const existing = await Membership.findOne({ 
      orgId: req.orgId, 
      invitedEmail: email.toLowerCase() 
    });

    if (existing)
      return res.status(400).json({ error: "User already invited to this organization" });

    const inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await Membership.create({
      orgId: req.orgId,
      invitedEmail: email.toLowerCase(),
      status: "pending",
      inviteToken,
      role: "member",
      invitedBy: req.user.uid,
    });

    const acceptLink = `${req.protocol}://${req.get("host")}/join?token=${inviteToken}`;
    await sendInviteEmail(email, acceptLink);
    res.json({ success: true, message: "Invitation created and email sent", acceptLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/admin/organizations", async (req, res) => {
  try {
    const orgs = await Organization.find();
    
    // Fetch admins for each org
    const orgIds = orgs.map(o => o._id);
    const admins = await Membership.find({ orgId: { $in: orgIds }, role: "admin" });
    
    const mappedOrgs = orgs.map(org => {
      const o = mapId(org);
      const admin = admins.find(a => a.orgId.toString() === o.id);
      if (admin) {
        o.adminEmail = admin.invitedEmail;
        o.adminStatus = admin.status;
      }
      return o;
    });

    res.json(mappedOrgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /org/info — return org name for display in native header
apiRouter.get("/org/info", async (req, res) => {
  try {
    const org = await Organization.findById(req.orgId);
    if (!org) return res.status(404).json({ error: "Organização não encontrada" });
    res.json({ id: org._id, name: org.name, slug: org.slug });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/memberships", async (req, res) => {
  try {
    const m = await Membership.find({ orgId: req.orgId });
    res.json(m.map(mapId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


apiRouter.delete("/memberships/:id", checkPermission('team', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    await Membership.findOneAndDelete({ _id: id, orgId: req.orgId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put("/memberships/:id/permissions", async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions, role, avatar } = req.body;
    
    const targetMembership = await Membership.findById(id);
    if (!targetMembership) return res.status(404).json({ error: "Membership not found" });

    const isAdmin = req.user.email === SUPERUSER_EMAIL || (req.membership && req.membership.role === "admin");
    const isSelf = req.membership && req.membership._id.toString() === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: "Forbidden: Only admins can manage permissions" });
    }
    
    const updateData = {};
    if (isAdmin) {
      if (permissions !== undefined) updateData.permissions = permissions;
      if (role !== undefined) updateData.role = role;
    }
    if (avatar !== undefined) updateData.avatar = avatar;
    
    await Membership.findByIdAndUpdate(id, updateData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/groups", checkPermission('team', 'view'), async (req, res) => {
  try {
    const g = await Group.find({ orgId: req.orgId });
    res.json(g.map(mapId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/groups", checkPermission('team', 'create'), async (req, res) => {
  try {
    const doc = await Group.create({ ...req.body, orgId: req.orgId });
    res.status(201).json({ id: doc._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/members", checkPermission('team', 'view'), async (req, res) => {
  try {
    const m = await Member.find({ orgId: req.orgId });
    res.json(m.map(mapId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/members", checkPermission('team', 'create'), async (req, res) => {
  try {
    const doc = await Member.create({ ...req.body, orgId: req.orgId });
    res.status(201).json({ id: doc._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put("/members/:id", checkPermission('team', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    await Member.findByIdAndUpdate(id, { ...req.body, orgId: req.orgId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/events", checkPermission('events', 'view'), async (req, res) => {
  try {
    const evts = await Event.find({ orgId: req.orgId }).populate('songs');
    res.json(evts.map(e => {
      const mapped = mapId(e);
      if (mapped.songs) {
        mapped.songs = mapped.songs.map(mapId);
      }
      return mapped;
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/events", checkPermission('events', 'create'), async (req, res) => {
  try {
    const doc = await Event.create({ ...req.body, orgId: req.orgId });
    res.status(201).json({ id: doc._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put("/events/:id", checkPermission('events', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndUpdate(id, { ...req.body, orgId: req.orgId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/songs", checkPermission('repertoire', 'view'), async (req, res) => {
  try {
    const songs = await Song.find({ orgId: req.orgId });
    res.json(songs.map(mapId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/songs/import/youtube", checkPermission('repertoire', 'create'), async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL não fornecida" });

    let playlistId = null;
    let videoId = null;
    
    try {
      const urlObj = new URL(url);
      playlistId = urlObj.searchParams.get("list");
      videoId = urlObj.searchParams.get("v");
      
      // Also handle youtu.be/VIDEO_ID
      if (urlObj.hostname === "youtu.be") {
        videoId = urlObj.pathname.slice(1);
      }
    } catch (e) {
      return res.status(400).json({ error: "URL mal formatada." });
    }

    if (!playlistId && !videoId) {
      return res.status(400).json({ error: "URL inválida. Forneça um link de vídeo ou playlist do YouTube." });
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "YOUTUBE_API_KEY não configurada no servidor." });
    }

    let allItems = [];

    if (playlistId) {
      let nextPageToken = "";
      // Fetch all pages (limit to 5 pages = 250 songs max)
      for (let i = 0; i < 5; i++) {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}${nextPageToken ? '&pageToken=' + nextPageToken : ''}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Erro ao comunicar com a API do YouTube (Playlist)");
        }

        if (data.items) {
          allItems = allItems.concat(data.items);
        }

        if (data.nextPageToken) {
          nextPageToken = data.nextPageToken;
        } else {
          break;
        }
      }
    } else if (videoId) {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Erro ao comunicar com a API do YouTube (Video)");
      }

      if (data.items && data.items.length > 0) {
        // Mock the structure of playlistItems so it works with the existing mapping
        const videoSnippet = data.items[0].snippet;
        allItems.push({
          snippet: {
            title: videoSnippet.title,
            videoOwnerChannelTitle: videoSnippet.channelTitle,
            resourceId: { videoId: videoId },
            thumbnails: videoSnippet.thumbnails
          }
        });
      }
    }

    if (allItems.length === 0) {
      return res.status(404).json({ error: "Nenhum vídeo encontrado (ou é privado)." });
    }

    const songsToInsert = allItems.map(item => {
      const snippet = item.snippet;
      let title = snippet.title;
      let artist = snippet.videoOwnerChannelTitle || snippet.channelTitle || "";

      // Basic cleanup: often YouTube titles are "Artist - Title"
      if (title.includes(" - ")) {
        const parts = title.split(" - ");
        artist = parts[0].trim();
        title = parts.slice(1).join(" - ").trim();
      }

      return {
        orgId: req.orgId,
        title,
        artist,
        links: [{ url: `https://www.youtube.com/watch?v=${snippet.resourceId?.videoId}`, title: "YouTube" }],
        thumbnail: snippet.thumbnails?.default?.url
      };
    });

    // Filter out deleted/private videos
    const validSongs = songsToInsert.filter(s => s.title !== "Private video" && s.title !== "Deleted video");

    if (validSongs.length === 0) {
      return res.status(404).json({ error: "Apenas vídeos privados ou excluídos foram encontrados." });
    }

    const inserted = await Song.insertMany(validSongs);
    res.json({ success: true, count: inserted.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Setlists API
apiRouter.get("/setlists", checkPermission('repertoire', 'view'), async (req, res) => {
  try {
    const setlists = await Setlist.find({ orgId: req.orgId }).populate('songs');
    res.json(setlists.map(s => {
      const mapped = mapId(s);
      if (mapped.songs) {
        mapped.songs = mapped.songs.map(mapId);
      }
      return mapped;
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/setlists", checkPermission('repertoire', 'create'), async (req, res) => {
  try {
    const doc = await Setlist.create({ ...req.body, orgId: req.orgId });
    res.status(201).json({ id: doc._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put("/setlists/:id", checkPermission('repertoire', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    await Setlist.findByIdAndUpdate(id, { ...req.body, orgId: req.orgId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete("/setlists/:id", checkPermission('repertoire', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    await Setlist.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/songs", checkPermission('repertoire', 'create'), async (req, res) => {
  try {
    const doc = await Song.create({ 
      ...req.body, 
      links: req.body.links || [],
      orgId: req.orgId 
    });
    res.status(201).json({ id: doc._id.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put("/songs/:id", checkPermission('repertoire', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    await Song.findByIdAndUpdate(id, { ...req.body, orgId: req.orgId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete("/songs/:id", checkPermission('repertoire', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    await Song.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/groups/:groupId/associations", checkPermission('team', 'edit'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { targetId, type } = req.body; 

    await GroupAssociation.create({
      groupId,
      targetId,
      type,
      orgId: req.orgId
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/groups/:groupId/associations", checkPermission('team', 'view'), async (req, res) => {
  try {
    const { groupId } = req.params;
    const assocs = await GroupAssociation.find({ groupId });
    res.json(assocs.map(mapId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MOUNT API & STATIC SERVING ---
app.use("/api", apiRouter);

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    }
  }
}));

// Ensure missing static assets return 404 instead of falling back to index.html
app.use("/assets", (req, res) => {
  res.status(404).json({ error: "Asset not found" });
});

app.get("*", (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(publicPath, "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
