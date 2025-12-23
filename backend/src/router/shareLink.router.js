

import express from 'express';
import { createShareLink, accessShareLink, getShareLinkAtVaultId, getAccessLogs, deleteShareLink, lockShareLink, unlockShareLink, updateShareLink, regenerateShareToken } from '../controllers/shareLink.controllers.js';
import verifyToken from '../middleware/verifyToken.middleware.js';

const router = express.Router();

router.post('/vaults/:vaultId/share', verifyToken, createShareLink);
router.post('/share/:token', accessShareLink);
router.get('/vaults/:vaultId/share-link',  getShareLinkAtVaultId);
router.get('/vaults/:vaultId/logs', verifyToken, getAccessLogs);
router.delete('/:id', verifyToken, deleteShareLink);
router.patch("/shares/:id/lock", verifyToken, lockShareLink);
router.patch("/shares/:id/unlock", verifyToken, unlockShareLink);
router.patch("/shares/:id/regenerate", verifyToken, regenerateShareToken);
router.patch("/shares/:id/update", verifyToken, updateShareLink);

export default router;